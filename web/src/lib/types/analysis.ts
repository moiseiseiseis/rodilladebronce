// src/lib/types/analysis.ts

/**
 * CONTRATO PROPUESTO PARA EL BACKEND NESTJS (ADITIVO, NO DESTRUCTIVO)
 *
 * GET /analysis/global -> GlobalAnalysis
 * GET /analysis/patient/:id -> PatientAnalysis
 * GET /analysis/session/:sessionId -> SessionAnalysis
 *
 * Ajusta los tipos aquí si en tu implementación real cambias algún campo.
 */

export interface RomStats {
  avg: number;         // ROM promedio en grados
  min: number;         // ROM mínimo observado
  max: number;         // ROM máximo observado
  count?: number;      // número de sesiones consideradas (opcional)
}

export interface DurationStats {
  avg: number;         // duración promedio en segundos
  min: number;         // duración mínima en segundos
  max: number;         // duración máxima en segundos
  total?: number;      // suma total de duración (opcional)
}

/**
 * Análisis global de toda la base de datos
 */
export interface GlobalAnalysis {
  totalPatients: number;
  totalSessions: number;

  /**
   * ROM por ejercicio.
   * key: exerciseId, ej. "heel_slide"
   */
  romByExercise: Record<string, RomStats>;

  /**
   * Conteo de sesiones por fecha (YYYY-MM-DD).
   * Ej:
   * { "2025-11-11": 4, "2025-11-12": 7 }
   */
  sessionsPerDay: Record<string, number>;

  /**
   * Distribución de sesiones por fase clínica.
   * Ej:
   * { "Fase 1 – Movilidad inicial": 113, "Fase 2 – Movilidad funcional": 88 }
   */
  sessionsByPhase: Record<string, number>;

  /**
   * Opcional: distribución de sesiones por tipo de sesión
   * (ej. "gamification_session", "standard_session", etc.)
   */
  sessionsByType?: Record<string, number>;

  /**
   * Opcional: por ejercicio y fase.
   * Ej:
   * { "heel_slide": { "Fase 1 – Movilidad inicial": 40, "Fase 2 – Movilidad funcional": 5 } }
   */
  sessionsByExerciseAndPhase?: Record<string, Record<string, number>>;
}

/**
 * Análisis específico de un paciente
 */
export interface PatientRomTrendPoint {
  date: string;      // ISO date string, ej. "2025-11-12"
  rom: number;       // ROM máximo de la sesión o promedio del día
  sessionId?: string;
}

export interface PatientFrequencyPoint {
  date: string;      // YYYY-MM-DD
  sessionsCount: number;
}

export interface PatientAnalysis {
  patientId: string;

  totalSessions: number;
  avgRom: number | null;             // promedio de ROM global del paciente
  romByExercise: Record<string, RomStats>; // estadísticas por exerciseId

  /**
   * Tendencia temporal de ROM (para line chart)
   */
  romTrend: PatientRomTrendPoint[];

  /**
   * Estadísticas de duración para todas las sesiones del paciente
   */
  sessionDurationStats: DurationStats;

  /**
   * Frecuencia de sesiones por día (para heatmap / barra)
   */
  frequencyByDay: PatientFrequencyPoint[];

  /**
   * Distribución por fase de rehabilitación para este paciente.
   */
  sessionsByPhase: Record<string, number>;

  /**
   * Opcional: breakdown por tipo de sesión del paciente.
   */
  sessionsByType?: Record<string, number>;
}

/**
 * Análisis comparativo de una sesión puntual
 */
export interface SessionAnalysis {
  sessionId: string;
  patientId: string;
  exerciseId: string;

  rom: number;           // ROM de esta sesión
  durationSecs: number;  // duración de esta sesión

  /**
   * Percentil de esta sesión respecto a TODAS las sesiones de ESTE paciente
   * para el mismo ejercicio (0-100).
   */
  percentilePatientExercise: number;

  /**
   * Percentil de esta sesión respecto a TODAS las sesiones de TODOS los pacientes
   * para el mismo ejercicio (0-100).
   */
  percentileGlobalExercise: number;

  /**
   * Comparativos booleanos convenientes.
   */
  abovePatientAvg: boolean;
  aboveGlobalAvg: boolean;

  /**
   * Promedios de referencia (útiles para tooltips).
   */
  patientExerciseAvgRom: number | null;
  globalExerciseAvgRom: number | null;

  /**
   * Opcional: notas o flags clínicos generados por reglas simples.
   * Ej: "Sesión por debajo del 25 percentil global."
   */
  clinicalFlags?: string[];
}

/* ------------------------------------------------------------------ */
/* Helpers para transformar diccionarios en arrays para gráficas      */
/* ------------------------------------------------------------------ */

export interface KeyValueNumber {
  key: string;
  value: number;
}

/**
 * Convierte { "Fase 1": 10, "Fase 2": 5 } en
 * [ { key: "Fase 1", value: 10 }, { key: "Fase 2", value: 5 } ]
 * para usar fácilmente en Recharts.
 */
export function mapRecordToArray(
  record: Record<string, number>
): KeyValueNumber[] {
  return Object.entries(record).map(([key, value]) => ({
    key,
    value,
  }));
}
