// Calculadora pura de predicción con la regla de Bayes simplificada
// (sin fórmulas complejas): dos reglas de sentido común según el tipo de
// proceso, tomadas de la explicación de Algorithms to Live By.

export type BayesScenario = {
  id: string;
  description: string;
  // 'normal': procesos con una duración típica esperable (una película, un
  // trámite) — la regla resta lo ya transcurrido del promedio.
  // 'power_law': procesos sin una escala natural, donde cuanto más duró
  // algo, más se espera que dure (el "efecto Lindy") — la regla dice que
  // falta aproximadamente lo mismo que ya pasó.
  distributionType: 'normal' | 'power_law';
  elapsed: number;
  averageTotal?: number; // solo aplica a 'normal'
  unit: string;
};

export type BayesConfig = {
  scenarios: BayesScenario[];
};

export function predictRemaining(scenario: BayesScenario): number {
  if (scenario.distributionType === 'normal') {
    return Math.max(0, (scenario.averageTotal ?? scenario.elapsed) - scenario.elapsed);
  }
  return scenario.elapsed;
}
