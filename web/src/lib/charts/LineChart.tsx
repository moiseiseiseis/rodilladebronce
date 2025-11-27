// src/lib/charts/LineChart.tsx
"use client";

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export interface LineChartProps<T extends Record<string, any>> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  xLabelFormatter?: (value: any) => string;
  yLabelFormatter?: (value: any) => string;
}

/**
 * LineChart genérico para cosas tipo:
 * - ROM vs fecha
 * - Progresión de sesiones
 */
export function LineChart<T extends Record<string, any>>({
  data,
  xKey,
  yKey,
  xLabelFormatter,
  yLabelFormatter,
}: LineChartProps<T>) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ReLineChart
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
          cursor={{ stroke: "rgba(148, 163, 184, 0.35)", strokeWidth: 1 }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(148, 163, 184, 0.5)",
            backgroundColor: "rgba(15, 23, 42, 0.96)",
            padding: "8px 10px",
          }}
          labelStyle={{ fontSize: 11, color: "#e5e7eb", marginBottom: 4 }}
          itemStyle={{ fontSize: 11, color: "#e5e7eb" }}
          formatter={(value: any) =>
            yLabelFormatter ? yLabelFormatter(value) : value
          }
          labelFormatter={(value: any) =>
            xLabelFormatter ? xLabelFormatter(value) : String(value)
          }
        />
        <Line
          type="monotone"
          dataKey={yKey as string}
          stroke="var(--brand-primary)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 1, stroke: "var(--brand-primary)" }}
          activeDot={{ r: 4 }}
          isAnimationActive={true}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}
