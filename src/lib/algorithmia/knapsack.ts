// Simulación pura del problema de la mochila (0/1 knapsack), resuelto por
// fuerza bruta (probar todas las combinaciones) y por programación
// dinámica (guardar la solución de cada subproblema una sola vez).

export type KnapsackItem = {
  id: string;
  label: string;
  weight: number;
  value: number;
};

export type KnapsackConfig = {
  items: KnapsackItem[];
  capacity: number;
};

export const DEFAULT_KNAPSACK_CONFIG: KnapsackConfig = {
  items: [
    { id: 'i1', label: 'Excursión a la montaña', weight: 3, value: 8 },
    { id: 'i2', label: 'Clase de cocina local', weight: 2, value: 5 },
    { id: 'i3', label: 'Museo de historia', weight: 1, value: 3 },
    { id: 'i4', label: 'Tour gastronómico nocturno', weight: 4, value: 9 },
    { id: 'i5', label: 'Paseo en bicicleta por la costa', weight: 2, value: 4 },
  ],
  capacity: 6,
};

// Cantidad total de combinaciones posibles (probar sí/no incluir cada
// elemento) — es lo que evalúa la fuerza bruta.
export function bruteForceCombinationsCount(itemCount: number): number {
  return 2 ** itemCount;
}

export function bestValueBruteForce(config: KnapsackConfig): { bestValue: number; chosenIds: string[] } {
  const n = config.items.length;
  let bestValue = 0;
  let bestChoice: string[] = [];

  for (let mask = 0; mask < 2 ** n; mask++) {
    let weight = 0;
    let value = 0;
    const chosenIds: string[] = [];
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        weight += config.items[i].weight;
        value += config.items[i].value;
        chosenIds.push(config.items[i].id);
      }
    }
    if (weight <= config.capacity && value > bestValue) {
      bestValue = value;
      bestChoice = chosenIds;
    }
  }

  return { bestValue, chosenIds: bestChoice };
}

// Programación dinámica clásica: table[i][w] = mejor valor posible usando
// los primeros i elementos con capacidad w. Cada celda se calcula una sola
// vez a partir de celdas ya resueltas, en vez de volver a probar
// combinaciones completas.
export function knapsackDP(config: KnapsackConfig): { bestValue: number; chosenIds: string[]; cellsComputed: number } {
  const { items, capacity } = config;
  const n = items.length;
  const table: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (item.weight > w) {
        table[i][w] = table[i - 1][w];
      } else {
        table[i][w] = Math.max(table[i - 1][w], table[i - 1][w - item.weight] + item.value);
      }
    }
  }

  const chosenIds: string[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (table[i][w] !== table[i - 1][w]) {
      chosenIds.unshift(items[i - 1].id);
      w -= items[i - 1].weight;
    }
  }

  return { bestValue: table[n][capacity], chosenIds, cellsComputed: n * (capacity + 1) };
}
