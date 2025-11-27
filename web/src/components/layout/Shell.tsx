// src/components/layout/Shell.tsx

import Link from "next/link";
import type { ReactNode } from "react";

type NavKey = "dashboard" | "patients" | "sessions";

interface ShellProps {
  children: ReactNode;
  current: NavKey;
  userName?: string | null;
}

const navItems: { key: NavKey; label: string; href: string }[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "patients", label: "Pacientes", href: "/patients" },
  { key: "sessions", label: "Sesiones", href: "/sessions" },
];

export default function Shell({ children, current, userName }: ShellProps) {
  return (
    <div className="flex w-full gap-4">
      <aside className="hidden w-52 shrink-0 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 shadow-soft sm:block">
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Navegación
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.key === current;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3 text-[11px] text-[var(--text-muted)]">
          <div className="truncate font-medium text-slate-700">
            {userName || "Sesión activa"}
          </div>
          <div>Portal clínico</div>
        </div>
      </aside>

      <section className="flex-1">{children}</section>
    </div>
  );
}
