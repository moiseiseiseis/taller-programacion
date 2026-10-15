// Ventana del piloto de medición de tiempo de estudio. Cualquier alumno
// cuya cuenta se haya creado dentro de esta ventana entra automáticamente
// al grupo piloto — no hay bandera manual que mantener por alumno.
// Ajusta estas dos fechas según cuándo arranque/termine el piloto real.
export const PILOT_START_DATE = new Date('2026-10-14T00:00:00Z');
export const PILOT_END_DATE = new Date('2026-11-14T00:00:00Z');

// Cuentas de prueba que entran al piloto sin importar su fecha de registro
// (para poder probar el flujo antes de que existan altas reales dentro de
// la ventana). No afecta el criterio real de "quién es del piloto".
const PILOT_TEST_OVERRIDE_USER_IDS = new Set([
  '150a7fe0-e0d3-4171-bbd1-88a2b7c4d3a1', // jessepinkman@gmail.com
]);

export function isPilotStudent(userCreatedAt: string | null | undefined, userId?: string | null): boolean {
  if (userId && PILOT_TEST_OVERRIDE_USER_IDS.has(userId)) return true;
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
