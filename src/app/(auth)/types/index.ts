export interface User {
  id: string;
  email: string;
  name: string;
  role: "patient" | "caregiver" | "admin";
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  role: "patient" | "caregiver";
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}
