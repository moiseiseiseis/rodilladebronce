// src/lib/types/patient.ts

/**
 * NOTA IMPORTANTE:
 * El backend puede devolver la info del paciente de distintas formas:
 *
 * 1) Como usuario plano:
 *    { id, name, email, role, createdAt, ... }
 *
 * 2) Como entidad Patient con relación a User:
 *    {
 *      id,
 *      userId,
 *      user: { id, name, email, role, createdAt },
 *      ...
 *    }
 *
 * Para no depender de un único shape, hacemos el tipo flexible y
 * usamos helpers getPatientDisplayName / getPatientDisplayEmail.
 */

export interface PatientUserLike {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  createdAt?: string | null;
}

export interface Patient {
  id: string;

  // Opciones de nombre y correo según cómo venga del backend
  fullName?: string | null;     // por si el backend usa fullName
  name?: string | null;         // por si usa name
  email?: string | null;

  // Relación opcional a user
  userId?: string | null;
  user?: PatientUserLike | null;

  phone?: string | null;
  dateOfBirth?: string | null;  // ISO
  diagnosis?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  [key: string]: unknown;
}

/** Devuelve un nombre “bonito” para mostrar en tablas */
export function getPatientDisplayName(p: Patient): string {
  return (
    p.fullName ||
    p.name ||
    p.user?.name ||
    p.email ||
    p.user?.email ||
    "Sin nombre"
  );
}

/** Devuelve el correo principal (si existe) */
export function getPatientDisplayEmail(p: Patient): string | null {
  return p.email || p.user?.email || null;
}

