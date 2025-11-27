// src/lib/api/patients.ts

"use client";

import { apiFetch } from "./client";
import type { Patient } from "../types/patient";

export async function getPatients(): Promise<Patient[]> {
  const patients = await apiFetch<Patient[]>("/patients", {
    method: "GET",
  });
  return patients;
}

export async function getPatient(id: string): Promise<Patient> {
  const patient = await apiFetch<Patient>(`/patients/${id}`, {
    method: "GET",
  });
  return patient;
}
