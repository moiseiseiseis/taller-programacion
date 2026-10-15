// Ventana del piloto de medición de tiempo de estudio. Cualquier alumno
// cuya cuenta se haya creado dentro de esta ventana entra automáticamente
// al grupo piloto — no hay bandera manual que mantener por alumno.
// Ajusta estas dos fechas según cuándo arranque/termine el piloto real.
export const PILOT_START_DATE = new Date('2026-10-14T00:00:00Z');
export const PILOT_END_DATE = new Date('2026-11-14T00:00:00Z');

export function isPilotStudent(userCreatedAt: string | null | undefined): boolean {
  if (!userCreatedAt) return false;
  const createdAt = new Date(userCreatedAt);
  return createdAt >= PILOT_START_DATE && createdAt <= PILOT_END_DATE;
}

// Mientras el piloto sigue activo en el calendario, seguimos aceptando
// heartbeats/cierres de sesiones ya abiertas aunque un alumno individual
// haya entrado justo en el borde de la ventana.
export function isPilotWindowOpen(): boolean {
  return new Date() <= PILOT_END_DATE;
}

// Tras este tiempo sin heartbeat, una sesión abierta se considera
// abandonada y se cierra sola con ended_reason='timeout'.
export const STUDY_SESSION_TIMEOUT_MINUTES = 10;
