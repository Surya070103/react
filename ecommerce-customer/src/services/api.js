const API_BASE_URL = '/api';

const toProduct = (product) => ({
  id: String(product.id),
  name: product.name,
  category: product.category,
  description: product.description,
  price: Number(product.price),
  image: product.imageUrl || '/images/everyday-shirt.png',
});

const toUser = (user) => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  phoneno: Number(user.phoneno),
  status: user.status,
  orders: Number(user.orders || 0),
  joined: user.joined,
  actions: user.actions || '',
});

const toOrder = (order) => ({
  id: String(order.id),
  customerId: String(order.customerId),
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  items: order.items.map((item) => ({
    ...item,
    productId: String(item.productId),
    price: Number(item.price),
    quantity: Number(item.quantity),
  })),
  total: Number(order.total),
  createdAt: order.createdAt,
  shippingAddress: order.shippingAddress || '',
  paymentMethod: order.paymentMethod,
  status: order.status || 'placed',
});

const toAuthUser = (user) => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: user.role,
});

const getErrorMessage = async (response, fallback) => {
  try {
    const body = await response.json();
    if (typeof body.message === 'string') {
      return body.message;
    }
  } catch {
    // Use the operation-specific fallback for non-JSON error responses.
  }
  return fallback;
};

export const api = {
  async registerAccount(accountData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to create account'));
    }
    return toAuthUser((await response.json()).user);
  },

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to sign in'));
    }
    return toAuthUser((await response.json()).user);
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`);
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to restore session'));
    }
    return toAuthUser((await response.json()).user);
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to log out'));
    }
  },

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to fetch customers'));
    }
    const data = await response.json();
    return data.map(toUser);
  },

  async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to create customer'));
    }
    return toUser(await response.json());
  },

  async updateUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to update customer'));
    }
    return toUser(await response.json());
  },

  async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to delete customer'));
    }
  },

  async resetUserPassword(id, password) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to reset customer password'));
    }
  },

  async getProducts() {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to fetch products'));
    }
    const data = await response.json();
    return data.map(toProduct);
  },

  async getProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to fetch product'));
    }
    return toProduct(await response.json());
  },

  async createProduct(productData) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: productData.name,
        category: productData.category,
        description: productData.description,
        price: productData.price,
        imageUrl: productData.image,
      }),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to create product'));
    }
    return toProduct(await response.json());
  },

  async updateProduct(id, productData) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: productData.name,
        category: productData.category,
        description: productData.description,
        price: productData.price,
        imageUrl: productData.image,
      }),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to update product'));
    }
    return toProduct(await response.json());
  },

  async deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to delete product'));
    }
  },

  async getCart(cartKey) {
    const response = await fetch(`${API_BASE_URL}/carts/${cartKey}`);
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to fetch cart'));
    }
    return (await response.json()).map((item) => ({
      productId: String(item.productId),
      quantity: Number(item.quantity),
    }));
  },

  async saveCart(cartKey, items) {
    const response = await fetch(`${API_BASE_URL}/carts/${cartKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items.map((item) => ({
        productId: Number(item.productId),
        quantity: item.quantity,
      }))),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to save cart'));
    }
  },

  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to fetch orders'));
    }
    return (await response.json()).map(toOrder);
  },

  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to place order'));
    }
    return toOrder(await response.json());
  },

  async cancelOrder(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Failed to cancel order'));
    }
    return toOrder(await response.json());
  },
};
