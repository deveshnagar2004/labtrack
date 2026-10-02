import api from './api';

export const getEquipment = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const response = await api.get(`/equipment?${params.toString()}`);
  return response.data.data;
};

export const getEquipmentById = async (id) => {
  const response = await api.get(`/equipment/${id}`);
  return response.data.data;
};

export const createEquipment = async (payload) => {
  const response = await api.post('/equipment', payload);
  return response.data;
};

export const updateEquipment = async (id, payload) => {
  const response = await api.patch(`/equipment/${id}`, payload);
  return response.data;
};

export const retireEquipment = async (id) => {
  const response = await api.delete(`/equipment/${id}`);
  return response.data;
};

export const getEquipmentQrImage = async (id) => {
  const response = await api.get(`/equipment/${id}/qr-image`);
  return response.data.data;
};

export const scanEquipmentQr = async (code) => {
  const response = await api.get(`/equipment/qr/${encodeURIComponent(code)}`);
  return response.data.data;
};
