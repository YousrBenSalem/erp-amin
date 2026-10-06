const API_URL = 'http://localhost:3001/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erreur serveur' }));
    throw new Error(err.message || 'Erreur serveur');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },
  products: {
    getAll: () => request<any[]>('/products'),
    create: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  },
  categories: {
    getAll: () => request<any[]>('/categories'),
    getOne: (id: string) => request<any>(`/categories/${id}`),
    create: (data: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/categories/${id}`, { method: 'DELETE' }),
  },
  stock: {
    getStatus: () => request<any[]>('/stock'),
    getMovements: (productId?: string) => request<any[]>(`/stock/movements${productId ? `?productId=${productId}` : ''}`),
    addMovement: (data: any) => request<any>('/stock/movements', { method: 'POST', body: JSON.stringify(data) }),
  },
  customers: {
    getAll: () => request<any[]>('/customers'),
    create: (data: any) => request<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/customers/${id}`, { method: 'DELETE' }),
    getCredits: () => request<any[]>('/customers/credits'),
  },
  users: {
    getAll: () => request<any[]>('/users'),
    create: (data: any) => request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/users/${id}`, { method: 'DELETE' }),
  },
  suppliers: {
    getAll: () => request<any[]>('/suppliers'),
    create: (data: any) => request<any>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/suppliers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/suppliers/${id}`, { method: 'DELETE' }),
  },
  purchases: {
    getAll: () => request<any[]>('/purchases'),
    create: (data: any) => request<any>('/purchases', { method: 'POST', body: JSON.stringify(data) }),
    receive: (id: string) => request<any>(`/purchases/${id}/receive`, { method: 'POST' }),
  },
  sales: {
    getAll: () => request<any[]>('/sales'),
    create: (data: any) => request<any>('/sales', { method: 'POST', body: JSON.stringify(data) }),
  },
  invoices: {
    getAll: () => request<any[]>('/invoices'),
    getOne: (id: string) => request<any>(`/invoices/${id}`),
    cancel: (id: string) => request<any>(`/invoices/${id}/cancel`, { method: 'POST' }),
  },
  payments: {
    getAll: () => request<any[]>('/payments'),
    create: (data: any) => request<any>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  },
  reports: {
    getDashboard: (from?: string, to?: string) => request<any>(`/reports/dashboard${from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString()}` : ''}`),
    getSales: (from?: string, to?: string) => request<any>(`/reports/sales${from || to ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) }).toString()}` : ''}`),
    getStock: () => request<any>('/reports/stock'),
    getTopProducts: () => request<any[]>('/reports/top-products'),
  },
  settings: {
    get: () => request<any>('/settings'),
    update: (data: any) => request<any>('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  activity: {
    getAll: () => request<any[]>('/activity'),
  },
};
