import api from './api';

export const getMaintenanceRecords = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const response = await api.get(`/maintenance?${params.toString()}`);
  return response.data.data;
};

export const startMaintenance = async (payload) => {
  const response = await api.post('/maintenance', payload);
  return response.data;
};

export const finishMaintenance = async (id, payload) => {
  const response = await api.patch(`/maintenance/${id}`, payload);
  return response.data;
};
