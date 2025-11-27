// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/hooks/useAuth";
import { getPatients } from "@/lib/api/patients";
import { getSessions } from "@/lib/api/sessions";
import type { Patient } from "@/lib/types/patient";
import type { Session } from "@/lib/types/session";
import Shell from "@/components/layout/Shell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
import { getExerciseLabel } from "@/lib/types/exercise";

interface DashboardState {
  patients: Patient[];
  sessions: Session[];
  loading: boolean;
  error: string | null;
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

export default function DashboardPage() {
  const { user, status } = useRequireAuth(["CLINICIAN", "ADMIN"]);
  const [state, setState] = useState<DashboardState>({
    patients: [],
    sessions: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || status === "loading") return;

    let cancelled = false;

    async function loadData() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const [patientsRes, sessionsRes] = await Promise.all([
          getPatients(),
          getSessions(),
        ]);

        if (cancelled) return;

        setState({
          patients: patientsRes,
          sessions: sessionsRes,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("[DASHBOARD] Error cargando datos:", err);
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err?.message ||
            "No se pudieron cargar los datos del dashboard.",
        }));
      }
    }

    loadData();

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

  if (!user) {
    // Mientras el hook redirige a /login
    return null;
  }

  const { patients, sessions, loading, error } = state;

  const totalPatients = patients.length;
  const totalSessions = sessions.length;

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const sessionsLast7Days = sessions.filter((s) => {
    const d = new Date(s.startedAt);
    if (Number.isNaN(d.getTime())) return false;
    return d >= sevenDaysAgo;
  }).length;

  const latestSessions = [...sessions]
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() -
        new Date(a.startedAt).getTime()
    )
    .slice(0, 5);

  return (
    <Shell
      current="dashboard"
      userName={user.fullName || user.email}
    >
      <div className="space-y-4">
        <div>
          <h1 className="mb-1 text-xl font-semibold">
            Dashboard clínico
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Resumen de pacientes y sesiones de rehabilitación
            registrados por SmartKnee.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Pacientes</CardTitle>
              <CardDescription>
                Pacientes registrados en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">
                  {loading ? "—" : totalPatients}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  pacientes
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesiones (últimos 7 días)</CardTitle>
              <CardDescription>
                Conteo de sesiones recientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">
                  {loading ? "—" : sessionsLast7Days}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  de {totalSessions} totales
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado de datos</CardTitle>
              <CardDescription>
                Conectividad con el backend NestJS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Spinner size="sm" />
                  <span>Cargando datos...</span>
                </div>
              ) : error ? (
                <Badge variant="muted">
                  Error al consultar API
                </Badge>
              ) : (
                <Badge variant="default">Conectado</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Últimas sesiones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Últimas sesiones</CardTitle>
                <CardDescription>
                  Sesiones recientes con ROM máximo y tipo de
                  ejercicio.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Spinner size="sm" />
                <span>Cargando sesiones...</span>
              </div>
            ) : latestSessions.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">
                Aún no hay sesiones registradas.
              </p>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Fecha</TableHeaderCell>
                    <TableHeaderCell>Paciente</TableHeaderCell>
                    <TableHeaderCell>Ejercicio</TableHeaderCell>
                    <TableHeaderCell>Fase</TableHeaderCell>
                    <TableHeaderCell>ROM máx (°)</TableHeaderCell>
                    <TableHeaderCell>Duración (s)</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestSessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {formatDate(s.startedAt)}
                      </TableCell>
                      <TableCell>
                        {s.patient?.fullName || "—"}
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
                      <TableCell className="max-w-[160px]">
                        <span className="text-[11px]">
                          {s.phaseLabel}
                        </span>
                      </TableCell>
                      <TableCell>
                        {s.romMaxDeg != null ? s.romMaxDeg : "—"}
                      </TableCell>
                      <TableCell>
                        {s.durationSecs != null
                          ? s.durationSecs
                          : "—"}
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

