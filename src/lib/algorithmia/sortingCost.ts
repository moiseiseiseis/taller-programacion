// Calculadora pura del costo de ordenar vs. buscar sin ordenar. Sin
// fórmulas complejas: ordenar es ~lineal en la cantidad de ítems, buscar
// sin ordenar es lineal por búsqueda (se revisa la mitad en promedio),
// buscar ordenado es logarítmico por búsqueda (se descarta la mitad cada
// vez, tipo búsqueda binaria).

export type SortingConfig = {
  defaultItemCount: number;
  sortCostPerItem: number;
  unsortedSearchCost: number;
  sortedSearchCost: number;
  maxSearchesSlider: number;
};

export const DEFAULT_SORTING_CONFIG: SortingConfig = {
  defaultItemCount: 200,
  sortCostPerItem: 1,
  unsortedSearchCost: 1,
  sortedSearchCost: 1,
  maxSearchesSlider: 60,
};

export function costWithoutSorting(config: SortingConfig, itemCount: number, numSearches: number): number {
  return numSearches * (itemCount / 2) * config.unsortedSearchCost;
}

export function costWithSorting(config: SortingConfig, itemCount: number, numSearches: number): number {
  const sortCost = itemCount * config.sortCostPerItem;
  const perSearchCost = Math.ceil(Math.log2(Math.max(itemCount, 2))) * config.sortedSearchCost;
  return sortCost + numSearches * perSearchCost;
}

// Primer número de búsquedas (dentro del rango del slider) donde ordenar
// primero sale más barato o igual que no ordenar. null si, dentro de ese
// rango, nunca conviene ordenar con esta configuración.
export function findBreakEvenSearches(config: SortingConfig, itemCount: number): number | null {
  for (let n = 1; n <= config.maxSearchesSlider; n++) {
    if (costWithSorting(config, itemCount, n) <= costWithoutSorting(config, itemCount, n)) return n;
  }
  return null;
}
