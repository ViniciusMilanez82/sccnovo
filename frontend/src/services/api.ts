import axios from 'axios';

// Em produção, o Nginx faz proxy de /api/ para o backend (sem URL absoluta).
// Em desenvolvimento local, o Vite proxy também redireciona /api para localhost:3000.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('scc_token');
      localStorage.removeItem('scc_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
