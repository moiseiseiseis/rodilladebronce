// src/lib/types/auth.ts

export type UserRole = "PATIENT" | "CLINICIAN" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}
