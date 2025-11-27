// src/lib/types/session.ts

import type { Patient } from "./patient";

export type SessionType = string | null;

export interface Session {
  id: string;

  patientId: string;
  patient?: Patient; // Habitual tenerlo "expandido" en /sessions o /sessions/:id

  startedAt: string;        // ISO string
  endedAt: string | null;   // ISO o null
  durationSecs: number;

  romMaxDeg: number | null;
  notes?: string | null;

  exerciseId: string;       // "heel_slide", "mini_squat_0_45", etc.
  phaseLabel: string;       // "Fase 1 – Movilidad inicial", etc.
  sessionType?: SessionType; // ej. "gamification_session"

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

export interface GetSessionsParams {
  patientId?: string;
  from?: string;       // ISO date (inicio)
  to?: string;         // ISO date (fin)
  exerciseId?: string;
  phaseLabel?: string;
  limit?: number;
}
