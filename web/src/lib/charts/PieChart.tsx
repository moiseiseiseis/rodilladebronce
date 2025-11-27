// src/lib/charts/PieChart.tsx
"use client";

import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Sector,
} from "recharts";
import React from "react"; // Simplificamos la importación

// Definición de tipo base para la data, usado internamente
export interface PieDataPoint {
  name: string;
  value: number;
  // Puedes añadir más propiedades aquí si son usadas en el tooltip, etc.
}

// CORRECCIÓN CLAVE: Usamos 'any' para evitar conflictos con tipos globales
// (como ChartDataInput) que tienen una estructura similar a PieDataPoint.
// TypeScript ahora permitirá que cualquier array de objetos se pase aquí.
export interface PieChartProps {
  data: any[]; 
}

// 1. Paleta de Colores Mejorada y Opaca (Material/Tailwind V4)
const COLORS = [
  "#20B2AA", // Light Sea Green (Para Fase 1)
  "#FFD700", // Gold (Para Fase 2)
  "#DC143C", // Crimson (Para Fase 3)
  "#808080", // Gray (Para N/A o Sin fase)
  "#4682B4", // Steel Blue
  "#BA55D3", // Medium Orchid
];

// Helper para calcular la posición de la etiqueta dentro del sector
// Usamos 'any' para evitar errores de tipado con las props de Recharts
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  // Solo mostrar la etiqueta si el porcentaje es significativo (> 8%)
  if (percent * 100 > 8) {
    return (
      <text
        x={x}
        y={y}
        fill="black" // Color de texto blanco para contraste
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: 11, fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  }
};

/**
 * PieChart sencillo para distribuciones categóricas:
 */
export function PieChart({ data }: PieChartProps) {
  // Aquí usamos 'data' directamente como array (ya que es 'any[]' en las props),
  // y aplicamos el filtro de seguridad.
  const safeData: any[] = Array.isArray(data) ? data.filter(d => d.value > 0) : [];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RePieChart margin={{ top: 0, right: 0, bottom: 0, left: 10 }}>
        <Pie
          data={safeData} // El tipo 'any[]' es aceptado sin conflicto
          dataKey="value"
          nameKey="name"
          cx="40%"
          cy="50%"
          innerRadius={45} 
          outerRadius={80} 
          paddingAngle={2}
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {safeData.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="#FFFFFF" 
              strokeWidth={2}
            />
          ))}
        </Pie>

        {/* Leyenda y Tooltip */}
        <Legend
          align="right"
          verticalAlign="middle"
          layout="vertical"
          wrapperStyle={{
            fontSize: 12,
            color: 'var(--text-primary)',
            paddingLeft: 20,
          }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid rgba(148, 163, 184, 0.5)",
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            padding: "8px 10px",
          }}
          labelStyle={{ fontSize: 12, color: "#f8fafc", marginBottom: 4 }}
          itemStyle={{ fontSize: 12, color: "#f8fafc" }}
          formatter={(value: any, name: any) => [
            `${value} sesión(es)`,
            typeof name === "string" ? name : "",
          ]}
        />
      </RePieChart>
    </ResponsiveContainer>
  );
}