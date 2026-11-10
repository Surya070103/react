import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useMatch, useNavigate } from 'react-router-dom'
import './App.css'
import { api } from './services/api'
import { filterProductsByPrice } from './utils/productFilter'
import ProductCatalog from './components/ProductCatalog'
import CustomerOrders from './components/CustomerOrders'
import AdminOrders from './components/AdminOrders'
import CartCheckout from './components/CartCheckout'
import AdminCustomers from './components/AdminCustomers'
import AdminProducts from './components/AdminProducts'
import { formatInr, getPaymentMethodLabel } from './utils/formatters'

const defaultProducts = [
  {
    id: 't-shirt',
    name: 'T-shirt',
    price: 499,
    image: '/images/everyday-shirt.png',
    category: 'Apparel',
    description: 'A classic, comfortable cotton T-shirt designed for everyday wear.',
  },
  {
    id: 'keyboard-cover',
    name: 'Keyboard Cover',
    price: 250,
    image: '/images/keyboard-cover.jpg',
    category: 'Accessories',
    description: 'A slim protective cover that keeps your keyboard clean and comfortable to use.',
  },
  {
    id: 'wireless-mouse',
    name: 'Wireless Mouse',
    price: 399,
    image: '/images/mouse.jpg',
    category: 'Electronics',
    description: 'A reliable wireless mouse with smooth tracking for work or everyday browsing.',
  },
  {
    id: 'smartphone',
    name: 'Smartphone',
    price: 96699,
    image: '/images/smartphone.png',
    category: 'Electronics',
    description: 'A modern smartphone for staying connected, capturing photos, and enjoying apps.',
  },
]

const productImageClass = (product) => (
  product.id === 'smartphone' ? 'product-photo-contain' : ''
)

const savedCartKey = 'shop-easy-cart-id'

const getProductImage = (product) => product.image
const restoreBuiltInImage = () => { }

const toAdminCustomer = (user) => ({
  id: String(user.id),
  customerId: `CUST${String(user.id).padStart(3, '0')}`,
  fullName: user.name,
  email: user.email,
  phone: String(user.phoneno),
  status: user.status.toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
  orders: Number(user.orders || 0),
  joined: new Date(user.joined).toISOString(),
  actions: user.actions || '',
})

const loadProducts = async () => {
  try {
    const products = await api.getProducts()
    return { products, message: '' }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error.'
    console.error('Failed to load products from API:', reason)
    return { products: defaultProducts, message: `Could not load products from backend: ${reason}` }
  }
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const productMatch = useMatch('/products/:productId')
  const editProductMatch = useMatch('/admin/editproducts/:productId')
  const deleteProductMatch = useMatch('/admin/deleteproducts/:productId')
  const routeViews = {
    '/login': 'store',
    '/products': 'store',
    '/cart': 'cart',
    '/wishlist': 'wishlist',
    '/orders': 'customer-orders',
    '/admin/login': 'admin-login',
    '/admin/products': 'admin-products',
    '/admin/customers': 'admin-customers',
    '/admin/orders': 'admin-orders',
    '/admin/addproducts': 'admin-addproducts',
  }
  const activeView = productMatch
    ? 'product-details'
    : editProductMatch
      ? 'admin-editproducts'
      : deleteProductMatch
        ? 'admin-deleteproducts'
        : routeViews[location.pathname] || 'store'
  const selectedProductId = productMatch?.params.productId || null
  const editingProductId = editProductMatch?.params.productId || null
  const [productStore, setProductStore] = useState({ products: defaultProducts, message: '' })
  const [isLoading, setIsLoading] = useState(true)
  const products = productStore.products
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const filteredProducts = filterProductsByPrice(products, priceRange.min, priceRange.max)
  const selectedAdminProduct = products.find((product) => product.id === (editingProductId || deleteProductMatch?.params.productId))
  const [cartKey] = useState(() => {
    const storedKey = window.localStorage.getItem(savedCartKey)
    if (storedKey && /^[0-9a-f-]{36}$/i.test(storedKey)) return storedKey
    const newKey = crypto.randomUUID()
    window.localStorage.setItem(savedCartKey, newKey)
    return newKey
  })
  const [cart, setCart] = useState(() => new Map())
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [isCartReady, setIsCartReady] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [orderStore, setOrderStore] = useState({ orders: [], message: '' })
  const [orderConfirmation, setOrderConfirmation] = useState('')
  const orders = orderStore.orders
  const [adminCustomerStore, setAdminCustomerStore] = useState({ customers: [], message: '' })
  const [isCustomerLoading, setIsCustomerLoading] = useState(true)
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState(null)
  const [wishlist, setWishlist] = useState(() => new Set())
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [customerEmail, setCustomerEmail] = useState('')
  const [authUser, setAuthUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authMessage, setAuthMessage] = useState('')
  const [isRegisteringAuth, setIsRegisteringAuth] = useState(false)
  const [isAuthSaving, setIsAuthSaving] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminAuthMessage, setAdminAuthMessage] = useState('')
  const [adminFormMessage, setAdminFormMessage] = useState('')
  const [editingCustomerId, setEditingCustomerId] = useState(null)
  const [customerFormOpen, setCustomerFormOpen] = useState(false)
  const [isCustomerSaving, setIsCustomerSaving] = useState(false)
  const [resettingCustomerId, setResettingCustomerId] = useState(null)
  const [isPasswordResetSaving, setIsPasswordResetSaving] = useState(false)
  const [passwordResetMessage, setPasswordResetMessage] = useState('')
  const cartCount = [...cart.values()].reduce((total, quantity) => total + quantity, 0)

  useEffect(() => {
    api.getCurrentUser()
      .then((user) => {
        setAuthUser(user)
        setCustomerEmail(user.email)
        setIsLoggedIn(user.role === 'customer')
        setIsAdminLoggedIn(user.role === 'admin')
      })
      .catch((error) => {
        if (!(error instanceof Error) || error.message !== 'Authentication required') {
          setAuthMessage(error instanceof Error ? error.message : 'Could not restore your session.')
        }
      })
      .finally(() => setIsAuthLoading(false))
  }, [])

  useEffect(() => {
    if (isAuthLoading || location.pathname !== '/login') return
    if (isAdminLoggedIn) {
      navigate('/admin/products', { replace: true })
    } else if (isLoggedIn) {
      navigate('/products', { replace: true })
    }
  }, [isAuthLoading, isAdminLoggedIn, isLoggedIn, location.pathname, navigate])

  useEffect(() => {
    if (isAuthLoading || (location.pathname !== '/products' && !productMatch)) return
    if (isAdminLoggedIn) {
      navigate('/admin/products', { replace: true })
    } else if (!isLoggedIn) {
      navigate('/login', { replace: true })
    }
  }, [isAuthLoading, isAdminLoggedIn, isLoggedIn, location.pathname, navigate, productMatch])

  useEffect(() => {
    if (isAuthLoading || location.pathname !== '/orders') return
    if (isAdminLoggedIn) {
      navigate('/admin/orders', { replace: true })
    } else if (!isLoggedIn) {
      navigate('/login', { replace: true })
    }
  }, [isAuthLoading, isAdminLoggedIn, isLoggedIn, location.pathname, navigate])

  useEffect(() => {
    loadProducts()
      .then((result) => {
        setProductStore(result)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Failed to load products:', error)
        setProductStore({ products: defaultProducts, message: 'Failed to load products from backend' })
        setIsLoading(false)
      })
  }, [])
  useEffect(() => {
    api.getCart(cartKey)
      .then((items) => {
        setCart(new Map(items.map((item) => [item.productId, item.quantity])))
        setCartMessage('')
        setIsCartReady(true)
      })
      .catch((error) => {
        const reason = error instanceof Error ? error.message : 'Unknown error.'
        setCartMessage(`Could not load cart from backend: ${reason}`)
      })
      .finally(() => setIsCartLoading(false))
  }, [cartKey])
  useEffect(() => {
    if (!isAdminLoggedIn && !isLoggedIn) return
    let active = true
    api.getOrders()
      .then((orders) => {
        if (active) setOrderStore({ orders, message: '' })
      })
      .catch((error) => {
        if (!active) return
        const reason = error instanceof Error ? error.message : 'Unknown error.'
        setOrderStore({ orders: [], message: `Could not load orders from backend: ${reason}` })
      })
    return () => { active = false }
  }, [isAdminLoggedIn, isLoggedIn])
  useEffect(() => {
    if (!isAdminLoggedIn) return
    let active = true
    api.getUsers()
      .then((users) => {
        if (!active) return
        setAdminCustomerStore({ customers: users.map(toAdminCustomer), message: '' })
        setIsCustomerLoading(false)
      })
      .catch((error) => {
        if (!active) return
        const reason = error instanceof Error ? error.message : 'Unknown error.'
        console.error('Failed to load customers from API:', reason)
        setAdminCustomerStore({ customers: [], message: `Could not load customers from backend: ${reason}` })
        setIsCustomerLoading(false)
      })
    return () => { active = false }
  }, [isAdminLoggedIn])
  useEffect(() => {
    if (!isCartReady) return undefined
    const timeout = window.setTimeout(() => {
      api.saveCart(cartKey, [...cart].map(([productId, quantity]) => ({ productId, quantity })))
        .then(() => setCartMessage(''))
        .catch((error) => {
          const reason = error instanceof Error ? error.message : 'Unknown error.'
          setCartMessage(`Could not save cart to backend: ${reason}`)
        })
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [cart, cartKey, isCartReady])
  const setActiveView = (view) => {
    const viewPaths = {
      store: '/products',
      cart: '/cart',
      wishlist: '/wishlist',
      'customer-orders': '/orders',
      'admin-login': '/admin/login',
      'admin-products': '/admin/products',
      'admin-customers': '/admin/customers',
      'admin-orders': '/admin/orders',
      'admin-addproducts': '/admin/addproducts',
      'admin-editproducts': '/admin/editproducts',
      'admin-deleteproducts': '/admin/deleteproducts',
    }
    const path = viewPaths[view]
    if (path) navigate(path)
  }

  const addToCart = (productId) => {
    setOrderConfirmation('')
    setCart((currentCart) => {
      const nextCart = new Map(currentCart)
      nextCart.set(productId, (nextCart.get(productId) || 0) + 1)
      return nextCart
    })
  }

  const removeOneFromCart = (productId) => {
    setCart((currentCart) => {
      const nextCart = new Map(currentCart)
      const quantity = nextCart.get(productId) || 0
      if (quantity <= 1) {
        nextCart.delete(productId)
      } else {
        nextCart.set(productId, quantity - 1)
      }
      return nextCart
    })
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setAuthMessage('')
    setIsAuthSaving(true)
    try {
      const user = await api.login(
        String(formData.get('email') || '').trim(),
        String(formData.get('password') || ''),
      )
      if (user.role !== 'customer') {
        await api.logout()
        throw new Error('This account is not a customer account. Use the admin portal to sign in as an administrator.')
      }
      setAuthUser(user)
      setIsLoggedIn(true)
      setCustomerEmail(user.email)
      setAuthMessage('')
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Could not sign in.')
    } finally {
      setIsAuthSaving(false)
    }
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setAuthMessage('')
    setIsAuthSaving(true)
    try {
      const user = await api.registerAccount({
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phoneno: Number(formData.get('phoneno')),
        password: String(formData.get('password') || ''),
        role: 'customer',
      })
      setAuthUser(user)
      setIsLoggedIn(true)
      setCustomerEmail(user.email)
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Could not create your account.')
    } finally {
      setIsAuthSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Could not sign out.')
    }
    setAuthUser(null)
    setIsLoggedIn(false)
    setIsAdminLoggedIn(false)
    setCustomerEmail('')
    setActiveView('store')
    setProfileMenuOpen(false)
  }

  const toggleWishlist = (productId) => {
    setWishlist((currentWishlist) => {
      const nextWishlist = new Set(currentWishlist)
      if (nextWishlist.has(productId)) {
        nextWishlist.delete(productId)
      } else {
        nextWishlist.add(productId)
      }
      return nextWishlist
    })
  }

  const openProductDetails = (productId) => {
    navigate(`/products/${encodeURIComponent(productId)}`)
  }

  const openAdminLogin = () => {
    setProfileMenuOpen(false)
    setAdminAuthMessage('')
    setActiveView('admin-login')
  }

  const handleAdminLogin = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setAdminAuthMessage('')
    try {
      const user = await api.login(
        String(formData.get('email') || '').trim(),
        String(formData.get('password') || ''),
      )
      if (user.role !== 'admin') {
        await api.logout()
        throw new Error('This account does not have admin access.')
      }
      setAuthUser(user)
      setCustomerEmail(user.email)
      setIsAdminLoggedIn(true)
      setAdminAuthMessage('')
      setAdminFormMessage('')
      setActiveView('admin-products')
    } catch (error) {
      setAdminAuthMessage(error instanceof Error ? error.message : 'Could not sign in.')
    }
  }

  const handleAdminLogout = () => {
    setCustomerFormOpen(false)
    setAdminFormMessage('')
    handleLogout()
  }

  const handleProductSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') || '').trim()
    const category = String(formData.get('category') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const imageUrl = String(formData.get('image') || '').trim()
    const price = Number(formData.get('price'))

    if (!name || !category || !description || !Number.isFinite(price) || price <= 0) {
      setAdminFormMessage('Enter a name, category, description, and price greater than zero.')
      return
    }

    const hasDuplicateName = products.some((product) => (
      product.id !== editingProductId && product.name.toLowerCase() === name.toLowerCase()
    ))
    if (hasDuplicateName) {
      setAdminFormMessage('A product with that name already exists.')
      return
    }

    const existingProduct = products.find((product) => product.id === editingProductId)
    if (editingProductId && !existingProduct) {
      setAdminFormMessage('The product you are editing could not be found.')
      return
    }
    const productData = {
      name,
      category,
      description,
      image: imageUrl || existingProduct?.image || '/images/everyday-shirt.png',
      price,
    }
    try {
      const savedProduct = editingProductId
        ? await api.updateProduct(editingProductId, productData)
        : await api.createProduct(productData)
      const nextProducts = editingProductId
        ? products.map((product) => product.id === editingProductId ? savedProduct : product)
        : [savedProduct, ...products]
      setProductStore({ products: nextProducts, message: '' })
      setAdminFormMessage('')
      form.reset()
      setActiveView('admin-products')
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error.'
      setAdminFormMessage(`Could not save product: ${reason}`)
    }
  }

  const editProduct = (product) => {
    setAdminFormMessage('')
    navigate(`/admin/editproducts/${encodeURIComponent(product.id)}`)
  }

  const handleCustomerSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const status = String(formData.get('status') || '')
    const orders = Number(formData.get('orders'))
    const actions = String(formData.get('actions') || '').trim()
    const phoneno = Number(phone)
    if (!name || !email || !/^\d+$/.test(phone) || !Number.isSafeInteger(phoneno) || phoneno <= 0) {
      setAdminFormMessage('Enter the customer name, a valid email address, and a numeric phone number.')
      return
    }
    if (status !== 'Active' && status !== 'Inactive') {
      setAdminFormMessage('Choose an Active or Inactive customer status.')
      return
    }
    if (!Number.isInteger(orders) || orders < 0) {
      setAdminFormMessage('Enter a non-negative whole number for orders.')
      return
    }
    if (actions.length > 255) {
      setAdminFormMessage('Recent activity must be 255 characters or fewer.')
      return
    }
    const adminCustomers = adminCustomerStore.customers
    if (adminCustomers.some((customer) => (
      customer.id !== editingCustomerId && customer.email.toLowerCase() === email.toLowerCase()
    ))) {
      setAdminFormMessage('A customer with that email already exists.')
      return
    }

    const existingCustomer = adminCustomers.find((customer) => customer.id === editingCustomerId)
    const userData = {
      name,
      email,
      phoneno,
      status: status.toLowerCase(),
      orders,
      actions,
    }

    setIsCustomerSaving(true)
    try {
      const savedCustomer = toAdminCustomer(existingCustomer
        ? await api.updateUser(existingCustomer.id, userData)
        : await api.createUser(userData))
      setAdminCustomerStore({
        customers: existingCustomer
          ? adminCustomers.map((customer) => customer.id === existingCustomer.id ? savedCustomer : customer)
          : [savedCustomer, ...adminCustomers],
        message: '',
      })

      setEditingCustomerId(null)
      setAdminFormMessage('')
      setCustomerFormOpen(false)
      form.reset()
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error.'
      setAdminFormMessage(`Could not save customer: ${reason}`)
    } finally {
      setIsCustomerSaving(false)
    }
  }

  const editCustomer = (customer) => {
    setEditingCustomerId(customer.id)
    setCustomerFormOpen(true)
    setAdminFormMessage('')
    requestAnimationFrame(() => document.getElementById('admin-customer-name')?.focus())
  }

  const handleCustomerPasswordReset = async (event) => {
    event.preventDefault()
    if (!resettingCustomerId || isPasswordResetSaving) return

    const form = event.currentTarget
    const password = String(new FormData(form).get('password') || '')
    setPasswordResetMessage('')
    setIsPasswordResetSaving(true)
    try {
      await api.resetUserPassword(resettingCustomerId, password)
      form.reset()
      setPasswordResetMessage('Customer password was reset. Share the new password with the customer securely.')
    } catch (error) {
      setPasswordResetMessage(error instanceof Error ? error.message : 'Could not reset customer password.')
    } finally {
      setIsPasswordResetSaving(false)
    }
  }

  const deleteCustomer = async (customerId) => {
    const customer = adminCustomerStore.customers.find((item) => item.id === customerId)
    if (!customer || isCustomerSaving) return

    setIsCustomerSaving(true)
    try {
      await api.deleteUser(customerId)
      setAdminCustomerStore({
        customers: adminCustomerStore.customers.filter((item) => item.id !== customerId),
        message: '',
      })
      if (editingCustomerId === customerId) {
        setEditingCustomerId(null)
        setCustomerFormOpen(false)
        setAdminFormMessage('')
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error.'
      setAdminCustomerStore((current) => ({
        ...current,
        message: `Could not delete customer: ${reason}`,
      }))
    } finally {
      setIsCustomerSaving(false)
    }
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    if (cart.size === 0 || isOrderSubmitting) return

    const formData = new FormData(event.currentTarget)
    setOrderConfirmation('')
    setIsOrderSubmitting(true)
    setOrderStore((current) => ({ ...current, message: '' }))
    try {
      const items = [...cart].map(([productId, quantity]) => ({ productId, quantity }))
      await api.saveCart(cartKey, items)
      const order = await api.createOrder({
        cartKey,
        shippingAddress: String(formData.get('shippingAddress') || '').trim(),
        paymentMethod: 'cash_on_delivery',
      })
      setOrderStore((current) => ({
        ...current,
        orders: [order, ...current.orders.filter((existingOrder) => existingOrder.id !== order.id)],
      }))
      setOrderConfirmation(`Order ${order.id} placed. ${getPaymentMethodLabel(order.paymentMethod)} was selected; payment is not processed online.`)
      setCustomerEmail(order.customerEmail)
      setAuthUser((current) => current ? { ...current, name: order.customerName } : current)
      setCart(new Map())
      setCartMessage('')
      setActiveView('cart')
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error.'
      setOrderStore((current) => ({ ...current, message: `Could not place order: ${reason}` }))
    } finally {
      setIsOrderSubmitting(false)
    }
  }

  const cancelOrder = async (order) => {
    if (order.status === 'cancelled' || cancellingOrderId !== null) return
    if (!window.confirm(`Cancel order #${order.id.slice(0, 8)}?`)) return

    setCancellingOrderId(order.id)
    setOrderStore((current) => ({ ...current, message: '' }))
    try {
      const cancelledOrder = await api.cancelOrder(order.id)
      setOrderStore((current) => ({
        ...current,
        orders: current.orders.map((currentOrder) => (
          currentOrder.id === cancelledOrder.id ? cancelledOrder : currentOrder
        )),
      }))
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error.'
      setOrderStore((current) => ({ ...current, message: `Could not cancel order: ${reason}` }))
    } finally {
      setCancellingOrderId(null)
    }
  }

  const deleteProduct = (productId) => {
    navigate(`/admin/deleteproducts/${encodeURIComponent(productId)}`)
  }

  const confirmDeleteProduct = async (productId) => {
    try {
      await api.deleteProduct(productId)
      setProductStore({
        products: products.filter((product) => product.id !== productId),
        message: '',
      })
      setCart((currentCart) => {
        const nextCart = new Map(currentCart)
        nextCart.delete(productId)
        return nextCart
      })
      setWishlist((currentWishlist) => {
        const nextWishlist = new Set(currentWishlist)
        nextWishlist.delete(productId)
        return nextWishlist
      })
      setAdminFormMessage('')
      setActiveView('admin-products')
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error.'
      setAdminFormMessage(`Could not delete product: ${reason}`)
    }
  }

  if (isLoading || isCartLoading || isAuthLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading products...</div>
  }

  return (
    <main className={`store${isAdminLoggedIn ? ' admin-store' : ''}`}>
      <header className="store-header">
        <Link
          className="brand"
          to="/products"
          onClick={() => {
            setProfileMenuOpen(false)
          }}
        >
          <svg viewBox="0 0 36 36" aria-hidden="true">
            <rect x="3" y="3" width="30" height="30" rx="10" />
            <path d="M11 15h14l-1 12H12l-1-12Zm3 0a4 4 0 0 1 8 0" />
          </svg>
          <span>Shop Easy</span>
        </Link>
        {isAdminLoggedIn ? (
          <div className="admin-header-actions">
            <button
              className="admin-header-back"
              type="button"
              aria-label="Back to store"
              title="Back to store"
              onClick={handleAdminLogout}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14 5-7 7 7 7M7 12h14" />
              </svg>
            </button>
            <span className="admin-header-label">Admin panel</span>
          </div>
        ) : activeView === 'admin-login' ? (
          <button className="header-nav-button" type="button" onClick={() => setActiveView('store')}>Back to store</button>
        ) : isLoggedIn ? (
          <nav className="header-nav" aria-label="Main navigation">
            <NavLink className={({ isActive }) => `header-nav-button${isActive ? ' is-active' : ''}`} to="/products">
              Products
            </NavLink>
            <NavLink className={({ isActive }) => `header-nav-button${isActive ? ' is-active' : ''}`} to="/cart">
              Cart <span className="nav-count">{cartCount}</span>
            </NavLink>
            <NavLink className={({ isActive }) => `header-nav-button${isActive ? ' is-active' : ''}`} to="/wishlist">
              Wishlist <span className="nav-count">{wishlist.size}</span>
            </NavLink>
            <NavLink className={({ isActive }) => `header-nav-button${isActive ? ' is-active' : ''}`} to="/orders">
              Orders <span className="nav-count">{orders.length}</span>
            </NavLink>
            <div className="profile-menu">
              <button
                className="customer-badge"
                type="button"
                onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                </svg>
                <span><strong>{authUser?.name || 'Customer'}</strong><small>Customer</small></span>
                <svg className="profile-chevron" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m7 10 5 5 5-5" />
                </svg>
              </button>
              {profileMenuOpen && (
                <div className="profile-dropdown" role="menu">
                  <button className="profile-dropdown-item" type="button" role="menuitem" onClick={openAdminLogin}>
                    Admin panel
                  </button>
                  <button className="profile-dropdown-item" type="button" role="menuitem" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </nav>
        ) : null}
      </header>

      {isAdminLoggedIn ? (
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <p className="admin-sidebar-heading">Store management</p>
            <nav className="admin-sidebar-nav" aria-label="Admin navigation">
              <NavLink className={({ isActive }) => `admin-sidebar-link${isActive ? ' is-active' : ''}`} to="/admin/products">
                Products
              </NavLink>
              <NavLink className={({ isActive }) => `admin-sidebar-link${isActive ? ' is-active' : ''}`} to="/admin/customers">
                Customers
              </NavLink>
              <NavLink className={({ isActive }) => `admin-sidebar-link${isActive ? ' is-active' : ''}`} to="/admin/orders">
                Orders <span className="nav-count">{orders.length}</span>
              </NavLink>
            </nav>
            <div className="admin-sidebar-footer">
              <button className="admin-sidebar-logout" type="button" onClick={handleAdminLogout}>
                Log out
              </button>
            </div>
          </aside>
          <div className="admin-content">
            {activeView === 'admin-customers' ? (
              <AdminCustomers
                customers={adminCustomerStore.customers}
                message={adminCustomerStore.message}
                isLoading={isCustomerLoading}
                isSaving={isCustomerSaving}
                isPasswordResetSaving={isPasswordResetSaving}
                isFormOpen={customerFormOpen}
                editingCustomerId={editingCustomerId}
                resettingCustomerId={resettingCustomerId}
                formMessage={adminFormMessage}
                passwordResetMessage={passwordResetMessage}
                onToggleForm={() => {
                  if (customerFormOpen) {
                    setCustomerFormOpen(false)
                    setEditingCustomerId(null)
                  } else {
                    setEditingCustomerId(null)
                    setCustomerFormOpen(true)
                  }
                  setAdminFormMessage('')
                }}
                onCustomerSubmit={handleCustomerSubmit}
                onPasswordResetSubmit={handleCustomerPasswordReset}
                onClosePasswordReset={() => {
                  setResettingCustomerId(null)
                  setPasswordResetMessage('')
                }}
                onEditCustomer={editCustomer}
                onStartPasswordReset={(customerId) => {
                  setResettingCustomerId(customerId)
                  setPasswordResetMessage('')
                }}
                onDeleteCustomer={deleteCustomer}
                onCancelEdit={() => {
                  setEditingCustomerId(null)
                  setCustomerFormOpen(false)
                  setAdminFormMessage('')
                }}
              />
            ) : activeView === 'admin-orders' ? (
              <AdminOrders orders={orders} message={orderStore.message} />
            ) : (
              <AdminProducts
                activeView={activeView}
                products={products}
                selectedProduct={selectedAdminProduct}
                editingProductId={editingProductId}
                message={productStore.message}
                formMessage={adminFormMessage}
                onSetActiveView={(view) => {
                  setAdminFormMessage('')
                  setActiveView(view)
                }}
                onProductSubmit={handleProductSubmit}
                onAddProduct={() => {
                  setAdminFormMessage('')
                  setActiveView('admin-addproducts')
                }}
                onEditProduct={editProduct}
                onDeleteProduct={confirmDeleteProduct}
                onRequestDeleteProduct={deleteProduct}
                productImageClass={productImageClass}
                getProductImage={getProductImage}
                restoreBuiltInImage={restoreBuiltInImage}
              />
            )}
          </div>
        </div>
      ) : activeView === 'admin-login' ? (
        <section className="login-section">
          <form className="login-card" onSubmit={handleAdminLogin}>
            <p className="eyebrow">Store management</p>
            <h1>Admin login</h1>
            <p className="login-description">Sign in to manage the product list.</p>
            {adminAuthMessage && <p className="auth-message" role="alert">{adminAuthMessage}</p>}
            <label htmlFor="admin-email">Email</label>
            <input id="admin-email" name="email" type="email" autoComplete="username" required />
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
            <button className="login-submit" type="submit">Log in as admin</button>
          </form>
        </section>
      ) : isLoggedIn ? (
        <>
          {activeView === 'store' ? (
            <ProductCatalog
              products={products}
              filteredProducts={filteredProducts}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              cart={cart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
              openProductDetails={openProductDetails}
              productImageClass={productImageClass}
              getProductImage={getProductImage}
              restoreBuiltInImage={restoreBuiltInImage}
            />
          ) : activeView === 'product-details' ? (
            (() => {
              const product = products.find((item) => item.id === selectedProductId)
              if (!product) {
                return (
                  <section className="products-section wishlist-section">
                    <p className="wishlist-empty">This product is no longer available.</p>
                    <button className="shop-button wishlist-back" type="button" onClick={() => setActiveView('store')}>
                      Back to products
                    </button>
                  </section>
                )
              }

              return (
                <section className="products-section product-detail-section">
                  <button className="product-back-button" type="button" onClick={() => setActiveView('store')}>
                    Back to products
                  </button>
                  <article className="product-detail">
                    <img
                      className={`product-detail-image ${productImageClass(product)}`}
                      src={getProductImage(product)}
                      alt={product.name}
                      onError={(event) => restoreBuiltInImage(event, product)}
                    />
                    <div className="product-detail-content">
                      <p className="product-category">{product.category}</p>
                      <h1>{product.name}</h1>
                      <p className="product-price">{formatInr(product.price)}</p>
                      <p className="product-detail-description">{product.description}</p>
                      <div className="product-detail-actions">
                        <button className="login-submit" type="button" onClick={() => addToCart(product.id)}>
                          Add to cart
                        </button>
                        <button
                          className={`product-detail-wishlist${wishlist.has(product.id) ? ' is-wishlisted' : ''}`}
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          aria-pressed={wishlist.has(product.id)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                          </svg>
                          {wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        </button>
                      </div>
                    </div>
                  </article>
                </section>
              )
            })()
          ) : activeView === 'wishlist' ? (
            <section className="products-section wishlist-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Your saved items</p>
                  <h1>Wishlist</h1>
                </div>
                <button className="shop-button wishlist-back" type="button" onClick={() => setActiveView('store')}>
                  Continue shopping
                </button>
              </div>
              {wishlist.size === 0 ? (
                <p className="wishlist-empty">Your wishlist is empty. Add items using the heart icons.</p>
              ) : (
                <div className="product-grid">
                  {products.filter((product) => wishlist.has(product.id)).map((product) => (
                    <article className="product-card" key={product.id}>
                      <div className="product-image">
                        <img
                          className={productImageClass(product)}
                          src={getProductImage(product)}
                          alt={product.name}
                          onError={(event) => restoreBuiltInImage(event, product)}
                          role="button"
                          tabIndex={0}
                          onClick={() => openProductDetails(product.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              openProductDetails(product.id)
                            }
                          }}
                        />
                        <button
                          className="wishlist-button is-wishlisted"
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={`Remove ${product.name} from wishlist`}
                          aria-pressed={true}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                          </svg>
                        </button>
                      </div>
                      <div className="product-details">
                        <div>
                          <p className="product-category">{product.category}</p>
                          <button className="product-title-button" type="button" onClick={() => openProductDetails(product.id)}>
                            {product.name}
                          </button>
                          <p className="product-description">{product.description}</p>
                        </div>
                        <p className="product-price">{formatInr(product.price)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : activeView === 'customer-orders' ? (
            <CustomerOrders
              orders={orders}
              products={products}
              message={orderStore.message}
              customerName={authUser?.name}
              cancellingOrderId={cancellingOrderId}
              onContinueShopping={() => navigate('/products')}
              onCancelOrder={cancelOrder}
            />
          ) : (
            <CartCheckout
              products={products}
              cart={cart}
              cartCount={cartCount}
              cartMessage={cartMessage}
              orderMessage={orderStore.message}
              orderConfirmation={orderConfirmation}
              customerName={authUser?.name}
              customerEmail={customerEmail}
              isOrderSubmitting={isOrderSubmitting}
              onContinueShopping={() => setActiveView('store')}
              onRemoveOne={removeOneFromCart}
              onPlaceOrder={placeOrder}
              productImageClass={productImageClass}
              getProductImage={getProductImage}
              restoreBuiltInImage={restoreBuiltInImage}
            />
          )}
        </>
      ) : (
        <section className="login-section">
          <form
            className="login-card"
            id="login-form"
            onSubmit={isRegisteringAuth ? handleRegister : handleLogin}
          >
            <h1>{isRegisteringAuth ? 'Create your Shop Easy account' : 'Log in to Shop Easy'}</h1>
            {authMessage && <p className="auth-message" role="alert">{authMessage}</p>}
            {isRegisteringAuth && (
              <>
                <label htmlFor="register-name">Name</label>
                <input id="register-name" name="name" type="text" autoComplete="name" maxLength={255} required />
                <label htmlFor="register-phone">Phone number</label>
                <input
                  id="register-phone"
                  name="phoneno"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="9007199254740991"
                  step="1"
                  autoComplete="tel"
                  required
                />
              </>
            )}
            <label htmlFor="login-email">Email</label>
            <input id="login-email" name="email" type="email" autoComplete="email" required />
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete={isRegisteringAuth ? 'new-password' : 'current-password'}
              minLength={isRegisteringAuth ? 8 : undefined}
              maxLength={isRegisteringAuth ? 256 : undefined}
              required
            />
            <button className="login-submit" type="submit" disabled={isAuthSaving}>
              {isAuthSaving
                ? (isRegisteringAuth ? 'Creating account...' : 'Logging in...')
                : (isRegisteringAuth ? 'Create account' : 'Log in')}
            </button>
            <button
              className="auth-toggle"
              type="button"
              onClick={() => {
                setIsRegisteringAuth((isRegistering) => !isRegistering)
                setAuthMessage('')
              }}
            >
              {isRegisteringAuth ? 'Already have an account? Log in' : 'New here? Create an account'}
            </button>
            {!isRegisteringAuth && <p><Link to="/admin/login">Administrator sign in</Link></p>}
          </form>
        </section>
      )}
    </main>
  )
}

export default App
