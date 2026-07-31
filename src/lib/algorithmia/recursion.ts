// Simulación pura de una recursión simple (factorial): descender llamando
// con n-1 hasta el caso base, y después deshacer el camino combinando los
// resultados (n * resultado_de_n-1) hasta llegar de vuelta al valor inicial.

export type RecursionConfig = {
  startN: number;
  baseCaseN: number;
  baseCaseValue: number;
};

export const DEFAULT_RECURSION_CONFIG: RecursionConfig = {
  startN: 5,
  baseCaseN: 0,
  baseCaseValue: 1,
};

// [startN, startN-1, ..., baseCaseN]
export function generateDescentChain(config: RecursionConfig): number[] {
  const chain: number[] = [];
  for (let n = config.startN; n >= config.baseCaseN; n--) {
    chain.push(n);
  }
  return chain;
}

// factorial(n) para cada n entre baseCaseN y startN, usando la regla
// factorial(n) = n * factorial(n-1), con factorial(baseCaseN) = baseCaseValue.
export function computeUnwindValues(config: RecursionConfig): Record<number, number> {
  const values: Record<number, number> = { [config.baseCaseN]: config.baseCaseValue };
  for (let n = config.baseCaseN + 1; n <= config.startN; n++) {
    values[n] = n * values[n - 1];
  }
  return values;
}
