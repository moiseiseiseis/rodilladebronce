// src/components/ui/Table.tsx

import type { ReactNode, HTMLAttributes } from "react";

// --- INTERFACES DE PROPIEDADES ---

// Interfaz para la celda de encabezado (<th>)
export interface TableHeaderCellProps extends HTMLAttributes<HTMLTableHeaderCellElement> {
  children: ReactNode;
}

// Interfaz para la celda de datos (<td>)
export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

// Interfaz para la fila (<tr>)
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
    children: ReactNode;
}

// --- COMPONENTES ---

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

// CORREGIDO: TableRow acepta className
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

// CORREGIDO: TableHeaderCell acepta className (Soluciona el error actual)
export function TableHeaderCell({ children, className, ...props }: TableHeaderCellProps) {
  // Combinamos la clase predeterminada con la clase pasada por el usuario
  const finalClassName = `px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${className || ''}`;
  
  return (
    <th className={finalClassName} {...props}>
      {children}
    </th>
  );
}

// CORREGIDO: TableCell acepta className
export function TableCell({ children, className, ...props }: TableCellProps) {
  // Combinamos la clase predeterminada con la clase pasada por el usuario
  const finalClassName = `px-3 py-2 text-xs text-slate-800 ${className || ''}`;
  
  return (
    <td className={finalClassName} {...props}>
      {children}
    </td>
  );
}