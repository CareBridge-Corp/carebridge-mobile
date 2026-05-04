import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Multipart API Client class for file uploads
class MultipartApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api",
      timeout: 60000, // Longer timeout for file uploads
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token and log request
    this.client.interceptors.request.use(
      async (config) => {
        console.log(
          `[Multipart API Request] ${config.method?.toUpperCase()} ${config.baseURL || ""}${config.url}`,
        );

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
          `[Multipart API Response] ${response.config.method?.toUpperCase()} ${response.config.baseURL || ""}${response.config.url} - Status: ${response.status}`,
        );
        return response.data;
      },
      async (error: AxiosError) => {
        console.log(
          `[Multipart API Error] ${error.config?.method?.toUpperCase()} ${error.config?.baseURL || ""}${error.config?.url} - Status: ${error.response?.status || "UNKNOWN"}`,
        );

        if (error.response?.data) {
          console.log(
            `[Multipart API Error Data]`,
            JSON.stringify(error.response.data, null, 2),
          );
        }

        if (error.response?.status === 401) {
          // Clear token on unauthorized
          try {
            await SecureStore.deleteItemAsync("authToken");
          } catch (e) {}
        }
        return Promise.reject(this.handleError(error));
      },
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const message =
        (error.response.data as any)?.message ||
        (error.response.data as any)?.error?.message ||
        "Server error";
      return new Error(message);
    } else if (error.request) {
      return new Error("Network error. Please check your connection.");
    } else {
      return new Error(error.message || "An unexpected error occurred");
    }
  }

  // HTTP Methods (typically only POST, PUT, PATCH are used for multipart)
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
}

// Export singleton instance
export const multipartApiClient = new MultipartApiClient();
export default multipartApiClient;
