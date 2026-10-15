import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
