import api from './axios';

export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  uploadDocuments: (id, formData) =>
    api.post(`/tasks/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  downloadDocument: (taskId, docId) =>
    api.get(`/tasks/${taskId}/documents/${docId}`, { responseType: 'blob' }),
  deleteDocument: (taskId, docId) =>
    api.delete(`/tasks/${taskId}/documents/${docId}`),
};
