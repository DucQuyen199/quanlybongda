import axios from 'axios';

const API_URL = 'http://localhost:5000/api/giaidau';

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

const giaiDauService = {
  getAllGiaiDau: async () => {
    return await apiClient.get('/');
  },
  
  getGiaiDauById: async (id) => {
    return await apiClient.get(`/${id}`);
  },
  
  createGiaiDau: async (giaiDauData) => {
    return await apiClient.post('/', giaiDauData);
  },
  
  updateGiaiDau: async (id, giaiDauData) => {
    return await apiClient.put(`/${id}`, giaiDauData);
  },
  
  deleteGiaiDau: async (id) => {
    return await apiClient.delete(`/${id}`);
  }
};

export default giaiDauService; 