import api from './api';

export const examService = {
  getExams: (params = {}) => api.get('/exams', { params }),
  getExam: (id) => api.get(`/exams/${id}`),
  createExam: (data) => api.post('/exams', data),
  updateExam: (id, data) => api.put(`/exams/${id}`, data),
  deleteExam: (id) => api.delete(`/exams/${id}`),
  togglePublish: (id) => api.patch(`/exams/${id}/publish`),
  getCategories: () => api.get('/exams/categories'),
};
