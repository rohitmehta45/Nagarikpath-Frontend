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

    // Only swallow 404s on optional GET endpoints — never on POST/PATCH.
    const isReadOnly =
      (err?.config?.method || 'get').toLowerCase() === 'get';

    const optionalReads = [
      '/audit-logs',
      '/government-notices',
      '/notifications'
    ];

    if (
      status === 404 &&
      isReadOnly &&
      optionalReads.some(p => url.includes(p))
    ) {
      return Promise.resolve({ data: {} });
    }

    // If the token is invalid/expired, clear it so the UI can redirect.
    if (status === 401) {
      try {
        localStorage.removeItem('databridge_token');
        localStorage.removeItem('databridge_user');
      } catch {}
    }

    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Network error';

    const wrapped = new Error(message);
    wrapped.status = status;
    wrapped.response = err?.response;
    return Promise.reject(wrapped);
  }
);

export default api;