// src/lib/api/auth.ts

"use client";

import { apiFetch } from "./client";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from "../types/auth";

const TOKEN_KEY = "sk_token";
const USER_KEY = "sk_user";

export function saveAuthToStorage(payload: LoginResponse): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, payload.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  } catch (err) {
    console.error("[AUTH] Error guardando sesión:", err);
  }
}

export function clearAuthFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error("[AUTH] Error limpiando sesión:", err);
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch (err) {
    console.error("[AUTH] Error leyendo usuario:", err);
    return null;
  }
}

export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const payload = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    auth: false,
  });

  console.debug("[AUTH] Login OK, guardando token...");
  saveAuthToStorage(payload);

  return payload;
}

/**
 * Suposición: endpoint opcional GET /auth/profile
 * Devuelve el usuario actual, basado en el JWT.
 */
export async function getProfile(): Promise<AuthUser> {
  const user = await apiFetch<AuthUser>("/auth/profile", {
    method: "GET",
    auth: true,
  });
  return user;
}
