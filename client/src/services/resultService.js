import api from './api';

export const resultService = {
  getMyResults: (params = {}) => api.get('/results/my', { params }),
  getResult: (id) => api.get(`/results/${id}`),
  getAdminResults: (params = {}) => api.get('/admin/results', { params }),
  getAdminDashboard: () => api.get('/admin/dashboard'),
  getStudentDashboard: () => api.get('/dashboard/student'),
};
