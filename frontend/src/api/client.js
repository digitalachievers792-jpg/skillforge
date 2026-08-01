import axios from 'axios';
import { getCsrfToken } from '../utils/csrf';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const method = String(config.method || 'get').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    config.headers['X-CSRF-Token'] = getCsrfToken();
  }
  return config;
});

let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = client
      .post('/auth/refresh')
      .then((res) => res.data)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || '';

    const isAuthRoute = url.includes('/auth/');
    const skipRefresh =
      isAuthRoute && !url.includes('/auth/refresh');

    if (status === 401 && !original._retried && !skipRefresh) {
      original._retried = true;
      try {
        await refreshAccessToken();
        return client(original);
      } catch {
        window.dispatchEvent(new CustomEvent('skillforge:session-expired'));
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const extractError = (error, fallback = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data;
  if (data?.message) return data.message;
  if (error?.message) return error.message;
  return fallback;
};

export const api = {
  get: (url, params) => client.get(url, { params }).then((r) => r.data),
  post: (url, body) => client.post(url, body).then((r) => r.data),
  put: (url, body) => client.put(url, body).then((r) => r.data),
  patch: (url, body) => client.patch(url, body).then((r) => r.data),
  del: (url) => client.delete(url).then((r) => r.data),
  upload: (url, formData) =>
    client.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  raw: client,
};

export default api;
