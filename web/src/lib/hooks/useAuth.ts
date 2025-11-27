// src/lib/hooks/useAuth.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  getStoredUser,
  clearAuthFromStorage,
} from "@/lib/api/auth";
import type { AuthUser, UserRole } from "@/lib/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface UseAuthReturn {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  logout: () => void;
}

/**
 * Hook base para leer el usuario desde localStorage
 * y exponer helpers de sesión.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    try {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    } catch (err) {
      console.error("[AUTH] Error inicializando sesión:", err);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user) return false;
      const list = Array.isArray(roles) ? roles : [roles];
      return list.includes(user.role);
    },
    [user]
  );

  const logout = useCallback(() => {
    clearAuthFromStorage();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated" && !!user,
    hasRole,
    logout,
  };
}

/**
 * Hook para RUTAS PROTEGIDAS:
 * - Redirige a /login si no hay sesión.
 * - Opcionalmente restringe por roles (ej. sólo CLINICIAN/ADMIN).
 */
export function useRequireAuth(allowedRoles?: UserRole[]) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status, isAuthenticated, hasRole, logout } = useAuth();

  useEffect(() => {
    if (status === "loading") return;

    // Sin sesión → a /login
    if (!isAuthenticated) {
      if (pathname !== "/login") {
        router.replace("/login");
      }
      return;
    }

    // Si hay restricción de roles
    if (allowedRoles && allowedRoles.length > 0) {
      const ok = hasRole(allowedRoles);
      if (!ok) {
        console.warn(
          "[AUTH] Usuario sin rol válido para esta ruta. Cerrando sesión."
        );
        logout();
        router.replace("/login");
      }
    }
  }, [status, isAuthenticated, allowedRoles, hasRole, logout, pathname, router]);

  return {
    user,
    status,
    isAuthenticated,
  };
}
