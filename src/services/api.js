import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/**
 * REQUEST INTERCEPTOR
 */
API.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * RESPONSE INTERCEPTOR
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore();

    if (error.response?.status === 401) {
    }

    return Promise.reject(error);
  },
);
export default API;
