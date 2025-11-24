import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nettoyer l'authentification
      localStorage.removeItem('token');
      localStorage.removeItem('auth_user');
      // Ne pas rediriger automatiquement, laisser le composant gérer
    }
    // Ne pas bloquer le rendu si le backend n'est pas accessible
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend not accessible:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
