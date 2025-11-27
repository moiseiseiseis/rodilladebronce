// src/app/sessions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/hooks/useAuth";
import { getSessions } from "@/lib/api/sessions";
import type { Session } from "@/lib/types/session";
import Shell from "@/components/layout/Shell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { getExerciseLabel } from "@/lib/types/exercise";
import Link from "next/link";

interface SessionsState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  search: string;
  from: string;
  to: string;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionsPage() {
  const { user, status } = useRequireAuth(["CLINICIAN", "ADMIN"]);

  const [state, setState] = useState<SessionsState>({
    sessions: [],
    loading: true,
    error: null,
    search: "",
    from: "",
    to: "",
  });

  useEffect(() => {
    if (!user || status === "loading") return;

    let cancelled = false;

    async function loadSessions() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        // MVP: traemos todas las sesiones, filtramos en cliente
        const sessionsRes = await getSessions();

        if (cancelled) return;

        const sorted = [...sessionsRes].sort(
          (a, b) =>
            new Date(b.startedAt).getTime() -
            new Date(a.startedAt).getTime()
        );

        setState((prev) => ({
          ...prev,
          loading: false,
          sessions: sorted,
        }));
      } catch (err: any) {
        console.error("[SESSIONS] Error cargando sesiones:", err);
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err?.message ||
            "No se pudieron cargar las sesiones desde el backend.",
        }));
      }
    }

    loadSessions();

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

  const { sessions, loading, error, search, from, to } = state;

  const filtered = sessions.filter((s) => {
    // filtro por rango de fechas
    if (from) {
      const fromDate = new Date(from);
      const d = new Date(s.startedAt);
      if (!Number.isNaN(fromDate.getTime()) && d < fromDate) return false;
    }
    if (to) {
      const toDate = new Date(to);
      const d = new Date(s.startedAt);
      // sumamos un día a "to" para incluir el día completo
      if (!Number.isNaN(toDate.getTime())) {
        toDate.setDate(toDate.getDate() + 1);
        if (d >= toDate) return false;
      }
    }

    // filtro de búsqueda libre (ejercicio, fase, paciente, tipo)
    if (!search.trim()) return true;
    const term = search.toLowerCase();

    const exercise = s.exerciseId.toLowerCase();
    const phase = (s.phaseLabel || "").toLowerCase();
    const sessionType = (s.sessionType || "").toLowerCase();
    const patientName = (s.patient?.fullName || s.patient?.name || "")
      .toLowerCase();

    return (
      exercise.includes(term) ||
      phase.includes(term) ||
      sessionType.includes(term) ||
      patientName.includes(term)
    );
  });

  return (
    <Shell current="sessions" userName={user.fullName || user.email}>
      <div className="space-y-4">
        <div>
          <h1 className="mb-1 text-xl font-semibold">Sesiones</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Historial de sesiones de rehabilitación registradas por
            SmartKnee. Puedes filtrar por fecha y buscar por ejercicio,
            fase o paciente.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle>Sesiones registradas</CardTitle>
                <CardDescription>
                  {loading
                    ? "Cargando sesiones..."
                    : `${filtered.length} de ${sessions.length} sesión(es)`}
                </CardDescription>
              </div>

              {/* Bloque de filtros y botón de análisis */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                
                {/* FILTROS EXISTENTES (Fecha y Búsqueda) */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium text-slate-600">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={from}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-white px-2 py-1 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[11px] font-medium text-slate-600">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={to}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-[var(--border-subtle)] bg-white px-2 py-1 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="w-full max-w-xs">
                  <label className="mb-0.5 block text-[11px] font-medium text-slate-600">
                    Buscar
                  </label>
                  <input
                    type="text"
                    placeholder="Ejercicio, fase, paciente..."
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-white px-3 py-2 text-xs outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    value={search}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                  />
                </div>
                
                {/* NUEVO: Botón de Análisis Global */}
                <Link
                  href="/sessions/analytics"
                  className="inline-flex items-center justify-center rounded-xl border border-brand-500 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50"
                >
                  Ver análisis global
                </Link>
                {/* FIN NUEVO */}
              </div>
              {/* FIN Bloque de filtros y botón de análisis */}
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Spinner size="sm" />
                <span>Cargando sesiones...</span>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">
                No se encontraron sesiones con esos filtros.
              </p>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Fecha</TableHeaderCell>
                    <TableHeaderCell>Paciente</TableHeaderCell>
                    <TableHeaderCell>Ejercicio</TableHeaderCell>
                    <TableHeaderCell>Fase</TableHeaderCell>
                    <TableHeaderCell>Tipo</TableHeaderCell>
                    <TableHeaderCell>ROM máx (°)</TableHeaderCell>
                    <TableHeaderCell>Duración (s)</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Link
                          href={`/sessions/${s.id}`}
                          className="text-xs text-brand-700 hover:underline"
                        >
                          {formatDate(s.startedAt)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[var(--text-muted)]">
                          {s.patient?.fullName ||
                            s.patient?.name ||
                            "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            {getExerciseLabel(s.exerciseId)}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            {s.exerciseId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <span className="text-[11px]">
                          {s.phaseLabel}
                        </span>
                      </TableCell>
                      <TableCell>
                        {s.sessionType ? (
                          <Badge variant="outline">
                            {s.sessionType}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-[var(--text-muted)]">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.romMaxDeg != null ? s.romMaxDeg : "—"}
                      </TableCell>
                      <TableCell>
                        {s.durationSecs != null ? s.durationSecs : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}