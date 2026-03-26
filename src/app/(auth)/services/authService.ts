import apiClient from "../../../shared/api/client";
import { ApiResponse } from "../../../shared/types/api";
import {
    AuthError,
    AuthResponse,
    LoginCredentials,
    SignupCredentials,
} from "../types";

function isApiError(
  error: any,
): error is {
  error: { code: string; message: string; details?: Record<string, string[]> };
} {
  return error && typeof error === "object" && "error" in error;
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
    );
    return response.data.data;
  } catch (error) {
    if (isApiError(error)) {
      throw {
        code: error.error.code,
        message: error.error.message,
        field: error.error.details?.email?.[0]
          ? "email"
          : error.error.details?.password?.[0]
            ? "password"
            : undefined,
      } as AuthError;
    }
    throw error;
  }
}

export async function signup(
  credentials: SignupCredentials,
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/signup",
      credentials,
    );
    return response.data.data;
  } catch (error) {
    if (isApiError(error)) {
      throw {
        code: error.error.code,
        message: error.error.message,
        field: error.error.details?.email?.[0]
          ? "email"
          : error.error.details?.password?.[0]
            ? "password"
            : error.error.details?.name?.[0]
              ? "name"
              : undefined,
      } as AuthError;
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    // Logout should succeed even if API call fails
    console.error("Logout API call failed:", error);
  }
}
