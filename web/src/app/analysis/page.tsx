// src/app/analysis/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hooks/useAuth";
import Shell from "@/components/layout/Shell";
import { Spinner } from "@/components/ui/Spinner";
import {
  BaseChartCard,
} from "@/lib/charts/BaseChartCard";
import {
  LineChart as RomLineChart,
} from "@/lib/charts/LineChart";
import {
  BarChart as RomBarChart,
} from "@/lib/charts/BarChart";
import {
  PieChart,
  type PieDataPoint,
} from "@/lib/charts/PieChart";
import {
  getGlobalAnalysis,
} from "@/lib/api/analysis";
import type {
  GlobalAnalysis,
  KeyValueNumber,
} from "@/lib/types/analysis";
import { mapRecordToArray } from "@/lib/types/analysis";

interface AnalysisState {
  data: GlobalAnalysis | null;
  loading: boolean;
  error: string | null;
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function GlobalAnalysisPage() {
  const { user, status } = useRequireAuth(["CLINICIAN", "ADMIN"]);
  const [state, setState] = useState<AnalysisState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || status === "loading") return;

    let cancelled = false;

    async function loadAnalysis() {
      try {
        setState({ data: null, loading: true, error: null });
        const res = await getGlobalAnalysis();
        if (cancelled) return;

        setState({
          data: res,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("[ANALYSIS/GLOBAL] Error cargando análisis:", err);
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error:
            err?.message ||
            "No se pudo cargar el análisis global. Verifica que el endpoint /analysis/global exista.",
        });
      }
    }

    loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, [user, status]);

  if (status === "loading") {
    return (
      <div className="flex w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  const { data, loading, error } = state;

  // --------- TRANSFORMACIONES PARA GRÁFICAS ---------

  const romByExerciseArray = useMemo(() => {
    if (!data) return [];
    // Transformamos los stats a un formato plano, incluyendo count
    return Object.entries(data.romByExercise || {}).map(
      ([exerciseId, stats]) => ({
        exerciseId,
        avgRom: stats.avg,
        minRom: stats.min,
        maxRom: stats.max,
        count: stats.count || 0,
      })
    );
  }, [data]);

  const sessionsPerDayArray = useMemo(() => {
    if (!data) return [];
    const entries = Object.entries(data.sessionsPerDay || {});
    entries.sort(([a], [b]) =>
      new Date(a).getTime() - new Date(b).getTime()
    );
    return entries.map(([date, count]) => ({
      date,
      count,
    }));
  }, [data]);

  const sessionsByPhaseArray: KeyValueNumber[] = useMemo(() => {
    if (!data) return [];
    return mapRecordToArray(data.sessionsByPhase || {});
  }, [data]);

  const sessionsByTypePie: PieDataPoint[] = useMemo(() => {
    if (!data || !data.sessionsByType) return [];
    return Object.entries(data.sessionsByType).map(([name, value]) => ({
      name,
      value,
    }));
  }, [data]);

  const totalPatients = data?.totalPatients ?? 0;
  const totalSessions = data?.totalSessions ?? 0;

  return (
    <Shell
      current="dashboard" // O 'analysis' si ya existe en el sidebar
      userName={user.fullName || user.email}
    >
      <div className="space-y-4">
        {/* HEADER */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Análisis global de sesiones
            </h1>
            <p className="text-sm text-[var(--text-muted)] max-w-xl">
              Vista agregada de todas las sesiones de rehabilitación
              registradas en SmartKnee.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 max-w-md">
              {error}
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft">
            <div className="text-[11px] font-medium text-slate-500">
              Pacientes con sesiones
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {loading ? "…" : totalPatients}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              Usuarios tipo PATIENT que han tenido al menos una sesión
              registrada.
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft">
            <div className="text-[11px] font-medium text-slate-500">
              Sesiones totales
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {loading ? "…" : totalSessions}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              Cada registro proviene de la app móvil tras una sesión de
              órtesis real.
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft">
            <div className="text-[11px] font-medium text-slate-500">
              Ejercicios distintos
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {loading ? "…" : Object.keys(data?.romByExercise || {}).length}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              Basado en los <code>exerciseId</code> reportados por la app
              móvil.
            </div>
          </div>
        </div>

        {/* ====================================================================
          FILA 1: FRECUENCIA (2/3) + ROM POR EJERCICIO (1/3) - NUEVA DISTRIBUCIÓN
          ====================================================================
        */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Sesiones por día (Tendencia global, 2/3) */}
          <div className="lg:col-span-2">
            <BaseChartCard
              title="Frecuencia de sesiones (Global)"
              description="Número de sesiones registradas diariamente a lo largo del tiempo."
            >
              {loading || !data ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : sessionsPerDayArray.length === 0 ? (
                <p className="text-center text-[11px] text-[var(--text-muted)] mt-8">
                  Aún no hay suficientes sesiones para mostrar la tendencia
                  diaria.
                </p>
              ) : (
                <RomLineChart
                  data={sessionsPerDayArray}
                  xKey="date"
                  yKey="count"
                  xLabelFormatter={(val) => formatShortDate(String(val))}
                  yLabelFormatter={(val) =>
                    `${val} sesión${val === 1 ? "" : "es"}`
                  }
                />
              )}
            </BaseChartCard>
          </div>

          {/* ROM por ejercicio (1/3) */}
          <div>
            <BaseChartCard
              title="ROM promedio por ejercicio"
              description="ROM máximo promedio para cada ejercicio registrado (Global)."
            >
              {loading || !data ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : romByExerciseArray.length === 0 ? (
                <p className="text-center text-[11px] text-[var(--text-muted)] mt-8">
                  Aún no hay suficientes datos de ROM por ejercicio.
                </p>
              ) : (
                <RomBarChart
                  data={romByExerciseArray}
                  xKey="exerciseId"
                  yKey="avgRom"
                  xLabelFormatter={(val) => String(val)}
                  yLabelFormatter={(val) => `${val}°`}
                />
              )}
            </BaseChartCard>
          </div>
        </div>

        {/* ====================================================================
          FILA 2: DISTRIBUCIÓN CATEÓRICA (3 x 1/3) - NUEVA DISTRIBUCIÓN
          ====================================================================
        */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Distribución por fase (1/3) */}
          <div>
            <BaseChartCard
              title="Sesiones por fase de rehabilitación"
              description="Distribución de sesiones en cada fase clínica (Global)."
            >
              {loading || !data ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : sessionsByPhaseArray.length === 0 ? (
                <p className="text-center text-[11px] text-[var(--text-muted)] mt-8">
                  Aún no hay sesiones con etiquetas de fase
                  (<code>phaseLabel</code>).
                </p>
              ) : (
                <PieChart
                  data={sessionsByPhaseArray.map((p) => ({
                    name: p.key,
                    value: p.value,
                  }))}
                />
              )}
            </BaseChartCard>
          </div>

          {/* Sesiones por tipo (1/3) */}
          <div>
            <BaseChartCard
              title="Sesiones por tipo"
              description="Distribución según el campo opcional sessionType (Global)."
            >
              {loading || !data ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : !sessionsByTypePie.length ? (
                <p className="text-center text-[11px] text-[var(--text-muted)] mt-8">
                  Aún no hay tipos de sesión definidos en{" "}
                  <code>sessionType</code>.
                </p>
              ) : (
                <PieChart data={sessionsByTypePie} />
              )}
            </BaseChartCard>
          </div>
          
          {/* ROM Global Detallado (1/3) - ROM Mín, Máx y Avg por ejercicio */}
          <div>
            <BaseChartCard
              title="Detalle ROM Mín/Máx"
              description="Máximo y Mínimo ROM global por ejercicio."
            >
              {loading || !data ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : romByExerciseArray.length === 0 ? (
                <p className="text-center text-[11px] text-[var(--text-muted)] mt-8">
                  No hay datos para comparar ROM Mínimo y Máximo.
                </p>
              ) : (
                // Usamos BarChart para mostrar min/max/avg en el 1/3
                <RomBarChart
                  data={romByExerciseArray}
                  xKey="exerciseId"
                  yKey={["maxRom", "avgRom", "minRom"]} // Se necesita que RomBarChart soporte múltiples claves
                  xLabelFormatter={(val) => String(val)}
                  yLabelFormatter={(val) => `${val}°`}
                  legendKeys={["Máx.", "Avg.", "Mín."]}
                />
              )}
            </BaseChartCard>
          </div>
        </div>
      </div>
    </Shell>
  );
}