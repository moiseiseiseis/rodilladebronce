// src/lib/api/analysis.ts

import { apiFetch } from "./client";
import type {
  GlobalAnalysis,
  PatientAnalysis,
  SessionAnalysis,
} from "@/lib/types/analysis";

/**
 * NOTA IMPORTANTE:
 *
 * Estos métodos asumen que el backend NestJS expone los endpoints:
 *
 * GET /analysis/global
 * GET /analysis/patient/:id
 * GET /analysis/session/:sessionId
 *
 * Si aún no existen, las llamadas devolverán 404 hasta que los implementes.
 */

/**
 * Analítica global de toda la base de datos:
 * - totalPatients
 * - totalSessions
 * - romByExercise
 * - sessionsPerDay
 * - sessionsByPhase
 */
export async function getGlobalAnalysis(): Promise<GlobalAnalysis> {
  // Por defecto apiFetch ya inyecta Authorization si hay token.
  const data = await apiFetch<GlobalAnalysis>("/analysis/global", {
    method: "GET",
  });
  return data;
}

/**
 * Analítica específica de un paciente:
 * - tendencia de ROM
 * - ROM por ejercicio
 * - distribución por fase
 * - frecuencia por día, etc.
 */
export async function getPatientAnalysis(
  patientId: string
): Promise<PatientAnalysis> {
  if (!patientId) {
    throw new Error("getPatientAnalysis: patientId es requerido");
  }

  const data = await apiFetch<PatientAnalysis>(
    `/analysis/patient/${encodeURIComponent(patientId)}`,
    {
      method: "GET",
    }
  );

  return data;
}

/**
 * Analítica comparativa de una sesión puntual:
 * - percentiles vs paciente
 * - percentiles vs global
 * - banderas clínicas
 */
export async function getSessionAnalysis(
  sessionId: string
): Promise<SessionAnalysis> {
  if (!sessionId) {
    throw new Error("getSessionAnalysis: sessionId es requerido");
  }

  const data = await apiFetch<SessionAnalysis>(
    `/analysis/session/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
    }
  );

  return data;
}

