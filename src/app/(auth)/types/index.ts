export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  surname?: string | null;
  role: "PARENT" | "CLINICIAN" | "ADMIN" | "patient" | "caregiver" | "admin";
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  surname?: string;
  role: "PARENT" | "CLINICIAN" | "patient" | "caregiver";
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}
