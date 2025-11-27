// src/app/analysis/patient/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/useAuth";
import Shell from "@/components/layout/Shell";
import { Spinner } from "@/components/ui/Spinner";

import { getPatient } from "@/lib/api/patients";
// Asumiendo que Patient está en "@/lib/types/patient"
type Patient = any;

import { getPatientAnalysis } from "@/lib/api/analysis";
import type {
  PatientAnalysis,
  KeyValueNumber,
  DurationStats,
} from "@/lib/types/analysis";
import { mapRecordToArray } from "@/lib/types/analysis";

import { BaseChartCard } from "@/lib/charts/BaseChartCard";
import { LineChart as RomLineChart } from "@/lib/charts/LineChart";
import { BarChart as RomBarChart } from "@/lib/charts/BarChart";
import { PieChart } from "@/lib/charts/PieChart";

interface PatientAnalysisState {
  patient: Patient | null;
  analysis: PatientAnalysis | null;
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

export default function PatientAnalysisPage() {
  const { user, status } = useRequireAuth(["CLINICIAN", "ADMIN"]);
  const params = useParams();
  const router = useRouter();
  const patientId = params?.id as string;

  const [state, setState] = useState<PatientAnalysisState>({
    patient: null,
    analysis: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || status === "loading" || !patientId) return;

    let cancelled = false;

    async function loadData() {
      try {
        setState({
          patient: null,
          analysis: null,
          loading: true,
          error: null,
        });

        // NOTA: Usa tus funciones de API reales aquí
        const [patientRes, analysisRes] = await Promise.all([
          getPatient(patientId),
          getPatientAnalysis(patientId),
        ]);

        if (cancelled) return;

        setState({
          patient: patientRes,
          analysis: analysisRes,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("[ANALYSIS/PATIENT] Error cargando análisis:", err);
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err?.message ||
            "No se pudo cargar el análisis de este paciente. Verifica que el endpoint /analysis/patient/:id exista.",
        }));
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user, status, patientId]);

  const { patient, analysis, loading, error } = state;

  // ----------------- TRANSFORMACIONES (hooks) -----------------

  const romTrend = useMemo(
    () => analysis?.romTrend ?? [],
    [analysis]
  );

  const romByExerciseArray = useMemo(() => {
    if (!analysis) return [];
    return Object.entries(analysis.romByExercise || {}).map(
      ([exerciseId, stats]) => ({
        exerciseId,
        avgRom: stats.avg,
        minRom: stats.min,
        maxRom: stats.max,
      })
    );
  }, [analysis]);

  const frequencyByDayArray = useMemo(() => {
    if (!analysis) return [];
    const entries = [...(analysis.frequencyByDay || [])];
    entries.sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return entries;
  }, [analysis]);

  const sessionsByPhaseArray: KeyValueNumber[] = useMemo(() => {
    if (!analysis) return [];
    return mapRecordToArray(analysis.sessionsByPhase || {});
  }, [analysis]);

  const sessionsByTypeArray: KeyValueNumber[] = useMemo(() => {
    if (!analysis || !analysis.sessionsByType) return [];
    return mapRecordToArray(analysis.sessionsByType);
  }, [analysis]);

  const totalSessions = analysis?.totalSessions ?? 0;
  const avgRom = analysis?.avgRom ?? null;
  const durationStats: DurationStats | null | undefined = analysis?.sessionDurationStats;

  const displayName =
    (patient as any)?.fullName ||
    (patient as any)?.name ||
    patient?.email ||
    analysis?.patientId ||
    "Paciente";

  // ----------------- AHORA SÍ, RENDERS CONDICIONALES -----------------

  if (status === "loading") {
    return (
      <div className="flex w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <Shell
      current="patients"
      userName={user.fullName || user.email}
    >
      <div className="space-y-4">
        {/* BREADCRUMB + HEADER */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => router.push(`/patients/${patientId}`)}
              className="text-[11px] text-brand-700 hover:underline"
            >
              ← Volver al detalle del paciente
            </button>
            <div>
              <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                Análisis de paciente
              </h1>
              <p className="text-sm text-[var(--text-muted)] max-w-xl">
                Vista longitudinal del progreso de{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {displayName}
                </span>{" "}
                en función de ROM, frecuencia de sesiones, ejercicios y
                fases de rehabilitación.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 max-w-md">
              {error}
            </div>
          )}
        </div>

        {/* INFO BÁSICA DEL PACIENTE + KPIs */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft">
            <div className="text-[11px] font-medium text-slate-500">
              Paciente
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {displayName}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)] break-all">
              {patient?.email || patient?.id || analysis?.patientId}
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
              Sesiones registradas por la app móvil con la órtesis SmartKnee.
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft">
            <div className="text-[11px] font-medium text-slate-500">
              ROM promedio del paciente
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {loading
                ? "…"
                : avgRom !== null
                ? `${avgRom.toFixed(1)}°`
                : "—"}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              Promedio del ROM máximo en todas sus sesiones registradas.
            </div>
          </div>
        </div>

        {/* =======================================================
          FILA 1: ROM TREND (2/3) + ROM POR EJERCICIO (1/3) 
          =======================================================
        */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* ROM trend */}
          <div className="lg:col-span-2">
            <BaseChartCard
              title="Evolución del ROM en el tiempo"
              description="Tendencia del ROM máximo registrado en las sesiones del paciente."
            >
              {loading || !analysis ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : !romTrend.length ? (
                <p className="mt-8 text-center text-[11px] text-[var(--text-muted)]">
                  Aún no hay suficientes sesiones para mostrar una
                  tendencia de ROM.
                </p>
              ) : (
                <RomLineChart
                  data={romTrend}
                  xKey="date"
                  yKey="rom"
                  xLabelFormatter={(val) => formatShortDate(String(val))}
                  yLabelFormatter={(val) => `${val}°`}
                />
              )}
            </BaseChartCard>
          </div>

          {/* ROM por ejercicio */}
          <div>
            <BaseChartCard
              title="ROM por ejercicio"
              description="ROM promedio por ejercicio para este paciente."
            >
              {loading || !analysis ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : !romByExerciseArray.length ? (
                <p className="mt-8 text-center text-[11px] text-[var(--text-muted)]">
                  Este paciente aún no tiene suficientes sesiones con
                  distintos ejercicios para comparar ROM.
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

        {/* ================================================================
          FILA 2: FRECUENCIA (2/3) + DURACIÓN STATS (1/3) 
          ================================================================
        */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Frecuencia por día (Mantiene 2/3) */}
          <div className="lg:col-span-2">
            <BaseChartCard
              title="Frecuencia de sesiones"
              description="Número de sesiones por día para este paciente."
            >
              {loading || !analysis ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : !frequencyByDayArray.length ? (
                <p className="mt-8 text-center text-[11px] text-[var(--text-muted)]">
                  No hay suficientes sesiones para construir una serie de
                  frecuencia.
                </p>
              ) : (
                <RomLineChart
                  data={frequencyByDayArray}
                  xKey="date"
                  yKey="sessionsCount"
                  xLabelFormatter={(val) => formatShortDate(String(val))}
                  yLabelFormatter={(val) =>
                    `${val} sesión${val === 1 ? "" : "es"}`
                  }
                />
              )}
            </BaseChartCard>
          </div>

          {/* Duración stats (Ahora en 1/3, con layout optimizado) */}
          <div>
            <div className="flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft h-full">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Duración de las sesiones
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Tiempo en segundos de las sesiones registradas.
                  </p>
                </div>
              </div>
              {loading || !analysis ? (
                <div className="flex h-28 items-center justify-center">
                  <Spinner />
                </div>
              ) : !durationStats ? (
                <p className="mt-4 text-[11px] text-[var(--text-muted)]">
                  No se encontraron estadísticas de duración.
                </p>
              ) : (
                <div className="mt-1 grid gap-3 text-xs sm:grid-cols-1">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Duración promedio
                    </div>
                    <div className="mt-0.5 text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {durationStats.avg
                        ? `${Math.round(durationStats.avg)} s`
                        : "—"}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Tiempo típico de sesión.
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">
                        Sesión más corta
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {durationStats.min
                          ? `${durationStats.min} s`
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-500">
                        Sesión más larga
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {durationStats.max
                          ? `${durationStats.max} s`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================
          FILA 3: DISTRIBUCIÓN CATEGÓRICA (Fases + Tipos de Sesión) - MODIFICADA
          *** Ahora en lg:grid-cols-2 ***
          ================================================================
        */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Distribución por fase (1/2) */}
          <div>
            <BaseChartCard
              title="Sesiones por fase"
              description="Distribución de las sesiones del paciente por fase de rehabilitación."
            >
              {loading || !analysis ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : !sessionsByPhaseArray.length ? (
                <p className="mt-8 text-center text-[11px] text-[var(--text-muted)]">
                  No se han etiquetado fases (<code>phaseLabel</code>)
                  para las sesiones de este paciente.
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

          {/* Distribución por tipo de sesión (1/2) */}
          <div>
            <BaseChartCard
              title="Tipos de sesión"
              description="Basado en el campo opcional sessionType (ej. gamification_session)."
            >
              {loading || !analysis ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : !sessionsByTypeArray.length ? (
                <p className="mt-8 text-center text-[11px] text-[var(--text-muted)]">
                  No se encontraron tipos de sesión registrados en{" "}
                  <code>sessionType</code> para este paciente.
                </p>
              ) : (
                <PieChart
                  data={sessionsByTypeArray.map((p) => ({
                    name: p.key,
                    value: p.value,
                  }))}
                />
              )}
            </BaseChartCard>
          </div>
        </div>
      </div>
    </Shell>
  );
}