// Simulación pura de k-vecinos más cercanos: predecir la categoría de un
// caso nuevo mirando qué les pasó a los k casos conocidos más parecidos
// (por distancia en una sola característica numérica), en vez de combinar
// una tasa base con evidencia nueva como en la regla de Bayes.

export type KnnPoint = {
  id: string;
  label: string;
  category: string;
  feature: number;
};

export type KnnConfig = {
  featureName: string;
  points: KnnPoint[];
  newCaseLabel: string;
  newCaseFeature: number;
  k: number;
};

export const DEFAULT_KNN_CONFIG: KnnConfig = {
  featureName: 'años de experiencia',
  points: [
    { id: 'p1', label: 'Persona A', category: 'junior', feature: 0.5 },
    { id: 'p2', label: 'Persona B', category: 'junior', feature: 1 },
    { id: 'p3', label: 'Persona C', category: 'junior', feature: 1.5 },
    { id: 'p4', label: 'Persona D', category: 'semi-senior', feature: 3 },
    { id: 'p5', label: 'Persona E', category: 'semi-senior', feature: 3.5 },
    { id: 'p6', label: 'Persona F', category: 'senior', feature: 6 },
    { id: 'p7', label: 'Persona G', category: 'senior', feature: 8 },
    { id: 'p8', label: 'Persona H', category: 'senior', feature: 9 },
  ],
  newCaseLabel: 'Persona nueva',
  newCaseFeature: 3.2,
  k: 3,
};

export function nearestNeighbors(points: KnnPoint[], target: number, k: number): KnnPoint[] {
  return [...points].sort((a, b) => Math.abs(a.feature - target) - Math.abs(b.feature - target)).slice(0, k);
}

export function majorityCategory(neighbors: KnnPoint[]): string {
  const counts: Record<string, number> = {};
  for (const n of neighbors) counts[n.category] = (counts[n.category] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}
