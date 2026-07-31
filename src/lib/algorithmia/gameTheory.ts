// Comprobación pura de equilibrios de Nash en un juego 2x2 simple: para
// cada combinación de elecciones, un equilibrio es una casilla donde
// ninguna de las dos partes mejora su propio resultado cambiando de
// elección en solitario (manteniendo fija la elección de la otra parte).

export type GameCell = {
  choiceA: 0 | 1;
  choiceB: 0 | 1;
  payoffA: number;
  payoffB: number;
};

export type GameConfig = {
  choiceLabels: [string, string];
  cells: GameCell[];
};

function findCell(cells: GameCell[], choiceA: 0 | 1, choiceB: 0 | 1): GameCell {
  return cells.find((c) => c.choiceA === choiceA && c.choiceB === choiceB)!;
}

export function isNashEquilibrium(cells: GameCell[], choiceA: 0 | 1, choiceB: 0 | 1): boolean {
  const current = findCell(cells, choiceA, choiceB);
  const otherA = choiceA === 0 ? 1 : 0;
  const otherB = choiceB === 0 ? 1 : 0;

  const ifASwitches = findCell(cells, otherA, choiceB);
  const ifBSwitches = findCell(cells, choiceA, otherB);

  return current.payoffA >= ifASwitches.payoffA && current.payoffB >= ifBSwitches.payoffB;
}

export function findNashEquilibria(config: GameConfig): GameCell[] {
  return config.cells.filter((cell) => isNashEquilibrium(config.cells, cell.choiceA, cell.choiceB));
}

// La celda con mayor suma de pagos (el mejor resultado conjunto posible),
// para comparar contra el/los equilibrio(s) — muestran por qué "estable"
// (nadie mejora cambiando solo) no siempre es "óptimo" (lo mejor para
// ambas partes juntas).
export function findBestJointOutcome(config: GameConfig): GameCell {
  return config.cells.reduce((best, cell) =>
    cell.payoffA + cell.payoffB > best.payoffA + best.payoffB ? cell : best
  );
}
