// Simulación pura del problema de la secretaria (parada óptima). Sin I/O,
// mismo espíritu que scoreLessonQuiz/checkLogicPuzzle: la UI llama estas
// funciones, nunca al revés.

export type StoppingConfig = {
  sequenceLength: number;
  trialsForComparison: number;
  earlyLookFraction: number;
  lateLookFraction: number;
};

export const DEFAULT_STOPPING_CONFIG: StoppingConfig = {
  sequenceLength: 20,
  trialsForComparison: 500,
  earlyLookFraction: 0.1,
  lateLookFraction: 0.7,
};

// 1/e ≈ 0.368 — el punto de corte matemáticamente óptimo (la "regla del 37%").
export const OPTIMAL_LOOK_FRACTION = 1 / Math.E;

// Permutación aleatoria de rangos 1..length (1 = mejor candidato).
export function generateSequence(length: number): number[] {
  const sequence = Array.from({ length }, (_, i) => i + 1);
  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }
  return sequence;
}

export type StoppingResult = {
  stoppedAtIndex: number;
  chosenRank: number;
  won: boolean;
};

// Mira los primeros floor(length*lookFraction) candidatos para calibrar
// ("mejor visto hasta ahora"), después elige el primero que supere a todos
// los anteriores. Si ninguno califica, se queda con el último de la
// secuencia (igual que en la vida real: si sigues esperando algo mejor y no
// aparece, terminas con lo último que viste).
export function playLookThenLeap(sequence: number[], lookFraction: number): StoppingResult {
  const lookCount = Math.max(1, Math.floor(sequence.length * lookFraction));
  const bestInLookPhase = Math.min(...sequence.slice(0, lookCount));

  for (let i = lookCount; i < sequence.length; i++) {
    if (sequence[i] < bestInLookPhase) {
      return { stoppedAtIndex: i, chosenRank: sequence[i], won: sequence[i] === 1 };
    }
  }

  const lastIndex = sequence.length - 1;
  return { stoppedAtIndex: lastIndex, chosenRank: sequence[lastIndex], won: sequence[lastIndex] === 1 };
}

export type ComparisonResult = {
  early: number;
  optimal: number;
  late: number;
};

// Corre trialsForComparison secuencias nuevas para cada una de las tres
// estrategias y devuelve la tasa de éxito (0-1) de cada una — esto es lo
// que prueba "por qué la regla del 37% gana en promedio".
export function runMonteCarloComparison(config: StoppingConfig): ComparisonResult {
  const strategies = {
    early: config.earlyLookFraction,
    optimal: OPTIMAL_LOOK_FRACTION,
    late: config.lateLookFraction,
  };

  const wins = { early: 0, optimal: 0, late: 0 };

  for (let trial = 0; trial < config.trialsForComparison; trial++) {
    for (const key of Object.keys(strategies) as (keyof typeof strategies)[]) {
      const sequence = generateSequence(config.sequenceLength);
      if (playLookThenLeap(sequence, strategies[key]).won) wins[key]++;
    }
  }

  return {
    early: wins.early / config.trialsForComparison,
    optimal: wins.optimal / config.trialsForComparison,
    late: wins.late / config.trialsForComparison,
  };
}
