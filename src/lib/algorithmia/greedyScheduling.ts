// Simulación pura del problema clásico de selección de actividades:
// cubrir la mayor cantidad posible de tareas que no se traslapan en el
// tiempo, resuelto con una estrategia voraz (ordenar por hora de fin y
// aceptar cada actividad que no choque con la última aceptada).

export type Activity = {
  id: string;
  label: string;
  start: number;
  end: number;
};

export type GreedyActivityConfig = {
  activities: Activity[];
};

export const DEFAULT_GREEDY_ACTIVITY_CONFIG: GreedyActivityConfig = {
  activities: [
    { id: 'a1', label: 'Reunión de equipo', start: 9, end: 10 },
    { id: 'a2', label: 'Revisión de diseño', start: 9.5, end: 11 },
    { id: 'a3', label: 'Llamada con cliente', start: 10, end: 10.5 },
    { id: 'a4', label: 'Escribir propuesta', start: 10.5, end: 12.5 },
    { id: 'a5', label: 'Almuerzo de trabajo', start: 12, end: 13 },
    { id: 'a6', label: 'Entrevista', start: 13, end: 14 },
    { id: 'a7', label: 'Cierre del día', start: 13.5, end: 15 },
  ],
};

export function activitiesOverlap(a: Activity, b: Activity): boolean {
  return a.start < b.end && b.start < a.end;
}

// Estrategia voraz: ordenar por hora de fin, aceptar cada actividad cuyo
// inicio no choque con el fin de la última actividad aceptada.
export function maxNonOverlapping(activities: Activity[]): Activity[] {
  const sorted = [...activities].sort((a, b) => a.end - b.end);
  const result: Activity[] = [];
  let lastEnd = -Infinity;
  for (const activity of sorted) {
    if (activity.start >= lastEnd) {
      result.push(activity);
      lastEnd = activity.end;
    }
  }
  return result;
}
