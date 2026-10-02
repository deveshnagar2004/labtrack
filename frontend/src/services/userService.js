import api from './api';

export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const response = await api.get(`/users?${params.toString()}`);
  return response.data.data;
};

export const updateUser = async (id, payload) => {
  const response = await api.patch(`/users/${id}`, payload);
  return response.data;
};

export const deactivateUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
