import api from './api';

export const getLabs = async () => {
  const response = await api.get('/labs');
  return response.data.data;
};

export const createLab = async (payload) => {
  const response = await api.post('/labs', payload);
  return response.data;
};

export const updateLab = async (id, payload) => {
  const response = await api.patch(`/labs/${id}`, payload);
  return response.data;
};

export const deleteLab = async (id) => {
  const response = await api.delete(`/labs/${id}`);
  return response.data;
};
