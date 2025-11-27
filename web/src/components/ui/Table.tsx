// src/components/ui/Table.tsx

import type { ReactNode } from "react";
// Importamos los tipos necesarios de React para manejar props nativas como 'className'
import type { HTMLAttributes } from "react"; 

// 1. Definición para TableCellProps
// Extendemos HTMLAttributes<HTMLTableCellElement> para incluir 'className' y otras props de <td>
export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

// 2. Definición para TableRowProps (Ajuste defensivo)
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
    children: ReactNode;
}


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

// Usamos la interfaz ajustada TableRowProps
export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr 
      className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/60 ${className || ''}`}
      {...props}
    >
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

// COMPONENTE CORREGIDO: TableCell ahora acepta className
export function TableCell({ children, className, ...props }: TableCellProps) {
  // Combinamos la clase predeterminada con la clase pasada por el usuario
  const finalClassName = `px-3 py-2 text-xs text-slate-800 ${className || ''}`;
  
  return (
    <td className={finalClassName} {...props}>
      {children}
    </td>
  );
}
