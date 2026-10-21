import api from './api';

export const practiceService = {
  // Practice Tests Catalog & Details
  getPracticeTests: (params) => api.get('/practice-tests', { params }),
  getPracticeSubjects: () => api.get('/practice-tests/subjects'),
  getPracticeTest: (id) => api.get(`/practice-tests/${id}`),

  // Student Attempt Lifecycle
  startPracticeAttempt: (practiceTestId, retry = false) =>
    api.post(`/practice-tests/${practiceTestId}/attempts${retry ? '?retry=true' : ''}`),
  getPracticeAttempt: (attemptId) => api.get(`/practice-attempts/${attemptId}`),
  submitPracticeAnswer: (attemptId, payload) =>
    api.post(`/practice-attempts/${attemptId}/answer`, payload),
  submitPracticeAttempt: (attemptId) =>
    api.post(`/practice-attempts/${attemptId}/submit`),
  getMyPracticeHistory: () => api.get('/practice-attempts/my-history'),

  // Practice Results
  getPracticeResult: (resultId) => api.get(`/practice-results/${resultId}`),

  // Admin Practice Management
  createPracticeTest: (data) => api.post('/practice-tests', data),
  updatePracticeTest: (id, data) => api.put(`/practice-tests/${id}`, data),
  deletePracticeTest: (id) => api.delete(`/practice-tests/${id}`),

  // Admin Student Activity & Attempt Analytics
  getAdminPracticeAttempts: (params) => api.get('/admin/practice-attempts', { params }),
  getAdminStudentActivity: (params) => api.get('/admin/student-activity', { params }),
};
