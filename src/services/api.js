import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  try {
    const token = localStorage.getItem('databridge_token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}

  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err?.response?.status;
    const url = err?.config?.url || '';

    const optional = [
      '/audit-logs',
      '/government-notices',
      '/notifications'
    ];

    if (
      status === 404 &&
      optional.some(p => url.includes(p))
    ) {
      return Promise.resolve({ data: {} });
    }

    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Network error';

    const wrapped = new Error(message);
    wrapped.status = status;

    return Promise.reject(wrapped);
  }
);

export default api;