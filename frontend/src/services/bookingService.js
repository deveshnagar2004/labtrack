import api from './api';

export const getAllBookings = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const response = await api.get(`/bookings?${params.toString()}`);
  return response.data.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/bookings/my');
  return response.data.data;
};

export const requestBooking = async (payload) => {
  const response = await api.post('/bookings', payload);
  return response.data;
};

export const approveBooking = async (id) => {
  const response = await api.patch(`/bookings/${id}/approve`);
  return response.data;
};

export const rejectBooking = async (id) => {
  const response = await api.patch(`/bookings/${id}/reject`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};
