import axios from 'axios';

const API_URL = 'http://localhost:5000/api/nguoidung';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const authService = {
  login: async (username, password) => {
    return await apiClient.post('/login', { username, password });
  },
  
  register: async (userData) => {
    return await apiClient.post('/register', userData);
  },
  
  getCurrentUser: async () => {
    return await apiClient.get('/me');
  },
  
  getAllUsers: async () => {
    return await apiClient.get('/');
  },
  
  getUserById: async (id) => {
    return await apiClient.get(`/${id}`);
  },
  
  createUser: async (userData) => {
    return await apiClient.post('/', userData);
  },
  
  updateUser: async (id, userData) => {
    return await apiClient.put(`/${id}`, userData);
  },
  
  deleteUser: async (id) => {
    return await apiClient.delete(`/${id}`);
  }
};

export default authService; 