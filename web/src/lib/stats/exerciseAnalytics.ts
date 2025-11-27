// src/lib/stats/exerciseAnalytics.ts
import type { Session } from "@/lib/types/session";
import { getExerciseLabel } from "@/lib/types/exercise";

export interface ExerciseStats {
  exerciseId: string;
  label: string;
  count: number;
  avgRom: number | null;
  maxRom: number | null;
  avgDuration: number | null;
  totalDuration: number;
}

export function buildExerciseStats(sessions: Session[]): ExerciseStats[] {
  const byExercise = new Map<string, Session[]>();

  for (const s of sessions) {
    if (!s.exerciseId) continue;
    const key = s.exerciseId;
    if (!byExercise.has(key)) byExercise.set(key, []);
    byExercise.get(key)!.push(s);
  }

  const stats: ExerciseStats[] = [];

  for (const [exerciseId, list] of byExercise.entries()) {
    const label = getExerciseLabel(exerciseId);

    const romValues = list
      .map((s) => s.romMaxDeg)
      .filter((v): v is number => v != null);

    const durValues = list
      .map((s) => s.durationSecs)
      .filter((v): v is number => v != null);

    const avgRom =
      romValues.length > 0
        ? romValues.reduce((a, b) => a + b, 0) / romValues.length
        : null;

    const maxRom =
      romValues.length > 0 ? Math.max(...romValues) : null;

    const totalDuration = durValues.reduce((a, b) => a + b, 0);
    const avgDuration =
      durValues.length > 0 ? totalDuration / durValues.length : null;

    stats.push({
      exerciseId,
      label,
      count: list.length,
      avgRom,
      maxRom,
      avgDuration,
      totalDuration,
    });
  }

  // ordenar por número de sesiones descendente
  stats.sort((a, b) => b.count - a.count);

  return stats;
}
