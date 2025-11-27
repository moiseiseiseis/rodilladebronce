// src/lib/charts/BaseChartCard.tsx
"use client";

import type { ReactNode } from "react";

interface BaseChartCardProps {
  title: string;
  description?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}

export function BaseChartCard({
  title,
  description,
  rightSlot,
  children,
}: BaseChartCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] text-[var(--text-muted)]">
              {description}
            </p>
          )}
        </div>
        {rightSlot && (
          <div className="flex items-center gap-2 text-[11px]">
            {rightSlot}
          </div>
        )}
      </div>
      
      {/* CORRECCIÓN CLAVE: 
        Aumentamos la altura del contenedor para asegurar que el PieChart (que usa height=240) 
        y la leyenda vertical no sean cortados.
      */}
      <div className="h-64 w-full md:h-72">{children}</div>
    </div>
  );
}