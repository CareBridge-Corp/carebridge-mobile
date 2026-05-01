import { apiClient } from "../../../shared/api/client";
import {
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
} from "../types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // API returns { message, accessToken, user }
    const response = await apiClient.post<any>("/auth/login", credentials);
    if (response && response.accessToken) {
      // Map it to AuthResponse
      return {
        token: response.accessToken,
        user: response.user
      };
    }
    throw new Error(response?.message || "Login failed");
  },

  register: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    // Note: The API docs say POST /api/auth/register
    // And it doesn't return accessToken immediately (usually), but maybe we map it?
    // Docs: "message": "User registered successfully", "user": { ... }
    const response = await apiClient.post<any>("/auth/register", credentials);
    if (response && response.user) {
      return {
        token: "", // Requires login to get token as per docs usually, unless otherwise returned
        user: response.user
      };
    }
    throw new Error(response?.message || "Registration failed");
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
  },
};
