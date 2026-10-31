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
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 120000, // 2 minutes timeout for file uploads
      withCredentials: true,
      headers: {
        Accept: "application/json",
        // DO NOT set Content-Type here - let axios set it with the boundary
      },
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

        // React Native must set multipart boundary itself — never set Content-Type manually.
        if (config.data instanceof FormData && config.headers) {
          delete config.headers["Content-Type"];
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
  private async postNativeFormData<T>(url: string, data: FormData): Promise<T> {
    const token = await SecureStore.getItemAsync("authToken");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    const requestUrl = `${this.baseURL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

    if (__DEV__) {
      console.log(`[Multipart API Request] POST ${requestUrl}`);
    }

    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Do not set Content-Type. React Native adds the multipart boundary.
        },
        body: data,
        signal: controller.signal,
      });

      const responseText = await response.text();
      let payload: any = null;
      if (responseText) {
        try {
          payload = JSON.parse(responseText);
        } catch {
          payload = { message: responseText };
        }
      }

      if (__DEV__) {
        console.log(
          `[Multipart API Response] POST ${requestUrl} - Status: ${response.status}`,
        );
      }

      if (!response.ok) {
        if (response.status === 401) {
          await SecureStore.deleteItemAsync("authToken").catch(() => {});
        }
        const message =
          payload?.message ||
          (typeof payload?.error === "string"
            ? payload.error
            : payload?.error?.message) ||
          `Upload failed with status ${response.status}`;
        throw new Error(message);
      }

      return payload as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Upload timed out. Please try again.");
      }
      if (error instanceof Error) throw error;
      throw new Error("Network error. Please check your connection.");
    } finally {
      clearTimeout(timeout);
    }
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    if (data instanceof FormData) {
      return this.postNativeFormData<T>(url, data);
    }

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
