import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useMatch, useNavigate } from 'react-router-dom'
import './App.css'
import { api } from './services/api'
import { formatDeliveryEstimate, getDeliveryEstimate } from './services/deliveryEstimate'

const formatInr = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(amount)

const getProductStock = (product) => {
  if (product.stock === null || product.stock === undefined) return null
  const stock = Number(product.stock)
  return Number.isSafeInteger(stock) && stock >= 0 ? stock : null
}
const isOutOfStock = (product) => {
  const stock = getProductStock(product)
  return stock !== null && stock <= 0
}
const getDiscountedPrice = (product) => {
  const priceInCents = Math.round(Number(product.price) * 100)
  const discountPercent = Number(product.discountPercent || 0)
  return Math.round(priceInCents * (100 - discountPercent) / 100) / 100
}

const ProductPrice = ({ product, quantity = 1 }) => {
  const discountPercent = Number(product.discountPercent || 0)
  const hasDiscount = discountPercent > 0

  return (
    <div className={`product-price product-price-group${hasDiscount ? ' has-discount' : ''}`}>
      {hasDiscount && <span className="product-original-price">{formatInr(product.price * quantity)}</span>}
      <strong className="product-current-price">
        {formatInr((hasDiscount ? getDiscountedPrice(product) : product.price) * quantity)}
      </strong>
      {hasDiscount && <span className="product-discount-label">{discountPercent}% off</span>}
    </div>
  )
}

const getPaymentMethodLabel = (paymentMethod) => ({
  cash_on_delivery: 'Cash on delivery',
  upi: 'UPI',
  credit_debit_card: 'Credit/debit card',
  net_banking: 'Net banking',
  digital_wallet: 'Digital wallets',
  online: 'Online payment (legacy selection)',
}[paymentMethod] || 'Unknown payment option')

const defaultProducts = [
  {
    id: 't-shirt',
    name: 'T-shirt',
    price: 499,
    image: '/images/everyday-shirt.png',
    category: 'Apparel',
    description: 'A classic, comfortable cotton T-shirt designed for everyday wear.',
    stock: null,
    discountPercent: 0,
  },
  {
    id: 'keyboard-cover',
    name: 'Keyboard Cover',
    price: 250,
    image: '/images/keyboard-cover.jpg',
    category: 'Accessories',
    description: 'A slim protective cover that keeps your keyboard clean and comfortable to use.',
    stock: null,
    discountPercent: 0,
  },
  {
    id: 'wireless-mouse',
    name: 'Wireless Mouse',
    price: 399,
    image: '/images/mouse.jpg',
    category: 'Electronics',
    description: 'A reliable wireless mouse with smooth tracking for work or everyday browsing.',
    stock: null,
    discountPercent: 0,
  },
  {
    id: 'smartphone',
    name: 'Smartphone',
    price: 96699,
    image: '/images/smartphone.png',
    category: 'Electronics',
    description: 'A modern smartphone for staying connected, capturing photos, and enjoying apps.',
    stock: null,
    discountPercent: 0,
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
  const filteredProducts = products.filter((product) => {
    const minPrice = priceRange.min === '' ? null : Number(priceRange.min)
    const maxPrice = priceRange.max === '' ? null : Number(priceRange.max)
    const price = getDiscountedPrice(product)
    return (minPrice === null || price >= minPrice)
      && (maxPrice === null || price <= maxPrice)
  })
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
  const cartHasUnavailableItems = products.some((product) => {
    const stock = getProductStock(product)
    return stock !== null && (cart.get(product.id) || 0) > stock
  })
  const canAddToCart = (product) => {
    const stock = getProductStock(product)
    return stock === null || (!isOutOfStock(product) && (cart.get(product.id) || 0) < stock)
  }

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
    if (!isAdminLoggedIn) return
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
  }, [isAdminLoggedIn])
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
    const product = products.find((item) => item.id === productId)
    if (!product || !canAddToCart(product)) return
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
    const stock = Number(formData.get('stock'))
    const discountPercent = Number(formData.get('discountPercent'))

    if (!name || !category || !description || !Number.isFinite(price) || price <= 0) {
      setAdminFormMessage('Enter a name, category, description, and price greater than zero.')
      return
    }
    if (!Number.isSafeInteger(stock) || stock < 0 || stock > 4294967295) {
      setAdminFormMessage('Enter a non-negative whole number for stock.')
      return
    }
    if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      setAdminFormMessage('Enter a whole-number discount from 0 to 100 percent.')
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
      stock,
      discountPercent,
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
        paymentMethod: String(formData.get('paymentMethod') || ''),
      })
      const estimate = formatDeliveryEstimate(getDeliveryEstimate())
      setOrderConfirmation(`Order ${order.id} placed. Estimated delivery: ${estimate} (3-5 business days). ${getPaymentMethodLabel(order.paymentMethod)} was selected; payment is not processed online.`)
      setCustomerEmail(order.customerEmail)
      setAuthUser((current) => current ? { ...current, name: order.customerName } : current)
      setProductStore((current) => ({
        ...current,
        products: current.products.map((product) => {
          const stock = getProductStock(product)
          const purchasedQuantity = cart.get(product.id) || 0
          return stock === null
            ? product
            : { ...product, stock: Math.max(0, stock - purchasedQuantity) }
        }),
      }))
      setCart(new Map())
      setCartMessage('')
      api.getProducts()
        .then((freshProducts) => setProductStore({ products: freshProducts, message: '' }))
        .catch((error) => {
          const reason = error instanceof Error ? error.message : 'Unknown error.'
          setCartMessage(`Order placed, but inventory could not be refreshed: ${reason}`)
        })
      setActiveView('cart')
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error.'
      setOrderStore((current) => ({ ...current, message: `Could not place order: ${reason}` }))
    } finally {
      setIsOrderSubmitting(false)
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
              <section className="admin-section">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Store management</p>
                    <h1>Customers</h1>
                  </div>
                  <button className="admin-add-button" type="button" disabled={isCustomerLoading || isCustomerSaving} onClick={() => {
                    if (customerFormOpen) {
                      setCustomerFormOpen(false)
                      setEditingCustomerId(null)
                    } else {
                      setEditingCustomerId(null)
                      setCustomerFormOpen(true)
                    }
                    setAdminFormMessage('')
                  }}>
                    {customerFormOpen ? 'Cancel' : 'Add customer'}
                  </button>
                </div>
                <p className="customer-demo-notice">
                  Customer records are managed in the backend database. Account passwords are not stored in this admin screen.
                </p>
                {adminCustomerStore.message && <p className="storage-message" role="alert">{adminCustomerStore.message}</p>}
                {resettingCustomerId && (
                  <form className="admin-product-form" onSubmit={handleCustomerPasswordReset}>
                    <h2>Reset password for {adminCustomerStore.customers.find((customer) => customer.id === resettingCustomerId)?.fullName || 'customer'}</h2>
                    <p>Set a new password with 8 to 256 characters. The existing password cannot be viewed.</p>
                    {passwordResetMessage && <p className="auth-message" role="status">{passwordResetMessage}</p>}
                    <div className="admin-field">
                      <label htmlFor="admin-customer-new-password">New password</label>
                      <input
                        id="admin-customer-new-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={256}
                        required
                      />
                    </div>
                    <div className="admin-form-actions">
                      <button className="login-submit" type="submit" disabled={isPasswordResetSaving}>
                        {isPasswordResetSaving ? 'Resetting...' : 'Reset password'}
                      </button>
                      <button className="admin-cancel-button" type="button" disabled={isPasswordResetSaving} onClick={() => {
                        setResettingCustomerId(null)
                        setPasswordResetMessage('')
                      }}>
                        Close
                      </button>
                    </div>
                  </form>
                )}
                {customerFormOpen && (
                  <form className="admin-product-form" key={editingCustomerId || 'new-customer'} onSubmit={handleCustomerSubmit}>
                    <h2>{editingCustomerId ? 'Edit customer' : 'Add customer'}</h2>
                    {adminFormMessage && <p className="auth-message" role="alert">{adminFormMessage}</p>}
                    <div className="admin-form-grid">
                      <div className="admin-field">
                        <label htmlFor="admin-customer-name">Customer name</label>
                        <input
                          id="admin-customer-name"
                          name="name"
                          required
                          defaultValue={adminCustomerStore.customers.find((customer) => customer.id === editingCustomerId)?.fullName || ''}
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="admin-customer-email">Email</label>
                        <input
                          id="admin-customer-email"
                          name="email"
                          type="email"
                          required
                          defaultValue={adminCustomerStore.customers.find((customer) => customer.id === editingCustomerId)?.email || ''}
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="admin-customer-phone">Phone number</label>
                        <input
                          id="admin-customer-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          required
                          defaultValue={adminCustomerStore.customers.find((customer) => customer.id === editingCustomerId)?.phone || ''}
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="admin-customer-status">Customer status</label>
                        <select
                          id="admin-customer-status"
                          name="status"
                          required
                          defaultValue={adminCustomerStore.customers.find((customer) => customer.id === editingCustomerId)?.status || 'Active'}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="admin-field">
                        <label htmlFor="admin-customer-orders">Orders</label>
                        <input
                          id="admin-customer-orders"
                          name="orders"
                          type="number"
                          min="0"
                          step="1"
                          required
                          defaultValue={adminCustomerStore.customers.find((customer) => customer.id === editingCustomerId)?.orders ?? 0}
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="admin-customer-actions">Recent activity</label>
                        <input
                          id="admin-customer-actions"
                          name="actions"
                          maxLength="255"
                          defaultValue={adminCustomerStore.customers.find((customer) => customer.id === editingCustomerId)?.actions || ''}
                        />
                      </div>
                    </div>
                    <div className="admin-form-actions">
                      <button className="login-submit" type="submit" disabled={isCustomerSaving}>
                        {editingCustomerId ? 'Save changes' : 'Save customer'}
                      </button>
                      {editingCustomerId && (
                        <button className="admin-cancel-button" type="button" disabled={isCustomerSaving} onClick={() => {
                          setEditingCustomerId(null)
                          setCustomerFormOpen(false)
                          setAdminFormMessage('')
                        }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
                {isCustomerLoading ? (
                  <p className="wishlist-empty">Loading customers...</p>
                ) : adminCustomerStore.customers.length === 0 ? (
                  <p className="wishlist-empty">No customers yet. Select “Add customer” to create one.</p>
                ) : (
                  <div className="customer-table-wrap">
                    <table className="customer-table">
                      <thead>
                        <tr>
                          <th scope="col">ID</th>
                          <th scope="col">Name</th>
                          <th scope="col">Email</th>
                          <th scope="col">Status</th>
                          <th scope="col">Orders</th>
                          <th scope="col">Joined</th>
                          <th scope="col">Recent activity</th>
                          <th scope="col">Phone</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminCustomerStore.customers.map((customer) => (
                          <tr key={customer.id}>
                            <td>{customer.id}</td>
                            <th scope="row">{customer.fullName}</th>
                            <td>{customer.email}</td>
                            <td>
                              <span className={`customer-status customer-status-${customer.status.toLowerCase()}`}>
                                {customer.status}
                              </span>
                            </td>
                            <td>{customer.orders}</td>
                            <td>{new Intl.DateTimeFormat('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }).format(new Date(customer.joined))}</td>
                            <td>{customer.actions || '—'}</td>
                            <td>{customer.phone || '—'}</td>
                            <td>
                              <div className="customer-row-actions">
                                <button className="admin-secondary-button" type="button" onClick={() => editCustomer(customer)} disabled={isCustomerSaving}>
                                  Edit
                                </button>
                                <button className="admin-secondary-button" type="button" onClick={() => {
                                  setResettingCustomerId(customer.id)
                                  setPasswordResetMessage('')
                                }} disabled={isPasswordResetSaving}>
                                  Reset password
                                </button>
                                <button className="admin-delete-button" type="button" onClick={() => deleteCustomer(customer.id)} disabled={isCustomerSaving}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ) : activeView === 'admin-orders' ? (
              <section className="admin-section">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Store management</p>
                    <h1>Orders</h1>
                  </div>
                </div>
                {orderStore.message && <p className="storage-message" role="alert">{orderStore.message}</p>}
                {orders.length === 0 ? (
                  <p className="wishlist-empty">No submitted orders yet. Customer carts appear here after an order is placed.</p>
                ) : (
                  <div className="admin-order-table-wrap">
                    <table className="admin-order-table">
                      <thead>
                        <tr>
                          <th scope="col">Order</th>
                          <th scope="col">Customer</th>
                          <th scope="col">Date</th>
                          <th scope="col">Delivery address</th>
                          <th scope="col">Payment option</th>
                          <th scope="col">Items</th>
                          <th scope="col">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <th scope="row">#{order.id.slice(0, 8)}</th>
                            <td>
                              <strong>{order.customerName}</strong>
                              <span className="admin-order-customer-email">{order.customerEmail || 'No email provided'}</span>
                            </td>
                            <td>{new Intl.DateTimeFormat('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(new Date(order.createdAt))}</td>
                            <td>{order.shippingAddress || 'Not provided'}</td>
                            <td>{getPaymentMethodLabel(order.paymentMethod)}</td>
                            <td>
                              <ul className="admin-order-items">
                                {order.items.map((item) => (
                                  <li key={item.productId}>{item.name} × {item.quantity} — {formatInr(item.price * item.quantity)}</li>
                                ))}
                              </ul>
                            </td>
                            <td><strong className="product-price">{formatInr(order.total)}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ) : (
              <section className="admin-section">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Store management</p>
                    <h1>
                      {activeView === 'admin-addproducts'
                        ? 'Add product'
                        : activeView === 'admin-editproducts'
                          ? 'Edit product'
                          : activeView === 'admin-deleteproducts'
                            ? 'Delete product'
                            : 'Products'}
                    </h1>
                  </div>
                  {activeView === 'admin-products' && <button className="admin-add-button" type="button" onClick={() => {
                    setAdminFormMessage('')
                    setActiveView('admin-addproducts')
                  }}>
                    Add product
                  </button>}
                </div>
                {productStore.message && <p className="storage-message" role="status">{productStore.message}</p>}
                {activeView === 'admin-addproducts' || activeView === 'admin-editproducts' ? (
                  activeView === 'admin-editproducts' && !selectedAdminProduct ? (
                    <div className="admin-product-form">
                      <p className="wishlist-empty">This product could not be found.</p>
                      <button className="admin-cancel-button" type="button" onClick={() => setActiveView('admin-products')}>
                        Back to products
                      </button>
                    </div>
                  ) : <form className="admin-product-form" key={editingProductId || 'new-product'} onSubmit={handleProductSubmit}>
                    <h2>{editingProductId ? 'Edit product details' : 'Enter product details'}</h2>
                    {adminFormMessage && <p className="auth-message" role="alert">{adminFormMessage}</p>}
                    <div className="admin-form-grid">
                      <div className="admin-field">
                        <label htmlFor="admin-product-name">Product name</label>
                        <input
                          id="admin-product-name"
                          name="name"
                          required
                          defaultValue={selectedAdminProduct?.name || ''}
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="admin-product-category">Category</label>
                        <input
                          id="admin-product-category"
                          name="category"
                          required
                          defaultValue={selectedAdminProduct?.category || ''}
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="admin-product-price">Price (INR)</label>
                        <input
                          id="admin-product-price"
                          name="price"
                          type="number"
                          min="1"
                          step="1"
                          required
                          defaultValue={selectedAdminProduct?.price || ''}
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="admin-product-stock">Stock quantity</label>
                        <input
                          id="admin-product-stock"
                          name="stock"
                          type="number"
                          min="0"
                          max="4294967295"
                          step="1"
                          required
                          defaultValue={selectedAdminProduct?.stock ?? 0}
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="admin-product-discount">Offer discount (%)</label>
                        <input
                          id="admin-product-discount"
                          name="discountPercent"
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          required
                          defaultValue={selectedAdminProduct?.discountPercent ?? 0}
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="admin-product-image">Image URL (optional)</label>
                        <input
                          id="admin-product-image"
                          name="image"
                          type="text"
                          defaultValue={selectedAdminProduct?.image || ''}
                          placeholder="Paste an image URL"
                        />
                      </div>
                      <div className="admin-field admin-description-field">
                        <label htmlFor="admin-product-description">Description</label>
                        <textarea
                          id="admin-product-description"
                          name="description"
                          rows="3"
                          required
                          defaultValue={selectedAdminProduct?.description || ''}
                        />
                      </div>
                    </div>
                    <div className="admin-form-actions">
                      <button className="login-submit" type="submit">{editingProductId ? 'Save changes' : 'Save product'}</button>
                      <button className="admin-cancel-button" type="button" onClick={() => {
                        setAdminFormMessage('')
                        setActiveView('admin-products')
                      }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : activeView === 'admin-deleteproducts' ? (
                  <div className="admin-product-form">
                    {selectedAdminProduct ? (
                      <>
                        <h2>Delete {selectedAdminProduct.name}?</h2>
                        <p>This action permanently removes the product from the store.</p>
                        {adminFormMessage && <p className="auth-message" role="alert">{adminFormMessage}</p>}
                        <div className="admin-form-actions">
                          <button
                            className="admin-delete-button"
                            type="button"
                            onClick={() => confirmDeleteProduct(selectedAdminProduct.id)}
                          >
                            Delete product
                          </button>
                          <button className="admin-cancel-button" type="button" onClick={() => setActiveView('admin-products')}>
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="wishlist-empty">This product could not be found.</p>
                        <button className="admin-cancel-button" type="button" onClick={() => setActiveView('admin-products')}>
                          Back to products
                        </button>
                      </>
                    )}
                  </div>
                ) : <div className="admin-product-list">
                  {products.length === 0 ? (
                    <p className="wishlist-empty">No products yet. Select “Add product” to create one.</p>
                  ) : <div className="admin-product-table-wrap">
                    <table className="admin-product-table">
                      <thead>
                        <tr>
                          <th scope="col">Image</th>
                          <th scope="col">Product</th>
                          <th scope="col">Category</th>
                          <th scope="col">Stock</th>
                          <th scope="col">Price / offer</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td>
                              <img
                                className={productImageClass(product)}
                                src={getProductImage(product)}
                                alt={product.name}
                                onError={(event) => restoreBuiltInImage(event, product)}
                              />
                            </td>
                            <td>
                              <strong>{product.name}</strong>
                              <p>{product.description}</p>
                            </td>
                            <td>{product.category}</td>
                            <td>{getProductStock(product) ?? 'Unknown'}</td>
                            <td><ProductPrice product={product} /></td>
                            <td className="admin-product-actions">
                              <button className="admin-secondary-button" type="button" onClick={() => editProduct(product)}>Edit</button>
                              <button className="admin-delete-button" type="button" onClick={() => deleteProduct(product.id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>}
                </div>}
              </section>
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
            <>
              <section className="hero" id="home">
                <p className="eyebrow">A little something for everyone</p>
                <h1>Find your next favorite.</h1>
                <p>Thoughtful picks for everyday life, all in one easy place.</p>
                <a className="shop-button" href="#products">Explore products</a>
              </section>

              <section className="products-section" id="products">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Our collection</p>
                    <h2>Popular right now</h2>
                  </div>
                  <p>All prices are in Indian Rupees (INR).</p>
                </div>
                <div className="product-filter">
                  <div className="price-range-fields">
                    <label>
                      <span>Minimum price</span>
                      <span className="price-input-wrap">
                        <span aria-hidden="true">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={priceRange.min}
                          onChange={(event) => setPriceRange((currentRange) => ({ ...currentRange, min: event.target.value }))}
                          placeholder="Any"
                          aria-label="Minimum price in rupees"
                        />
                      </span>
                    </label>
                    <label>
                      <span>Maximum price</span>
                      <span className="price-input-wrap">
                        <span aria-hidden="true">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={priceRange.max}
                          onChange={(event) => setPriceRange((currentRange) => ({ ...currentRange, max: event.target.value }))}
                          placeholder="Any"
                          aria-label="Maximum price in rupees"
                        />
                      </span>
                    </label>
                  </div>
                  <div className="product-filter-summary">
                    <p role="status">Showing {filteredProducts.length} of {products.length} products</p>
                    {(priceRange.min !== '' || priceRange.max !== '') && (
                      <button type="button" onClick={() => setPriceRange({ min: '', max: '' })}>
                        Clear price filter
                      </button>
                    )}
                  </div>
                </div>
                {filteredProducts.length > 0 ? (
                  <div className="product-grid">
                    {filteredProducts.map((product) => (
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
                        <div className="product-badges">
                          {Number(product.discountPercent || 0) > 0 && (
                            <span className="product-offer-badge">{product.discountPercent}% off</span>
                          )}
                          {isOutOfStock(product) && <span className="product-stock-badge">Out of stock</span>}
                        </div>
                        <button
                          className={`wishlist-button${wishlist.has(product.id) ? ' is-wishlisted' : ''}`}
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          aria-label={`${wishlist.has(product.id) ? 'Remove' : 'Add'} ${product.name} ${wishlist.has(product.id) ? 'from' : 'to'} wishlist`}
                          aria-pressed={wishlist.has(product.id)}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                          </svg>
                        </button>
                        <button
                          className={`add-to-cart-icon${cart.has(product.id) ? ' is-in-cart' : ''}`}
                          type="button"
                          onClick={() => addToCart(product.id)}
                          disabled={!canAddToCart(product)}
                          aria-label={isOutOfStock(product)
                            ? `${product.name} is out of stock`
                            : !canAddToCart(product)
                              ? `Maximum available quantity of ${product.name} is already in your cart`
                              : `${cart.has(product.id) ? 'Add another' : 'Add'} ${product.name} to cart${cart.has(product.id) ? `; ${cart.get(product.id)} in cart` : ''}`}
                          title={isOutOfStock(product)
                            ? 'Out of stock'
                            : canAddToCart(product) ? 'Add to cart' : 'Maximum available stock is already in your cart'}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 3h2l2.4 12.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6" />
                            <circle cx="10" cy="20" r="1" />
                            <circle cx="18" cy="20" r="1" />
                          </svg>
                        </button>
                      </div>
                      <div className="product-details">
                        <div>
                          <p className="product-category">{product.category}</p>
                          <button className="product-title-button" type="button" onClick={() => openProductDetails(product.id)}>
                            {product.name}
                          </button>
                        </div>
                        <ProductPrice product={product} />
                      </div>
                      <div className="product-card-footer">
                        <p className="product-description">{product.description}</p>
                      </div>
                    </article>
                  ))}
                  </div>
                ) : (
                  <p className="product-filter-empty" role="status">No products match this price range.</p>
                )}
              </section>
            </>
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
                      {isOutOfStock(product) ? (
                        <p className="product-stock-message is-out-of-stock">Out of stock</p>
                      ) : getProductStock(product) !== null ? (
                        <p className="product-stock-message">{getProductStock(product)} in stock</p>
                      ) : null}
                      <ProductPrice product={product} />
                      <p className="product-detail-description">{product.description}</p>
                      <p className="delivery-estimate">
                        Estimated delivery: {formatDeliveryEstimate(getDeliveryEstimate())} (3-5 business days; weekends excluded).
                      </p>
                      <div className="product-detail-actions">
                        <button
                          className="login-submit"
                          type="button"
                          onClick={() => addToCart(product.id)}
                          disabled={!canAddToCart(product)}
                        >
                          {isOutOfStock(product) ? 'Out of stock' : canAddToCart(product) ? 'Add to cart' : 'Stock limit reached'}
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
                        <div className="product-badges">
                          {Number(product.discountPercent || 0) > 0 && (
                            <span className="product-offer-badge">{product.discountPercent}% off</span>
                          )}
                          {isOutOfStock(product) && <span className="product-stock-badge">Out of stock</span>}
                        </div>
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
                        <ProductPrice product={product} />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="products-section wishlist-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Your basket</p>
                  <h1>Cart</h1>
                </div>
                <button className="shop-button wishlist-back" type="button" onClick={() => setActiveView('store')}>
                  Continue shopping
                </button>
              </div>
              {cartMessage && <p className="storage-message" role="alert">{cartMessage}</p>}
              {orderStore.message && <p className="storage-message" role="alert">{orderStore.message}</p>}
              {orderConfirmation && <p className="storage-message" role="status">{orderConfirmation}</p>}
              {cartCount === 0 ? (
                <p className="wishlist-empty">Your cart is empty. Add products to see them here.</p>
              ) : (
                <div className="cart-list">
                  {products.filter((product) => cart.has(product.id)).map((product) => (
                    <article className="cart-item" key={product.id}>
                      <img
                        className={productImageClass(product)}
                        src={getProductImage(product)}
                        alt={product.name}
                        onError={(event) => restoreBuiltInImage(event, product)}
                      />
                      <div className="cart-item-details">
                        <p className="product-category">{product.category}</p>
                        <h2>{product.name}</h2>
                        <p>{cart.get(product.id)} × {formatInr(getDiscountedPrice(product))}</p>
                        {getProductStock(product) !== null && cart.get(product.id) > getProductStock(product) && (
                          <p className="product-stock-message is-out-of-stock" role="alert">
                            Only {getProductStock(product)} units are currently in stock.
                          </p>
                        )}
                      </div>
                      <ProductPrice product={product} quantity={cart.get(product.id)} />
                      <button className="remove-cart-item" type="button" onClick={() => removeOneFromCart(product.id)}>
                        Remove one
                      </button>
                    </article>
                  ))}
                  <p className="cart-total">
                    Total: {formatInr(products.reduce((total, product) => (
                      total + getDiscountedPrice(product) * (cart.get(product.id) || 0)
                    ), 0))}
                  </p>
                  <form className="admin-product-form" onSubmit={placeOrder}>
                    <h2>Checkout</h2>
                    <p>Order will be placed for {authUser?.name} ({customerEmail}).</p>
                    <p className="delivery-estimate">
                      Estimated delivery: {formatDeliveryEstimate(getDeliveryEstimate())} (3-5 business days; weekends excluded).
                    </p>
                    <div className="admin-form-grid">
                      <div className="admin-field admin-description-field">
                        <label htmlFor="order-shipping-address">Delivery address</label>
                        <textarea
                          id="order-shipping-address"
                          name="shippingAddress"
                          rows={3}
                          maxLength={1000}
                          autoComplete="street-address"
                          required
                        />
                      </div>
                      <div className="admin-field">
                        <label htmlFor="order-payment-method">Payment option</label>
                        <select id="order-payment-method" name="paymentMethod" defaultValue="cash_on_delivery" required>
                          <option value="cash_on_delivery">Cash on delivery</option>
                          <option value="upi">UPI</option>
                          <option value="credit_debit_card">Credit/debit card</option>
                          <option value="net_banking">Net banking</option>
                          <option value="digital_wallet">Digital wallets</option>
                        </select>
                      </div>
                    </div>
                    <p>Payment selections are recorded with your order. Online payments are not currently processed.</p>
                    <button
                      className="login-submit place-order-button"
                      type="submit"
                      disabled={isOrderSubmitting || cartHasUnavailableItems}
                    >
                      {isOrderSubmitting ? 'Saving order...' : cartHasUnavailableItems ? 'Update cart stock' : 'Place order'}
                    </button>
                  </form>
                </div>
              )}
            </section>
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
