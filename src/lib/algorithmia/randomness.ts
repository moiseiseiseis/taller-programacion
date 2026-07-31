// Simulación pura de escalar una "montaña" de calidad: comparación entre
// una estrategia puramente determinista (subir siempre al vecino mejor, se
// atora en óptimos locales) y una con algo de aleatoriedad a propósito
// (recocido simulado simplificado), que a veces acepta un paso peor para
// poder escapar de un óptimo local.

export type LandscapeConfig = {
  landscape: number[];
  maxSteps: number;
  initialTemperature: number;
  trialsForComparison: number;
};

export function hillClimb(landscape: number[], start: number, maxSteps: number): number {
  let current = start;
  for (let step = 0; step < maxSteps; step++) {
    const neighbors = [current - 1, current + 1].filter((i) => i >= 0 && i < landscape.length);
    const better = neighbors.filter((i) => landscape[i] > landscape[current]);
    if (better.length === 0) break;
    current = better.reduce((best, i) => (landscape[i] > landscape[best] ? i : best), better[0]);
  }
  return current;
}

// "Temperatura" decreciente: al principio acepta pasos peores con más
// facilidad (para poder escapar de un óptimo local), y hacia el final casi
// no acepta nada peor (se comporta casi como hillClimb).
export function simulatedAnnealing(
  landscape: number[],
  start: number,
  maxSteps: number,
  initialTemperature: number
): number {
  let current = start;
  for (let step = 0; step < maxSteps; step++) {
    const temperature = initialTemperature * (1 - step / maxSteps);
    const neighbors = [current - 1, current + 1].filter((i) => i >= 0 && i < landscape.length);
    if (neighbors.length === 0) break;
    const candidate = neighbors[Math.floor(Math.random() * neighbors.length)];
    const delta = landscape[candidate] - landscape[current];
    if (delta > 0 || (temperature > 0 && Math.random() < Math.exp(delta / temperature))) {
      current = candidate;
    }
  }
  return current;
}

export type LandscapeComparisonResult = {
  deterministicRate: number;
  randomizedRate: number;
};

// Corre trialsForComparison arranques al azar por cada estrategia y mide
// qué tan seguido cada una termina en el máximo global (no en un óptimo
// local).
export function runLandscapeComparison(config: LandscapeConfig): LandscapeComparisonResult {
  const globalBestValue = Math.max(...config.landscape);
  let deterministicHits = 0;
  let randomizedHits = 0;

  for (let trial = 0; trial < config.trialsForComparison; trial++) {
    const start = Math.floor(Math.random() * config.landscape.length);

    const detResult = hillClimb(config.landscape, start, config.maxSteps);
    if (config.landscape[detResult] === globalBestValue) deterministicHits++;

    const randResult = simulatedAnnealing(config.landscape, start, config.maxSteps, config.initialTemperature);
    if (config.landscape[randResult] === globalBestValue) randomizedHits++;
  }

  return {
    deterministicRate: deterministicHits / config.trialsForComparison,
    randomizedRate: randomizedHits / config.trialsForComparison,
  };
}
