import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function addId(obj) {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    if (obj.id !== undefined && obj._id === undefined) obj._id = obj.id;
    for (const v of Object.values(obj)) addId(v);
  } else if (Array.isArray(obj)) {
    obj.forEach(addId);
  }
  return obj;
}

api.interceptors.response.use(
  (response) => { addId(response.data); return response; },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
