import api from './api';

export const attemptService = {
  startAttempt: (examId) => api.post(`/exams/${examId}/attempts`),
  getAttempt: (attemptId) => api.get(`/attempts/${attemptId}`),
  saveAnswers: (attemptId, data) => api.patch(`/attempts/${attemptId}/answers`, data),
  toggleReview: (attemptId, data) => api.patch(`/attempts/${attemptId}/review`, data),
  submitAttempt: (attemptId, data = {}) => api.post(`/attempts/${attemptId}/submit`, data),
};
