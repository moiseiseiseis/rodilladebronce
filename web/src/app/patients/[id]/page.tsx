"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/useAuth";
import { getPatient } from "@/lib/api/patients";
import { getSessions } from "@/lib/api/sessions";
import {
  type Patient,
  getPatientDisplayName,
  getPatientDisplayEmail,
} from "@/lib/types/patient";
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
import { getExerciseLabel } from "@/lib/types/exercise";

interface PatientDetailState {
  patient: Patient | null;
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

export default function PatientDetailPage() {
  const { user, status } = useRequireAuth(["CLINICIAN", "ADMIN"]);
  const params = useParams();
  // Se eliminó la declaración de `router` ya que no se utiliza para la navegación de regreso.
  const patientId = params?.id as string;

  const [state, setState] = useState<PatientDetailState>({
    patient: null,
    sessions: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || status === "loading" || !patientId) return;

    let cancelled = false;

    async function loadData() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const [patientRes, sessionsRes] = await Promise.all([
          getPatient(patientId),
          getSessions({ patientId }),
        ]);

        if (cancelled) return;

        const sortedSessions = [...sessionsRes].sort(
          (a, b) =>
            new Date(b.startedAt).getTime() -
            new Date(a.startedAt).getTime()
        );

        setState({
          patient: patientRes,
          sessions: sortedSessions,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.error("[PATIENT_DETAIL] Error cargando datos:", err);
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err?.message ||
            "No se pudo cargar la información del paciente.",
        }));
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user, status, patientId]);

  if (status === "loading") {
    return (
      <div className="flex w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  const { patient, sessions, loading, error } = state;

  return (
    <Shell
      current="patients"
      userName={user.fullName || user.email}
    >
      <div className="space-y-4">
        
        {/* Nuevo HEADER con navegación y botón de análisis */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Paciente
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Detalle clínico y sesiones registradas del paciente.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <Link
              href="/patients"
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:border-brand-500 hover:bg-brand-500/10 hover:text-brand-700"
            >
              ← Volver a pacientes
            </Link>
            <Link
              href={`/analysis/patient/${patientId}`}
              className="rounded-xl border border-brand-500 bg-brand-500 px-3 py-1.5 text-[11px] font-medium text-white shadow-soft hover:bg-brand-600 hover:border-brand-600"
            >
              Ver análisis del paciente
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Datos del paciente */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Datos del paciente</CardTitle>
              <CardDescription>
                Información básica registrada en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !patient ? (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Spinner size="sm" />
                  <span>Cargando datos del paciente...</span>
                </div>
              ) : error && !patient ? (
                <p className="text-xs text-red-700">{error}</p>
              ) : !patient ? (
                <p className="text-xs text-[var(--text-muted)]">
                  Paciente no encontrado.
                </p>
              ) : (
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      Nombre completo
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      {getPatientDisplayName(patient)}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        Correo
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {getPatientDisplayEmail(patient) || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        Teléfono
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {patient.phone || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        Fecha de nacimiento
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {patient.dateOfBirth
                          ? new Date(
                              patient.dateOfBirth
                            ).toLocaleDateString("es-MX")
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        Diagnóstico
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {patient.diagnosis || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sesiones del paciente */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones del paciente</CardTitle>
            <CardDescription>
              Historial de sesiones registradas por SmartKnee.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !sessions.length ? (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Spinner size="sm" />
                <span>Cargando sesiones...</span>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">
                Este paciente aún no tiene sesiones registradas.
              </p>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Fecha</TableHeaderCell>
                    <TableHeaderCell>Ejercicio</TableHeaderCell>
                    <TableHeaderCell>Fase</TableHeaderCell>
                    <TableHeaderCell>ROM máx (°)</TableHeaderCell>
                    <TableHeaderCell>Duración (s)</TableHeaderCell>
                    <TableHeaderCell>Notas</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{formatDate(s.startedAt)}</TableCell>
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
                        {s.durationSecs != null ? s.durationSecs : "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {s.notes || "—"}
                        </span>
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