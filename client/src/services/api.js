import axios from 'axios';

const TOKEN_KEY = 'smartcrm_token';

// Token storage helpers
export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401 Unauthorized, clear token and redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
      const currentPath = window.location.pathname;
      if (!publicPaths.includes(currentPath)) {
        clearStoredToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authLogin = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const authRegister = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const authGoogle = async (credential) => {
  const res = await api.post('/auth/google', { credential });
  return res.data;
};

export const authGetMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const authUpdateProfile = async (data) => {
  const res = await api.put('/auth/profile', data);
  return res.data;
};

export const authChangePassword = async (data) => {
  const res = await api.put('/auth/change-password', data);
  return res.data;
};

export const authForgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

export const authResetPassword = async (data) => {
  const res = await api.post('/auth/reset-password', data);
  return res.data;
};

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getWooStatus = async () => {
  const res = await api.get('/health/woocommerce');
  return res.data;
};

export const syncWoo = async () => {
  const res = await api.post('/sync');
  return res.data;
};

export const getDashboardSummary = async () => {
  const res = await api.get('/dashboard/summary');
  return res.data;
};

export const getCustomers = async (params = {}) => {
  const res = await api.get('/customers', { params });
  return res.data;
};

export const getCustomer = async (id) => {
  const res = await api.get(`/customers/${id}`);
  return res.data;
};

export const updateCustomerCrm = async (id, data) => {
  const res = await api.patch(`/customers/${id}`, data);
  return res.data;
};

export const getCustomerOrders = async (id) => {
  const res = await api.get(`/customers/${id}/orders`);
  return res.data;
};

export const getCustomerInteractions = async (id) => {
  const res = await api.get(`/customers/${id}/interactions`);
  return res.data;
};

export const addCustomerInteraction = async (id, data) => {
  const res = await api.post(`/customers/${id}/interactions`, data);
  return res.data;
};

export const getFollowups = async (params = {}) => {
  const res = await api.get('/followups', { params });
  return res.data;
};

export const createFollowup = async (data) => {
  const res = await api.post('/followups', data);
  return res.data;
};

export const updateFollowup = async (id, data) => {
  const res = await api.patch(`/followups/${id}`, data);
  return res.data;
};

export const getMessageTemplates = async (customerId, orderId = null) => {
  const res = await api.post(`/customers/${customerId}/message`, { orderId });
  return res.data;
};

export default api;
