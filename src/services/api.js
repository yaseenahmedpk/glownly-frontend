import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { disconnectEcho } from "./echo";
import router from "../router";

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
      disconnectEcho();
      const requiresAuth = router.currentRoute.value?.meta?.requiresAuth;
      if (requiresAuth) {
        authStore.logout();
      }
    }

    return Promise.reject(error);
  },
);
export default API;
