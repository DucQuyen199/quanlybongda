import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  getProfile: () => api.get('/auth/profile'),
};

// Tournaments API
export const giaiDauAPI = {
  getAll: () => api.get('/giaidau'),
  getById: (id) => api.get(`/giaidau/${id}`),
  create: (data) => api.post('/giaidau', data),
  update: (id, data) => api.put(`/giaidau/${id}`, data),
  delete: (id) => api.delete(`/giaidau/${id}`),
};

// Teams API
export const doiBongAPI = {
  getAll: () => api.get('/doibong'),
  getById: (id) => api.get(`/doibong/${id}`),
  create: (data) => api.post('/doibong', data),
  update: (id, data) => api.put(`/doibong/${id}`, data),
  delete: (id) => api.delete(`/doibong/${id}`),
};

// Players API
export const cauThuAPI = {
  getAll: () => api.get('/cauthu'),
  getById: (id) => api.get(`/cauthu/${id}`),
  create: (data) => api.post('/cauthu', data),
  update: (id, data) => api.put(`/cauthu/${id}`, data),
  delete: (id) => api.delete(`/cauthu/${id}`),
};

export default api; 