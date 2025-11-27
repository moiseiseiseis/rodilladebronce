"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hooks/useAuth";
import { getPatients } from "@/lib/api/patients";
import {
  type Patient,
  getPatientDisplayName,
  getPatientDisplayEmail,
} from "@/lib/types/patient";
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

interface PatientsState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  search: string;
}

export default function PatientsPage() {
  const { user, status } = useRequireAuth(["CLINICIAN", "ADMIN"]);
  const [state, setState] = useState<PatientsState>({
    patients: [],
    loading: true,
    error: null,
    search: "",
  });

  useEffect(() => {
    if (!user || status === "loading") return;

    let cancelled = false;

    async function loadPatients() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const patientsRes = await getPatients();

        if (cancelled) return;

        const sorted = [...patientsRes].sort((a, b) =>
          getPatientDisplayName(a).localeCompare(
            getPatientDisplayName(b)
          )
        );

        setState((prev) => ({
          ...prev,
          loading: false,
          patients: sorted,
        }));
      } catch (err: any) {
        console.error("[PATIENTS] Error cargando pacientes:", err);
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err?.message ||
            "No se pudieron cargar los pacientes desde el backend.",
        }));
      }
    }

    loadPatients();

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

  const { patients, loading, error, search } = state;

  const filtered = patients.filter((p) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = getPatientDisplayName(p).toLowerCase();
    const email = (getPatientDisplayEmail(p) || "").toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  return (
    <Shell current="patients" userName={user.fullName || user.email}>
      <div className="space-y-4">
        <div>
          <h1 className="mb-1 text-xl font-semibold">Pacientes</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Listado de pacientes registrados en SmartKnee. Selecciona uno
            para ver el detalle de sus sesiones.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Pacientes</CardTitle>
                <CardDescription>
                  {loading
                    ? "Cargando pacientes..."
                    : `${filtered.length} de ${patients.length} paciente(s)`}
                </CardDescription>
              </div>
              <div className="w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
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
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Spinner size="sm" />
                <span>Cargando pacientes...</span>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">
                No se encontraron pacientes con ese criterio de búsqueda.
              </p>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Nombre</TableHeaderCell>
                    <TableHeaderCell>Correo</TableHeaderCell>
                    <TableHeaderCell>Diagnóstico</TableHeaderCell>
                    <TableHeaderCell>Fecha alta</TableHeaderCell>
                    {/* Nueva celda de encabezado para Acciones */}
                    <TableHeaderCell className="text-right">Acciones</TableHeaderCell> 
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((p) => {
                    const displayName = getPatientDisplayName(p);
                    const displayEmail = getPatientDisplayEmail(p);

                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link
                            href={`/patients/${p.id}`}
                            className="text-xs font-medium text-brand-700 hover:underline"
                          >
                            {displayName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-[var(--text-muted)]">
                            {displayEmail || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-[var(--text-muted)]">
                            {p.diagnosis || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-[var(--text-muted)]">
                            {p.createdAt
                              ? new Date(
                                  p.createdAt
                                ).toLocaleDateString("es-MX")
                              : "—"}
                          </span>
                        </TableCell>
                        {/* Celda de Acciones insertada */}
                        <TableCell className="px-3 py-2 text-right text-[11px]">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/patients/${p.id}`}
                              className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-[11px] text-slate-700 hover:border-brand-500 hover:text-brand-700 hover:bg-brand-500/10"
                            >
                              Detalle
                            </Link>
                            <Link
                              href={`/analysis/patient/${p.id}`}
                              className="rounded-xl border border-brand-500 bg-white px-2.5 py-1 text-[11px] text-brand-700 hover:bg-brand-500 hover:text-white hover:border-brand-600"
                            >
                              Análisis
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}