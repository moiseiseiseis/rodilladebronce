// src/app/analysis/session/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/useAuth";
import Shell from "@/components/layout/Shell";
import { Spinner } from "@/components/ui/Spinner";

import { getSession } from "@/lib/api/sessions";
import type { Session } from "@/lib/types/session";

import { getSessionAnalysis } from "@/lib/api/analysis";
import type { SessionAnalysis } from "@/lib/types/analysis";

import { BaseChartCard } from "@/lib/charts/BaseChartCard";
import { BarChart } from "@/lib/charts/BarChart";

interface SessionAnalysisState {
  session: Session | null;
  analysis: SessionAnalysis | null;
  loading: boolean;
  error: string | null;
  usedFallback: boolean;
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionAnalysisPage() {
  const { user, status } = useRequireAuth(["CLINICIAN", "ADMIN"]);
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  const [state, setState] = useState<SessionAnalysisState>({
    session: null,
    analysis: null,
    loading: true,
    error: null,
    usedFallback: false,
  });

  useEffect(() => {
    if (!user || status === "loading" || !sessionId) return;

    let cancelled = false;

    async function loadData() {
      try {
        setState({
          session: null,
          analysis: null,
          loading: true,
          error: null,
          usedFallback: false,
        });

        const sessionRes = await getSession(sessionId);

        let analysisRes: SessionAnalysis | null = null;
        let usedFallback = false;

        try {
          analysisRes = await getSessionAnalysis(sessionId);
        } catch (err) {
          console.warn(
            "[ANALYSIS/SESSION] No se pudo obtener /analysis/session/:id, usando datos simulados.",
            err
          );
          if (sessionRes) {
            const rom = sessionRes.romMaxDeg ?? 0;
            const dur = sessionRes.durationSecs ?? 0;
            analysisRes = {
              sessionId: sessionRes.id,
              patientId: sessionRes.patientId,
              exerciseId: sessionRes.exerciseId,
              rom,
              durationSecs: dur,
              percentilePatientExercise: 50,
              percentileGlobalExercise: 50,
              abovePatientAvg: false,
              aboveGlobalAvg: false,
              patientExerciseAvgRom: rom,
              globalExerciseAvgRom: rom,
              clinicalFlags: [
                "Analítica simulada: implementa /analysis/session/:id en el backend para obtener comparativos reales.",
              ],
            };
            usedFallback = true;
          }
        }

        if (cancelled) return;

        setState({
          session: sessionRes,
          analysis: analysisRes,
          loading: false,
          error: null,
          usedFallback,
        });
      } catch (err: any) {
        console.error("[ANALYSIS/SESSION] Error cargando sesión:", err);
        if (cancelled) return;
        setState({
          session: null,
          analysis: null,
          loading: false,
          error:
            err?.message ||
            "No se pudo cargar la información de esta sesión.",
          usedFallback: false,
        });
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user, status, sessionId]);

  const { session, analysis, loading, error, usedFallback } = state;

  // ----------------- TRANSFORMACIONES (hooks) -----------------

  const comparisonData = useMemo(() => {
    if (!analysis) return [];
    return [
      {
        label: "Esta sesión",
        value: analysis.rom,
      },
      {
        label: "Promedio paciente (ejercicio)",
        value: analysis.patientExerciseAvgRom ?? 0,
      },
      {
        label: "Promedio global (ejercicio)",
        value: analysis.globalExerciseAvgRom ?? 0,
      },
    ];
  }, [analysis]);

  const displayRomDiffPatient = useMemo(() => {
    if (!analysis || analysis.patientExerciseAvgRom == null) return null;
    return analysis.rom - analysis.patientExerciseAvgRom;
  }, [analysis]);

  const displayRomDiffGlobal = useMemo(() => {
    if (!analysis || analysis.globalExerciseAvgRom == null) return null;
    return analysis.rom - analysis.globalExerciseAvgRom;
  }, [analysis]);

  const patientName =
    session?.patient?.fullName ||
    (session?.patient as any)?.name ||
    session?.patient?.email ||
    session?.patientId ||
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
      current="sessions"
      userName={user.fullName || user.email}
    >
      <div className="space-y-4">
        {/* HEADER / BREADCRUMB */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => router.push(`/sessions/${sessionId}`)}
              className="text-[11px] text-brand-700 hover:underline"
            >
              ← Volver al detalle de la sesión
            </button>
            <div>
              <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                Análisis de sesión
              </h1>
              <p className="text-sm text-[var(--text-muted)] max-w-xl">
                Comparativo de esta sesión frente al historial del paciente y
                la base global para el mismo ejercicio.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right text-[11px]">
            {usedFallback && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 border border-amber-200">
                • Analítica simulada
              </span>
            )}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 max-w-xs">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* BLOQUE RESUMEN DE SESIÓN */}
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft">
            <div className="text-[11px] font-medium text-slate-500">
              Paciente
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {patientName}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              Ejercicio:{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {session?.exerciseId || "—"}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              Fase:{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {session?.phaseLabel || "—"}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              Tipo de sesión:{" "}
              {session?.sessionType ? (
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {session.sessionType}
                </span>
              ) : (
                "—"
              )}
            </div>
            <div className="mt-2 text-[11px] text-[var(--text-muted)]">
              Inicio: {formatDateTime(session?.startedAt)}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Fin: {formatDateTime(session?.endedAt || null)}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft">
            <div className="text-[11px] font-medium text-slate-500">
              ROM máximo en esta sesión
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {session?.romMaxDeg != null ? `${session.romMaxDeg}°` : "—"}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              Medido por la órtesis durante la flexo-extensión.
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft">
            <div className="text-[11px] font-medium text-slate-500">
              Duración de la sesión
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {session?.durationSecs != null
                ? `${session.durationSecs} s`
                : "—"}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-muted)]">
              Desde el inicio hasta el fin registrado en la app móvil.
            </div>
          </div>
        </div>

        {/* GRÁFICA DE COMPARACIÓN ROM */}
        <BaseChartCard
          title="Comparación de ROM"
          description="ROM de esta sesión frente al promedio del paciente y el promedio global para el mismo ejercicio."
        >
          {loading || !analysis ? (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          ) : !comparisonData.length ? (
            <p className="mt-8 text-center text-[11px] text-[var(--text-muted)]">
              No se encontraron datos suficientes para comparar esta sesión.
            </p>
          ) : (
            <BarChart
              data={comparisonData}
              xKey="label"
              yKey="value"
              xLabelFormatter={(val) => String(val)}
              yLabelFormatter={(val) => `${val}°`}
            />
          )}
        </BaseChartCard>

        {/* BLOQUE DE INTERPRETACIÓN CLÍNICA */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft">
            <h2 className="mb-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
              Interpretación rápida
            </h2>
            {loading || !analysis ? (
              <div className="flex h-16 items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-2 text-[11px] text-[var(--text-muted)]">
                {displayRomDiffPatient != null && (
                  <p>
                    • Frente al{" "}
                    <span className="font-medium">
                      promedio del paciente en este ejercicio
                    </span>
                    , esta sesión está{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {Math.abs(displayRomDiffPatient).toFixed(1)}°
                    </span>{" "}
                    {displayRomDiffPatient > 0 ? "por encima" : "por debajo"}.
                  </p>
                )}

                {displayRomDiffGlobal != null && (
                  <p>
                    • Frente al{" "}
                    <span className="font-medium">
                      promedio global en este ejercicio
                    </span>
                    , esta sesión está{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {Math.abs(displayRomDiffGlobal).toFixed(1)}°
                    </span>{" "}
                    {displayRomDiffGlobal > 0 ? "por encima" : "por debajo"}.
                  </p>
                )}

                {analysis?.percentilePatientExercise != null && (
                  <p>
                    • Percentil dentro del paciente (mismo ejercicio):{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {analysis.percentilePatientExercise}%
                    </span>
                    .
                  </p>
                )}

                {analysis?.percentileGlobalExercise != null && (
                  <p>
                    • Percentil global (todos los pacientes, mismo ejercicio):{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {analysis.percentileGlobalExercise}%
                    </span>
                    .
                  </p>
                )}

                {analysis?.clinicalFlags && analysis.clinicalFlags.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="font-semibold text-[11px] text-slate-900 dark:text-slate-100">
                      Flags clínicos:
                    </p>
                    <ul className="list-disc pl-4">
                      {analysis.clinicalFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {usedFallback && (
                  <p className="mt-2 text-[11px] text-amber-800">
                    Nota: Los valores comparativos actuales son simulados.
                    Cuando implementes <code>/analysis/session/:id</code> en el
                    backend, esta vista usará los percentiles y promedios
                    reales de la DB.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* NOTAS CLÍNICAS DE LA SESIÓN */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 shadow-soft">
            <h2 className="mb-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
              Notas clínicas
            </h2>
            {loading ? (
              <div className="flex h-16 items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <p className="mt-1 text-[11px] text-[var(--text-muted)] max-h-40 overflow-y-auto whitespace-pre-wrap">
                {session?.notes || "Sin notas registradas para esta sesión."}
              </p>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
