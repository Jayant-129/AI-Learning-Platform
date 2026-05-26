import axios from 'axios';
import logger from './logger';

// Empty baseURL means all requests use relative URLs — Nginx proxies /api/* to Spring Boot
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logger.api(config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    logger.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    logger.error(`API Error [${status}]: ${message}`);

    if (status === 401) {
      // Token expired or invalid — clear and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ---- Auth API ----
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  me: () => api.get('/api/auth/me'),
};

// ---- Learners API ----
export const learnersAPI = {
  getAll: () => api.get('/api/learners'),
  getById: (id) => api.get(`/api/learners/${id}`),
  create: (data) => api.post('/api/learners', data),
  update: (id, data) => api.put(`/api/learners/${id}`, data),
  delete: (id) => api.delete(`/api/learners/${id}`),
  uploadCsv: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/learners/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ---- Placements API ----
export const placementsAPI = {
  getDrives: () => api.get('/api/placements/drives'),
  getDrive: (id) => api.get(`/api/placements/drives/${id}`),
  createDrive: (data) => api.post('/api/placements/drives', data),
  updateDrive: (id, data) => api.put(`/api/placements/drives/${id}`, data),
  deleteDrive: (id) => api.delete(`/api/placements/drives/${id}`),
  getApplications: () => api.get('/api/placements/applications'),
  getApplicationsByDrive: (driveId) => api.get(`/api/placements/applications/drive/${driveId}`),
  getApplicationsByLearner: (learnerId) => api.get(`/api/placements/applications/learner/${learnerId}`),
  apply: (learnerId, driveId) => api.post('/api/placements/applications', { learnerId, driveId }),
  updateApplicationStatus: (id, status, result) =>
    api.put(`/api/placements/applications/${id}/status`, { status, result }),
};

// ---- ML API ----
export const mlAPI = {
  predict: (learnerId) => api.post(`/api/ml/predict/${learnerId}`),
  getHistory: (learnerId) => api.get(`/api/ml/history/${learnerId}`),
};

// ---- Dashboard API ----
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

// ---- Notifications API ----
export const notificationsAPI = {
  getByUser: (userId) => api.get(`/api/notifications/user/${userId}`),
  getUnread: (userId) => api.get(`/api/notifications/user/${userId}/unread`),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/api/notifications/user/${userId}/read-all`),
  create: (userId, message, type) => api.post('/api/notifications', { userId, message, type }),
};

// ---- Assessments API ----
export const assessmentsAPI = {
  getAll: () => api.get('/api/assessments'),
  getByLearner: (learnerId) => api.get(`/api/assessments/learner/${learnerId}`),
  create: (data) => api.post('/api/assessments', data),
  update: (id, data) => api.put(`/api/assessments/${id}`, data),
  delete: (id) => api.delete(`/api/assessments/${id}`),
};

// ---- Users API (Admin) ----
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getMentors: () => api.get('/api/users/mentors'),
  updateRole: (id, role) => api.put(`/api/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/api/users/${id}`),
};

// ---- Learner Profile (Self-service) ----
export const profileAPI = {
  getMe: () => api.get('/api/profile/me'),
  updateMe: (data) => api.put('/api/profile/me', data),
};

// ---- Analytics (Python ML Service) ----
// Python ML is proxied through Spring Boot's /api/ml/* — no direct browser connection needed
const ML_URL = import.meta.env.VITE_ML_URL || '';
export const analyticsAPI = {
  topLearners: (limit = 10) => api.get(`${ML_URL}/analytics/top-learners?limit=${limit}`),
  weakLearners: (threshold = 6.5) => api.get(`${ML_URL}/analytics/weak-learners?gpa_threshold=${threshold}`),
  batchPerformance: () => api.get(`${ML_URL}/analytics/batch-performance`),
  placementTrends: () => api.get(`${ML_URL}/analytics/placement-trends`),
};

export default api;

