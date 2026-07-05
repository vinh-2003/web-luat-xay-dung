import axios from 'axios';
import Cookies from 'js-cookie';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid
        Cookies.remove('access_token');
        // Tùy theo logic app, có thể redirect về login:
        // if (typeof window !== 'undefined') window.location.href = '/login';
      }
      
      // Handle FastAPI validation error (422) where detail is an array
      if (error.response.data && Array.isArray(error.response.data.detail)) {
        error.response.data.detail = error.response.data.detail.map((err: any) => err.msg).join(', ');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
