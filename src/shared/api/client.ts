import axios from "axios";
import { useAuthStore } from "../../app/(auth)/store/authStore";
import { ApiError } from "../types/api";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for auth token injection
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
    }

    const apiError: ApiError = {
      error: {
        code: error.response?.data?.error?.code || "UNKNOWN_ERROR",
        message: error.response?.data?.error?.message || error.message,
        details: error.response?.data?.error?.details,
      },
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(apiError);
  },
);

export default apiClient;
