import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_FALLBACK = import.meta.env.VITE_API_URL_FALLBACK;
const WS_URL = import.meta.env.VITE_WS_URL;
const WS_URL_FALLBACK = import.meta.env.VITE_WS_URL_FALLBACK;

const api = axios.create({
  baseURL: API_URL,
});

export { api, WS_URL };

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response && !originalRequest._retry && API_URL_FALLBACK) {
      originalRequest._retry = true;
      originalRequest.baseURL = API_URL_FALLBACK;
      try {
        return await api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export function getWsUrl() {
  return WS_URL;
}

export default api;