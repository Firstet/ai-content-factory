import axios from 'axios';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3001/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor updates baseURL dynamically per request
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('acf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('acf_refresh_token');
        const userId = localStorage.getItem('acf_user_id');
        if (refreshToken && userId) {
          const res = await axios.post(`${getApiBaseUrl()}/auth/refresh`, { userId, refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data;
          localStorage.setItem('acf_token', accessToken);
          localStorage.setItem('acf_refresh_token', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (e) {
        localStorage.removeItem('acf_token');
        localStorage.removeItem('acf_refresh_token');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
