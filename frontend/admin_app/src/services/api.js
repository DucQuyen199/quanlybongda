import axios from 'axios';

// Define the backend URL explicitly
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

console.log("API Service initialized with backend URL:", BACKEND_URL);

// Add explicit debug message
if (process.env.NODE_ENV !== 'production') {
  console.log("Running in development mode - connecting to backend at http://localhost:5001/api");
}

// Create axios instance with an explicit base URL
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log("API Request:", config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response ? `${error.response.status} ${error.response.statusText}` : error.message);
    
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
  // Basic CRUD operations
  getAll: () => api.get('/giaidau'),
  getById: (id) => api.get(`/giaidau/${id}`),
  create: (data) => api.post('/giaidau', data),
  update: (id, data) => api.put(`/giaidau/${id}`, data),
  delete: (id) => api.delete(`/giaidau/${id}`),
  
  // Advanced admin operations
  getPaginated: (page = 1, limit = 10, search = '', status) => {
    const params = { page, limit, search };
    if (status) params.status = status;
    return api.get('/giaidau/admin/paginated', { params });
  },
  getDetailForAdmin: (id) => api.get(`/giaidau/admin/detail/${id}`),
  
  // Team management in tournaments
  addTeam: (data) => api.post('/giaidau/team', data),
  removeTeam: (tournamentId, teamId) => api.delete(`/giaidau/${tournamentId}/team/${teamId}`),
};

// Teams API
export const doiBongAPI = {
  // Basic CRUD operations
  getAll: () => api.get('/doibong'),
  getPaginated: (page = 1, limit = 10, search = '') => {
    const params = { page, limit, search };
    return api.get('/doibong', { params });
  },
  getById: (id) => api.get(`/doibong/${id}`),
  create: (data) => api.post('/doibong', data),
  update: (id, data) => api.put(`/doibong/${id}`, data),
  delete: (id) => api.delete(`/doibong/${id}`)
};

// Players API
export const cauThuAPI = {
  getAll: () => api.get('/cauthu'),
  getPaginated: (page = 1, limit = 10, search = '') => {
    const params = { page, limit, search };
    return api.get('/cauthu', { params });
  },
  getById: (id) => api.get(`/cauthu/${id}`),
  create: (data) => api.post('/cauthu', data),
  update: (id, data) => api.put(`/cauthu/${id}`, data),
  delete: (id) => api.delete(`/cauthu/${id}`),
};

// Schedule API
export const lichThiDauAPI = {
  getAll: () => api.get('/lichtd'),
  getPaginated: (page = 1, limit = 10, search = '') => {
    const params = { page, limit, search };
    return api.get('/lichtd', { params });
  },
  getById: (id) => api.get(`/lichtd/${id}`),
  create: (data) => api.post('/lichtd', data),
  update: (id, data) => api.put(`/lichtd/${id}`, data),
  delete: (id) => api.delete(`/lichtd/${id}`),
};

export default api; 