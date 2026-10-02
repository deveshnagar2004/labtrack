import api from './api';

export const getDashboardSummary = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

export const getEquipmentUtilization = async () => {
  const response = await api.get('/analytics/equipment-utilization');
  return response.data;
};

export const getMaintenanceStats = async () => {
  const response = await api.get('/analytics/maintenance');
  return response.data;
};

export const getBookingStats = async () => {
  const response = await api.get('/analytics/bookings');
  return response.data;
};
