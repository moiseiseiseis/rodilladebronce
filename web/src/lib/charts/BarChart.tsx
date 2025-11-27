// src/lib/charts/BarChart.tsx
"use client";

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend, // Añadimos Legend por si se necesita para múltiples barras
} from "recharts";

// Definimos algunos colores por defecto para las barras (puedes ajustarlos)
const DEFAULT_COLORS = [
    "var(--brand-primary)", // Color principal
    "var(--brand-secondary)", // Color secundario
    "#F59E0B", // Amarillo
    "#EF4444", // Rojo
];

export interface BarChartProps<T extends Record<string, any>> {
  data: T[];
  xKey: keyof T;
  // CORRECCIÓN 1: yKey ahora acepta una sola clave O un arreglo de claves
  yKey: keyof T | (keyof T)[];
  xLabelFormatter?: (value: any) => string;
  yLabelFormatter?: (value: any) => string;
  // Añadimos prop opcional para etiquetas de leyenda si hay múltiples barras
  legendKeys?: string[];
}

/**
 * BarChart genérico para:
 * - ROM promedio por ejercicio (Ahora soporta múltiples claves como Máx/Avg/Mín)
 * - Sesiones por fase
 * - Sesiones por tipo
 */
export function BarChart<T extends Record<string, any>>({
  data,
  xKey,
  yKey,
  xLabelFormatter,
  yLabelFormatter,
  legendKeys, // Recibimos las etiquetas de leyenda
}: BarChartProps<T>) {
  const safeData = Array.isArray(data) ? data : [];

  // CORRECCIÓN 2: Aseguramos que 'yKey' siempre sea un arreglo para poder iterar.
  const yKeysArray = Array.isArray(yKey) ? yKey : [yKey];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ReBarChart
        data={safeData}
        margin={{ top: 10, right: 18, bottom: 0, left: 0 }}
      >
        <CartesianGrid
          stroke="rgba(148, 163, 184, 0.4)"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey={xKey as string}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickFormatter={(value) =>
            xLabelFormatter ? xLabelFormatter(value) : String(value)
          }
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickFormatter={(value) =>
            yLabelFormatter ? yLabelFormatter(value) : String(value)
          }
        />
        <Tooltip
          cursor={{ fill: "rgba(148, 163, 184, 0.15)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(148, 163, 184, 0.5)",
            backgroundColor: "rgba(15, 23, 42, 0.96)",
            padding: "8px 10px",
          }}
          labelStyle={{ fontSize: 11, color: "#e5e7eb", marginBottom: 4 }}
          itemStyle={{ fontSize: 11, color: "#e5e7eb" }}
          // Ajuste en formatter para mostrar la etiqueta de la leyenda
          formatter={(value: any, name: string) => [
            yLabelFormatter ? yLabelFormatter(value) : value,
            name 
          ]}
          labelFormatter={(value: any) =>
            xLabelFormatter ? xLabelFormatter(value) : String(value)
          }
        />

        {/* CORRECCIÓN 3: Iterar sobre el arreglo de yKeys para renderizar múltiples barras */}
        {yKeysArray.map((key, index) => (
            <Bar
                key={key as string} // Clave única para React
                dataKey={key as string}
                // Usar la etiqueta de leyenda si está disponible
                name={legendKeys?.[index] ?? (key as string)} 
                radius={[8, 8, 3, 3]}
                // Asignar color según el índice, o usar un color por defecto
                fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                stroke={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                strokeWidth={1}
                isAnimationActive={true}
            />
        ))}

        {/* Muestra la leyenda solo si hay múltiples claves Y se proporcionaron etiquetas */}
        {yKeysArray.length > 1 && legendKeys && (
            <Legend wrapperStyle={{ paddingTop: 16 }} />
        )}
      </ReBarChart>
    </ResponsiveContainer>
  );
}