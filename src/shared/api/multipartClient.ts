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
      timeout: 120000, // 2 minutes timeout for file uploads
      withCredentials: true,
      headers: {
        Accept: "application/json",
        // DO NOT set Content-Type here - let axios set it with the boundary
      },
      // Essential for React Native FormData to prevent Axios from messing with the payload
      transformRequest: (data) => data,
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

        // Let axios automatically set Content-Type for FormData
        // Remove any Content-Type header if data is FormData
        if (config.data instanceof FormData && config.headers) {
          config.headers["Content-Type"] = "multipart/form-data";
          delete config.headers["content-type"];
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
        const status = error.response?.status || "UNKNOWN";
        const url = `${error.config?.baseURL || ""}${error.config?.url}`;

        console.log("[Multipart API Error Details]", {
          message: error.message,
          code: error.code,
          status,
          url,
        });

        // Log more details about the error
        if (error.response?.data) {
          console.log(
            `[Multipart API Error Data]`,
            JSON.stringify(error.response.data, null, 2),
          );
        } else if (error.request) {
          console.log(
            `[Multipart API Error] No response received. This could be a network error, timeout, or CORS issue.`,
          );
          console.log(`[Multipart API Error] Error message:`, error.message);
          console.log(`[Multipart API Error] Error code:`, error.code);
        } else {
          console.log(
            `[Multipart API Error] Request setup error:`,
            error.message,
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
      const data = error.response.data as any;
      const message =
        data?.message ||
        (typeof data?.error === "string" ? data.error : data?.error?.message) ||
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
    try {
      const response = await this.client.post(url, data, config);
      return response as unknown as Promise<T>;
    } catch (error) {
      console.log("[Multipart API] Post request failed:", error);
      throw error;
    }
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
