// src/components/layout/TopBar.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function TopBar() {
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = Boolean(user);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.replace("/login");
  };

  const navButtonBase =
    "rounded-xl border px-3 py-1.5 text-[11px] font-medium shadow-sm transition";

  return (
    <>
      {/* TOPBAR STICKY */}
      <header className="sticky top-3 z-40 flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 px-3 py-2.5 shadow-soft backdrop-blur-xl sm:px-4">
        {/* LOGO + TITULO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-brand-500 text-xs font-semibold text-white shadow-soft transition-transform group-hover:scale-[1.05]">
            SK
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              SmartKnee Portal
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Panel clínico de rehabilitación
            </div>
          </div>
        </Link>

        {/* NAV DESKTOP */}
        <div className="hidden items-center gap-3 sm:flex">
          {/* Inicio */}
          <Link
            href="/"
            className={`${navButtonBase} border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-700 hover:bg-brand-500/10 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:border-brand-500`}
          >
            Inicio
          </Link>

          {/* Dashboard si hay sesión */}
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className={`${navButtonBase} border-brand-500 bg-white text-brand-700 hover:bg-brand-500 hover:text-white hover:border-brand-600 dark:bg-slate-900 dark:text-brand-300`}
            >
              Dashboard
            </Link>
          )}

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-[13px] shadow-sm transition hover:border-brand-500 hover:bg-brand-500/10 dark:bg-slate-900 dark:border-slate-700"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? "☾" : "☀"}
          </button>

          {/* Estado de sesión */}
          {status === "loading" ? (
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
              <Spinner size="sm" />
              <span>Cargando...</span>
            </div>
          ) : isLoggedIn ? (
            <>
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                  {user.fullName || user.email}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {user.role === "CLINICIAN"
                    ? "Fisioterapeuta"
                    : user.role === "ADMIN"
                    ? "Administrador"
                    : "Usuario"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className={`${navButtonBase} border-danger-500 bg-white text-danger-500 hover:bg-danger-500 hover:text-white hover:border-danger-600 dark:bg-slate-900`}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={`${navButtonBase} border-brand-500 bg-brand-500 text-white hover:bg-brand-600`}
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* NAV MOBILE: iconos (hamburger + theme) */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-[13px] shadow-sm transition hover:border-brand-500 hover:bg-brand-500/10 dark:bg-slate-900 dark:border-slate-700"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? "☾" : "☀"}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-[16px] shadow-sm transition hover:border-brand-500 hover:bg-brand-500/10 dark:bg-slate-900 dark:border-slate-700"
            aria-label="Abrir menú"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* MENÚ MOBILE estilo iOS / bottom-sheet */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Fondo oscurecido */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Sheet */}
            <motion.nav
              className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/95 p-4 pb-6 shadow-2xl backdrop-blur-xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300/70" />

              <div className="space-y-3 text-sm">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl bg-slate-100/80 px-3 py-2 text-xs font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                >
                  <span>Inicio</span>
                  <span>⌂</span>
                </Link>

                {isLoggedIn && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-2xl bg-brand-500/10 px-3 py-2 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
                  >
                    <span>Dashboard clínico</span>
                    <span>📊</span>
                  </Link>
                )}

                {status === "loading" ? (
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] px-1">
                    <Spinner size="sm" />
                    <span>Cargando sesión...</span>
                  </div>
                ) : isLoggedIn ? (
                  <>
                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-white/70 px-3 py-2 text-[11px] text-[var(--text-muted)] dark:bg-slate-900">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {user.fullName || user.email}
                      </div>
                      <div>
                        {user.role === "CLINICIAN"
                          ? "Fisioterapeuta"
                          : user.role === "ADMIN"
                          ? "Administrador"
                          : "Usuario"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 w-full rounded-2xl border border-danger-500 bg-danger-500 px-3 py-2 text-xs font-medium text-white shadow-md transition hover:bg-danger-600"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 flex w-full items-center justify-center rounded-2xl border border-brand-500 bg-brand-500 px-3 py-2 text-xs font-medium text-white shadow-md transition hover:bg-brand-600"
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
