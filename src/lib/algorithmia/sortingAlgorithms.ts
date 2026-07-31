// Simulación pura de selection sort ejecutado a mano (elegir el menor
// elemento restante, pasada tras pasada), y comparación de la cantidad de
// comparaciones que necesita contra el promedio de quicksort.

export type SortingAlgorithmsConfig = {
  list: number[];
};

export const DEFAULT_SORTING_ALGORITHMS_CONFIG: SortingAlgorithmsConfig = {
  list: [29, 4, 71, 15, 8, 47, 3, 22],
};

// Comparaciones totales de selection sort: en cada pasada se compara el
// candidato a mínimo contra todos los demás elementos restantes.
export function selectionSortComparisons(n: number): number {
  return (n * (n - 1)) / 2;
}

// Estimación del promedio de comparaciones de quicksort: O(n log n).
export function quicksortAverageComparisons(n: number): number {
  return Math.round(n * Math.log2(n));
}
