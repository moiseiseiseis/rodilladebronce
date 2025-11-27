// src/components/ui/Table.tsx

import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-xs">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-[var(--border-subtle)] bg-slate-50">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children }: { children: ReactNode }) {
  return (
    <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

export function TableCell({ children }: { children: ReactNode }) {
  return (
    <td className="px-3 py-2 text-xs text-slate-800">
      {children}
    </td>
  );
}
