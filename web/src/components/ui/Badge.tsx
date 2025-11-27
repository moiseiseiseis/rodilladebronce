// src/components/ui/Badge.tsx

import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "outline" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-[2px] text-[11px] font-medium";

  const styles: Record<string, string> = {
    default:
      "border-brand-100 bg-brand-50 text-brand-700",
    outline:
      "border-slate-300 bg-white text-slate-700",
    muted:
      "border-slate-200 bg-slate-50 text-slate-500",
  };

  return (
    <span className={`${base} ${styles[variant]} ${className || ""}`}>
      {children}
    </span>
  );
}
