// src/lib/api/sessions.ts

"use client";

import { apiFetch } from "./client";
import type { Session, GetSessionsParams } from "../types/session";

function buildQuery(params?: GetSessionsParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();

  if (params.patientId) searchParams.set("patientId", params.patientId);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.exerciseId) searchParams.set("exerciseId", params.exerciseId);
  if (params.phaseLabel) searchParams.set("phaseLabel", params.phaseLabel);
  if (typeof params.limit === "number")
    searchParams.set("limit", String(params.limit));

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export async function getSessions(
  params?: GetSessionsParams
): Promise<Session[]> {
  const query = buildQuery(params);
  const sessions = await apiFetch<Session[]>(`/sessions${query}`, {
    method: "GET",
  });
  return sessions;
}

export async function getSession(id: string): Promise<Session> {
  const session = await apiFetch<Session>(`/sessions/${id}`, {
    method: "GET",
  });
  return session;
}
