import api from './api';

export const getTransactions = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.append(key, value);
  });
  const response = await api.get(`/transactions?${params.toString()}`);
  return response.data.data;
};

export const issueEquipment = async (payload) => {
  const response = await api.post('/transactions/issue', payload);
  return response.data;
};

export const returnEquipment = async (payload) => {
  const response = await api.post('/transactions/return', payload);
  return response.data;
};
