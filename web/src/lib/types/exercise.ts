// src/lib/types/exercise.ts

export interface ExerciseMeta {
  id: string;
  label: string;
  description?: string;
  phaseLabelDefaults?: string[];
}

export const EXERCISES_CATALOG: ExerciseMeta[] = [
  {
    id: "heel_slide",
    label: "Heel Slide",
    description: "Deslizamiento del talón en flexo-extensión asistida.",
    phaseLabelDefaults: ["Fase 1 – Movilidad inicial"],
  },
  {
    id: "mini_squat_0_45",
    label: "Mini Squat 0–45°",
    description: "Mini sentadilla con rango limitado a 0–45°.",
    phaseLabelDefaults: ["Fase 2 – Movilidad funcional"],
  },
  {
    id: "towel_extension",
    label: "Extensión con toalla",
    description: "Extensión de rodilla asistida con toalla.",
  },
];

export function getExerciseLabel(exerciseId: string): string {
  const found = EXERCISES_CATALOG.find((e) => e.id === exerciseId);
  return found ? found.label : exerciseId;
}
