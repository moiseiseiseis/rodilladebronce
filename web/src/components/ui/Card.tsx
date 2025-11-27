// src/components/ui/Card.tsx

import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-soft ${className || ""}`}
    >
      {children}
    </div>
  );
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardSectionProps) {
  return (
    <div className={`px-4 pb-2 pt-3 sm:px-5 ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardSectionProps) {
  return (
    <h2
      className={`text-sm font-semibold tracking-tight text-slate-800 ${className || ""}`}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ children, className }: CardSectionProps) {
  return (
    <p
      className={`text-xs text-[var(--text-muted)] mt-0.5 ${className || ""}`}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className }: CardSectionProps) {
  return (
    <div className={`px-4 pb-4 pt-2 sm:px-5 ${className || ""}`}>
      {children}
    </div>
  );
}
