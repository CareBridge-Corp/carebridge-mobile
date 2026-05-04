import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Client class
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Needed if relying on HTTP-only cookies like the API docs say, but we also support Bearer tokens
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token and log request
    this.client.interceptors.request.use(
      async (config) => {
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.baseURL || ""}${config.url}`,
        );
        if (config.data) {
          console.log(
            `[API Request Data]`,
            JSON.stringify(config.data, null, 2),
          );
        }

        try {
          const token = await SecureStore.getItemAsync("authToken");
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.log("Error reading token", error);
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - Handle errors globally and log response
    this.client.interceptors.response.use(
      (response) => {
        console.log(
          `[API Response] ${response.config.method?.toUpperCase()} ${response.config.baseURL || ""}${response.config.url} - Status: ${response.status}`,
        );
        return response.data;
      },
      async (error: AxiosError) => {
        console.log(
          `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.baseURL || ""}${error.config?.url} - Status: ${error.response?.status || "UNKNOWN"}`,
        );
        if (error.response?.data) {
          console.log(
            `[API Error Data]`,
            JSON.stringify(error.response.data, null, 2),
          );
        }

        if (error.response?.status === 401) {
          // Clear token on unauthorized
          try {
            await SecureStore.deleteItemAsync("authToken");
          } catch (e) {}
          // Note: In a real app we might redirect to login here
        }
        return Promise.reject(this.handleError(error));
      },
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error, the API documentation usually returns a message
      const message =
        (error.response.data as any)?.message ||
        (error.response.data as any)?.error?.message ||
        "Server error";
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error("Network error. Please check your connection.");
    } else {
      // Something else happened
      return new Error(error.message || "An unexpected error occurred");
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config) as unknown as Promise<T>;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.client.post(url, data, config) as unknown as Promise<T>;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.client.put(url, data, config) as unknown as Promise<T>;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.client.patch(url, data, config) as unknown as Promise<T>;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config) as unknown as Promise<T>;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
