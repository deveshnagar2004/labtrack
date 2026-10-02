import api from './api';

export const getIssues = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const response = await api.get(`/issues?${params.toString()}`);
  return response.data.data;
};

export const reportIssue = async (payload) => {
  const response = await api.post('/issues', payload);
  return response.data;
};

export const updateIssueStatus = async (id, status) => {
  const response = await api.patch(`/issues/${id}`, { status });
  return response.data;
};
