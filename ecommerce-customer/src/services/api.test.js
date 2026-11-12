import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { api } from './api.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('updateProduct sends PATCH to the requested product record ID', async () => {
  const productData = {
    name: 'Updated Mouse',
    category: 'Electronics',
    description: 'Updated description',
    price: 600,
    image: '/images/mouse.jpg',
    stock: 8,
    discountPercent: 15,
    deliveryDate: '2026-12-24',
  }
  const updatedRecord = {
    id: 42,
    ...productData,
    imageUrl: productData.image,
  }
  let request

  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return {
      ok: true,
      json: async () => updatedRecord,
    }
  }

  const result = await api.updateProduct(42, productData)

  assert.equal(request.url, '/api/products/42')
  assert.equal(request.options.method, 'PATCH')
  assert.deepEqual(JSON.parse(request.options.body), {
    name: productData.name,
    category: productData.category,
    description: productData.description,
    price: productData.price,
    imageUrl: productData.image,
    stock: productData.stock,
    discountPercent: productData.discountPercent,
    deliveryDate: productData.deliveryDate,
  })
  assert.deepEqual(result, {
    id: '42',
    name: productData.name,
    category: productData.category,
    description: productData.description,
    price: productData.price,
    stock: productData.stock,
    discountPercent: productData.discountPercent,
    deliveryDate: productData.deliveryDate,
    image: productData.image,
  })
})

test('deleteProduct sends DELETE to the requested product record ID', async () => {
  let request

  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return { ok: true, status: 204 }
  }

  await api.deleteProduct(73)

  assert.equal(request.url, '/api/products/73')
  assert.equal(request.options.method, 'DELETE')
})

test('getUsers loads customer records and normalizes database values', async () => {
  globalThis.fetch = async (url) => {
    assert.equal(url, '/api/users')
    return {
      ok: true,
      json: async () => [{
        id: 2,
        name: 'Priya Patel',
        email: 'priya@example.com',
        phoneno: '9123456780',
        status: 'active',
        orders: '5',
        joined: '2023-01-15T00:00:00.000Z',
        actions: 'Updated profile picture',
      }],
    }
  }

  const users = await api.getUsers()

  assert.deepEqual(users, [{
    id: '2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phoneno: 9123456780,
    status: 'active',
    orders: 5,
    joined: '2023-01-15T00:00:00.000Z',
    actions: 'Updated profile picture',
  }])
})

test('createUser sends customer fields to the users API', async () => {
  const userData = {
    name: 'Sam Lee',
    email: 'sam@example.com',
    phoneno: 1234567890,
    status: 'active',
    orders: 0,
    actions: '',
  }
  let request

  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return {
      ok: true,
      json: async () => ({ id: 3, ...userData, joined: '2026-11-03T00:00:00.000Z' }),
    }
  }

  const result = await api.createUser(userData)

  assert.equal(request.url, '/api/users')
  assert.equal(request.options.method, 'POST')
  assert.deepEqual(JSON.parse(request.options.body), userData)
  assert.equal(result.id, '3')
})

test('updateUser patches the requested customer record ID', async () => {
  const userData = {
    name: 'Priya Patel',
    email: 'priya@example.com',
    phoneno: 9123456780,
    status: 'inactive',
    orders: 5,
    actions: 'Updated profile picture',
  }
  let request

  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return {
      ok: true,
      json: async () => ({ id: 42, ...userData, joined: '2023-01-15T00:00:00.000Z' }),
    }
  }

  const result = await api.updateUser(42, userData)

  assert.equal(request.url, '/api/users/42')
  assert.equal(request.options.method, 'PATCH')
  assert.deepEqual(JSON.parse(request.options.body), userData)
  assert.equal(result.id, '42')
})

test('deleteUser sends DELETE to the requested customer record ID', async () => {
  let request

  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return { ok: true, status: 204 }
  }

  await api.deleteUser(73)

  assert.equal(request.url, '/api/users/73')
  assert.equal(request.options.method, 'DELETE')
})

test('resetUserPassword posts the new password to the requested customer record', async () => {
  let request
  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return { ok: true, status: 204 }
  }

  await api.resetUserPassword(73, 'a-new-password')

  assert.equal(request.url, '/api/users/73/password')
  assert.equal(request.options.method, 'POST')
  assert.deepEqual(JSON.parse(request.options.body), { password: 'a-new-password' })
})

test('getCart loads cart items from the backend', async () => {
  globalThis.fetch = async (url) => {
    assert.match(url, /^\/api\/carts\//)
    return {
      ok: true,
      json: async () => [{ productId: 7, quantity: 2 }],
    }
  }

  const items = await api.getCart('a73c0f55-7d14-4b19-8f72-9d5090e60856')

  assert.deepEqual(items, [{ productId: '7', quantity: 2 }])
})

test('saveCart persists product quantities to the backend', async () => {
  let request
  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return { ok: true, json: async () => [] }
  }

  await api.saveCart('a73c0f55-7d14-4b19-8f72-9d5090e60856', [
    { productId: '7', quantity: 2 },
  ])

  assert.equal(request.options.method, 'PUT')
  assert.deepEqual(JSON.parse(request.options.body), [{ productId: 7, quantity: 2 }])
})

test('createOrder sends the cart key and normalizes the saved order', async () => {
  let request
  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return {
      ok: true,
      json: async () => ({
        id: 8,
        customerId: 3,
        customerName: 'Sam Lee',
        customerEmail: 'sam@example.com',
        items: [{
          productId: 7,
          name: 'Mouse',
          price: '19.99',
          quantity: 2,
          deliveryDate: '2026-12-24T00:00:00.000Z',
        }],
        total: '39.98',
        createdAt: '2026-11-03T00:00:00.000Z',
        shippingAddress: '12 Main Street, Pune',
        paymentMethod: 'cash_on_delivery',
        status: 'placed',
      }),
    }
  }

  const orderData = {
    cartKey: 'a73c0f55-7d14-4b19-8f72-9d5090e60856',
    shippingAddress: '12 Main Street, Pune',
    paymentMethod: 'cash_on_delivery',
  }
  const order = await api.createOrder(orderData)

  assert.equal(request.url, '/api/orders')
  assert.equal(request.options.method, 'POST')
  assert.deepEqual(JSON.parse(request.options.body), orderData)
  assert.deepEqual(order.items, [{
    productId: '7',
    name: 'Mouse',
    price: 19.99,
    quantity: 2,
    deliveryDate: '2026-12-24',
  }])
  assert.equal(order.total, 39.98)
  assert.equal(order.shippingAddress, '12 Main Street, Pune')
  assert.equal(order.paymentMethod, 'cash_on_delivery')
  assert.equal(order.status, 'placed')
})

test('cancelOrder sends DELETE and returns the cancelled order', async () => {
  let request
  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return {
      ok: true,
      json: async () => ({
        id: 8,
        customerId: 3,
        customerName: 'Sam Lee',
        customerEmail: 'sam@example.com',
        items: [],
        total: '39.98',
        createdAt: '2026-11-03T00:00:00.000Z',
        shippingAddress: '12 Main Street, Pune',
        paymentMethod: 'cash_on_delivery',
        status: 'cancelled',
      }),
    }
  }

  const order = await api.cancelOrder('8')

  assert.equal(request.url, '/api/orders/8')
  assert.equal(request.options.method, 'DELETE')
  assert.equal(order.id, '8')
  assert.equal(order.status, 'cancelled')
})

test('registerAccount creates a role-specific account and returns the safe session user', async () => {
  const account = {
    name: 'Taylor Chen',
    email: 'taylor@example.com',
    phoneno: 1234567890,
    password: 'a-strong-password',
    role: 'customer',
  }
  let request
  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return {
      ok: true,
      json: async () => ({ user: { id: 8, name: account.name, email: account.email, role: account.role } }),
    }
  }

  const user = await api.registerAccount(account)

  assert.equal(request.url, '/api/auth/register')
  assert.equal(request.options.method, 'POST')
  assert.deepEqual(JSON.parse(request.options.body), account)
  assert.deepEqual(user, { id: '8', name: account.name, email: account.email, role: 'customer' })
})

test('login and logout use backend session endpoints', async () => {
  const requests = []
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options })
    return {
      ok: true,
      json: async () => ({ user: { id: 8, name: 'Taylor Chen', email: 'taylor@example.com', role: 'customer' } }),
    }
  }

  const user = await api.login('taylor@example.com', 'a-strong-password')
  await api.logout()

  assert.equal(user.role, 'customer')
  assert.equal(requests[0].url, '/api/auth/login')
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    email: 'taylor@example.com',
    password: 'a-strong-password',
  })
  assert.equal(requests[1].url, '/api/auth/logout')
  assert.equal(requests[1].options.method, 'POST')
})
