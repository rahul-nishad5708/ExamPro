import api from './api';

export const questionService = {
  getQuestions: (examId) => api.get(`/exams/${examId}/questions`),
  createQuestion: (examId, data) => api.post(`/exams/${examId}/questions`, data),
  updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  duplicateQuestion: (id) => api.post(`/questions/${id}/duplicate`),
  reorderQuestions: (examId, questionIds) =>
    api.post(`/exams/${examId}/questions/reorder`, { questionIds }),
};
