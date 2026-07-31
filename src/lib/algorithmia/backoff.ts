// Calculadora pura de un calendario de seguimiento con espera creciente
// (retroceso exponencial / exponential backoff).

export type BackoffConfig = {
  baseWaitDays: number;
  maxAttempts: number;
};

export const DEFAULT_BACKOFF_CONFIG: BackoffConfig = {
  baseWaitDays: 2,
  maxAttempts: 5,
};

export type BackoffStep = {
  attempt: number;
  waitDays: number;
  cumulativeDay: number;
};

// multiplier = 1 significa "esperar siempre lo mismo" (constante, puede
// resultar insistente); multiplier > 1 hace que la espera crezca cada vez
// (retroceso exponencial real).
export function computeSchedule(config: BackoffConfig, multiplier: number): BackoffStep[] {
  const steps: BackoffStep[] = [];
  let cumulative = 0;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    const waitDays = Math.round(config.baseWaitDays * Math.pow(multiplier, attempt - 1));
    cumulative += waitDays;
    steps.push({ attempt, waitDays, cumulativeDay: cumulative });
  }

  return steps;
}
