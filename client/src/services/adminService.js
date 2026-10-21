import api from './api';

export const adminService = {
  getStudents: (params = {}) => api.get('/admin/students', { params }),
  updateStudentStatus: (id, data) => api.patch(`/admin/students/${id}/status`, data),
  getStudentActivity: (params = {}) => api.get('/admin/student-activity', { params }),
};
