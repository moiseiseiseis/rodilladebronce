// src/app/sessions/analytics/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Shell from "@/components/layout/Shell";
import { Spinner } from "@/components/ui/Spinner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { useRequireAuth } from "@/lib/hooks/useAuth";
import { getSessions } from "@/lib/api/sessions";
import type { Session } from "@/lib/types/session";
import { buildExerciseStats, type ExerciseStats } from "@/lib/stats/exerciseAnalytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// --- CONFIGURACIÓN DE COLORES Y ESTILOS ---
const COLORS = {
  primary: "#2563EB",
  secondary: "#10B981",
  pie: ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#14B8A6", "#374151", "#D1D5DB"],
};

// Función auxiliar para formatear la duración en minutos o segundos
function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    return `${(seconds / 60).toFixed(1)} min`;
  }
  return `${seconds.toFixed(0)} s`;
}

// Función auxiliar para preparar datos de conteo por fase (Defensiva)
function preparePhaseCountData(sessions: Session[]): { name: string; value: number }[] {
  const countMap = sessions.reduce((acc, session) => {
    if (!session) return acc;
    const phase = session.phaseLabel || 'Sin Fase';
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(countMap).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);
}

// Función auxiliar para preparar datos de conteo por paciente (Top N) (Defensiva)
function preparePatientCountData(sessions: Session[]): { name: string; value: number }[] {
  const countMap = sessions.reduce((acc, session) => {
    if (!session || !session.patient) return acc;
    const patientName = session.patient.fullName || session.patient.name || 'Paciente Desconocido';
    acc[patientName] = (acc[patientName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(countMap).map(([name, value]) => ({
    name,
    value,
  }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 8); 
}

// Estilos unificados basados en tu LineChart.tsx
const CHART_STYLE = {
  tick: { fontSize: 10, fill: "var(--text-muted)" },
  axisLine: false,
  tickLine: false,
  tooltipContentStyle: {
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.5)",
    backgroundColor: "rgba(15, 23, 42, 0.96)", 
    padding: "8px 10px",
  },
  tooltipLabelStyle: { fontSize: 11, color: "#e5e7eb", marginBottom: 4 },
  tooltipItemStyle: { fontSize: 11, color: "#e5e7eb" },
  gridStroke: "rgba(148, 163, 184, 0.4)",
  cursorStroke: "rgba(148, 163, 184, 0.35)",
};


interface PageState {
  loading: boolean;
  error: string | null;
  sessions: Session[];
  stats: ExerciseStats[];
}

export default function SessionsAnalyticsPage() {
  const { user, status } = useRequireAuth(["CLINICIAN", "ADMIN"]);
  const [state, setState] = useState<PageState>({
    loading: true,
    error: null,
    sessions: [],
    stats: [],
  });

  // --- EFECTO DE CARGA DE DATOS ---
  useEffect(() => {
    // Espera hasta que el estado de autenticación sea 'authenticated' y el 'user' esté disponible.
    if (!user || status !== "authenticated") return; 

    let cancelled = false;

    async function load() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const sessions = await getSessions();
        if (cancelled) return;

        const stats = buildExerciseStats(sessions);
        
        const sortedStats = [...stats].sort((a, b) => b.count - a.count);

        setState({
          loading: false,
          error: null,
          sessions,
          stats: sortedStats,
        });
      } catch (err: any) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err?.message ||
            "No se pudo cargar la información de sesiones.",
        }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, status]);

  // --- HOOKS INCONDICIONALES ---
  
  const { loading, error, stats, sessions } = state;

  // Prepara los datos de los gráficos de pastel usando useMemo para optimización
  const phaseCountData = useMemo(() => preparePhaseCountData(sessions), [sessions]);
  const patientCountData = useMemo(() => preparePatientCountData(sessions), [sessions]);

  // --- RETORNOS CONDICIONALES ---

  if (status === "loading" || loading) {
    return (
      <div className="flex w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }
  
  // Mover el retorno no autorizado después de todas las llamadas a Hooks
  if (!user) return null;


  return (
    <Shell current="sessions" userName={user.fullName || user.email}>
      <div className="space-y-4">
        <div>
          <h1 className="mb-1 text-xl font-semibold">
            Análisis global por ejercicio
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Resumen de ROM y duración agrupado por tipo de ejercicio, a partir de todas las sesiones registradas.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Carga y estados vacíos */}
        {stats.length === 0 && !error ? (
          <p className="text-xs text-[var(--text-muted)]">
            No hay sesiones suficientes para generar el análisis.
          </p>
        ) : (
          // Grid principal: 2 gráficos de pastel (md:col-span-1) y 2 gráficos de barra (xl:col-span-2/3)
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            
            {/* Card 1: resumen general */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Resumen General</CardTitle>
                <CardDescription>
                  {sessions.length} sesiones totales en {stats.length} ejercicios.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-[var(--text-muted)]">
                <p>
                  Ejercicio con más sesiones:{" "}
                  <strong>{stats[0].label}</strong> ({stats[0].count} sesiones)
                </p>
                <p>
                  ROM promedio global:{" "}
                  <strong>
                    {(() => {
                      const allRom = stats
                        .map((s) => s.avgRom)
                        .filter((v): v is number => v != null);
                      if (allRom.length === 0) return "N/A";
                      const avg =
                        allRom.reduce((a, b) => a + b, 0) / allRom.length;
                      return `${avg.toFixed(1)}°`;
                    })()}
                  </strong>
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Distribución por Fase (Gráfico de Pastel) */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Sesiones por Fase</CardTitle>
                <CardDescription>
                  Distribución de sesiones según la fase de rehabilitación.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <Pie
                      data={phaseCountData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      // CORRECCIÓN: Asegurar que percent es un número válido
                      label={({ name, percent }) => {
                          const safePercent = typeof percent === 'number' ? percent : 0;
                          return `${name} (${(safePercent * 100).toFixed(0)}%)`;
                      }}
                      isAnimationActive={true}
                    >
                      {phaseCountData.map((_entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS.pie[index % COLORS.pie.length]} 
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={CHART_STYLE.tooltipContentStyle}
                      labelStyle={CHART_STYLE.tooltipLabelStyle}
                      itemStyle={CHART_STYLE.tooltipItemStyle}
                      formatter={(value: number, name: string) => [`${value} sesiones`, name]}
                    />
                    <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Card 3: Distribución por Paciente (Gráfico de Pastel) */}
            <Card className="md:col-span-1 xl:col-span-2">
              <CardHeader>
                <CardTitle>Top 8 Pacientes por Sesiones</CardTitle>
                <CardDescription>
                  Los pacientes con el mayor número de sesiones registradas.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <Pie
                      data={patientCountData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      // CORRECCIÓN: Se verifica name y percent para evitar errores de tipo
                      label={({ name, percent }) => {
                          const labelName = typeof name === 'string' ? name : 'N/A';
                          const safePercent = typeof percent === 'number' ? percent : 0;
                          return `${labelName.split(' ')[0]} (${(safePercent * 100).toFixed(0)}%)`;
                      }}
                      isAnimationActive={true}
                    >
                      {patientCountData.map((_entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS.pie[index % COLORS.pie.length]} 
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={CHART_STYLE.tooltipContentStyle}
                      labelStyle={CHART_STYLE.tooltipLabelStyle}
                      itemStyle={CHART_STYLE.tooltipItemStyle}
                      formatter={(value: number, name: string) => [`${value} sesiones`, name]}
                    />
                    <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px' }} /> 
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Card 4: ROM promedio por ejercicio (Estilo Unificado) */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>ROM promedio por ejercicio</CardTitle>
                <CardDescription>
                  Ángulo máximo medio alcanzado en cada ejercicio.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={CHART_STYLE.gridStroke} 
                      vertical={false} 
                    />
                    <XAxis
                      dataKey="label"
                      tick={CHART_STYLE.tick}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      axisLine={CHART_STYLE.axisLine}
                      tickLine={CHART_STYLE.tickLine}
                      tickMargin={8}
                    />
                    <YAxis 
                      unit="°" 
                      tick={CHART_STYLE.tick}
                      axisLine={CHART_STYLE.axisLine}
                      tickLine={CHART_STYLE.tickLine}
                      tickMargin={8}
                    />
                    <Tooltip 
                      contentStyle={CHART_STYLE.tooltipContentStyle}
                      labelStyle={CHART_STYLE.tooltipLabelStyle}
                      itemStyle={CHART_STYLE.tooltipItemStyle}
                      cursor={{ stroke: CHART_STYLE.cursorStroke, strokeWidth: 1 }}
                      formatter={(value: number) => [`${value}°`, 'ROM Promedio']}
                    />
                    <Bar 
                      dataKey="avgRom" 
                      fill={COLORS.primary} 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Card 5: Duración total por ejercicio (Estilo Unificado) */}
            <Card className="md:col-span-2 xl:col-span-3">
              <CardHeader>
                <CardTitle>Duración total por ejercicio</CardTitle>
                <CardDescription>
                  Tiempo acumulado de entrenamiento por tipo de ejercicio (segundos).
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={CHART_STYLE.gridStroke} 
                      vertical={false} 
                    />
                    <XAxis
                      dataKey="label"
                      tick={CHART_STYLE.tick}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      axisLine={CHART_STYLE.axisLine}
                      tickLine={CHART_STYLE.tickLine}
                      tickMargin={8}
                    />
                    <YAxis 
                      unit="s" 
                      tick={CHART_STYLE.tick}
                      axisLine={CHART_STYLE.axisLine}
                      tickLine={CHART_STYLE.tickLine}
                      tickMargin={8}
                    />
                    <Tooltip 
                      contentStyle={CHART_STYLE.tooltipContentStyle}
                      labelStyle={CHART_STYLE.tooltipLabelStyle}
                      itemStyle={CHART_STYLE.tooltipItemStyle}
                      cursor={{ stroke: CHART_STYLE.cursorStroke, strokeWidth: 1 }}
                      formatter={(value: number) => [formatDuration(value), 'Duración Total']}
                    />
                    <Bar 
                      dataKey="totalDuration" 
                      fill={COLORS.secondary} 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Shell>
  );
}