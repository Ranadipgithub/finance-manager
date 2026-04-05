import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && originalRequest && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh') && !originalRequest._retry) {
      originalRequest._retry = true;

      try {

        const refreshResponse = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        const newToken = refreshResponse.data.data.token;
        setAccessToken(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
