// src/app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, clearAuthFromStorage } from "@/lib/api/auth";
import type { LoginCredentials } from "@/lib/types/auth";
import type { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange =
    (field: keyof LoginCredentials) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const payload = await login({
        email: form.email.trim(),
        password: form.password,
      });

      // Portal sólo para CLINICIAN / ADMIN
      if (payload.user.role === "PATIENT") {
        clearAuthFromStorage();
        setErrorMsg(
          "Este portal es exclusivo para clínicos/administradores. Usa la app móvil como paciente."
        );
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch (err: any) {
      console.error("[LOGIN] Error:", err);
      const message =
        err && typeof err.message === "string"
          ? err.message
          : "No se pudo iniciar sesión. Verifica tus datos o inténtalo más tarde.";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] p-6 shadow-soft border border-[var(--border-subtle)]">
        <h1 className="text-xl font-semibold mb-1">
          Iniciar sesión
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Acceso al portal clínico de SmartKnee. Usa tu cuenta de
          fisioterapeuta o administrador.
        </p>

        {errorMsg && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-medium text-slate-700"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange("email")}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              placeholder="clinico@smartknee.com"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-medium text-slate-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange("password")}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Conectando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
