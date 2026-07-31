// Simulación pura de un grafo: encontrar el camino más corto entre dos
// nodos. Con pesos uniformes esto es búsqueda en anchura (grados de
// separación); con pesos distintos por conexión es Dijkstra (ruta más
// barata). Es el mismo algoritmo general en ambos casos.

export type GraphNode = {
  id: string;
  label: string;
};

export type GraphEdge = {
  from: string;
  to: string;
  weight?: number; // si falta, se asume 1 (todas las conexiones cuestan igual)
};

export type GraphConfig = {
  socialNodes: GraphNode[];
  socialEdges: GraphEdge[];
  startPersonId: string;
  targetPersonId: string;
  mapNodes: GraphNode[];
  mapEdges: GraphEdge[];
  startCityId: string;
  targetCityId: string;
};

export function getNeighbors(edges: GraphEdge[], nodeId: string): { to: string; weight: number }[] {
  const result: { to: string; weight: number }[] = [];
  for (const e of edges) {
    if (e.from === nodeId) result.push({ to: e.to, weight: e.weight ?? 1 });
    if (e.to === nodeId) result.push({ to: e.from, weight: e.weight ?? 1 });
  }
  return result;
}

export function shortestPath(edges: GraphEdge[], startId: string, targetId: string): { distance: number; path: string[] } {
  const allNodes = new Set<string>();
  edges.forEach((e) => {
    allNodes.add(e.from);
    allNodes.add(e.to);
  });

  const dist = new Map<string, number>([[startId, 0]]);
  const prev = new Map<string, string>();
  const pending = new Set(allNodes);
  pending.add(startId);

  while (pending.size > 0) {
    let current: string | null = null;
    let currentDist = Infinity;
    for (const n of pending) {
      const d = dist.get(n) ?? Infinity;
      if (d < currentDist) {
        currentDist = d;
        current = n;
      }
    }
    if (current === null) break;
    pending.delete(current);
    if (current === targetId) break;

    for (const { to, weight } of getNeighbors(edges, current)) {
      if (!pending.has(to)) continue;
      const newDist = currentDist + weight;
      if (newDist < (dist.get(to) ?? Infinity)) {
        dist.set(to, newDist);
        prev.set(to, current);
      }
    }
  }

  const path: string[] = [];
  let cur: string | undefined = targetId;
  while (cur !== undefined) {
    path.unshift(cur);
    cur = prev.get(cur);
  }
  return { distance: dist.get(targetId) ?? Infinity, path: path[0] === startId ? path : [] };
}

export const DEFAULT_GRAPH_CONFIG: GraphConfig = {
  socialNodes: [
    { id: 'you', label: 'Tú' },
    { id: 'ana', label: 'Ana' },
    { id: 'beto', label: 'Beto' },
    { id: 'carla', label: 'Carla' },
    { id: 'dario', label: 'Darío' },
    { id: 'elena', label: 'Elena' },
    { id: 'fer', label: 'Fer (organizadora del evento)' },
  ],
  socialEdges: [
    { from: 'you', to: 'ana' },
    { from: 'you', to: 'beto' },
    { from: 'ana', to: 'carla' },
    { from: 'beto', to: 'dario' },
    { from: 'carla', to: 'elena' },
    { from: 'dario', to: 'elena' },
    { from: 'elena', to: 'fer' },
  ],
  startPersonId: 'you',
  targetPersonId: 'fer',
  mapNodes: [
    { id: 'a', label: 'Ciudad A' },
    { id: 'b', label: 'Ciudad B' },
    { id: 'c', label: 'Ciudad C' },
    { id: 'd', label: 'Ciudad D' },
    { id: 'e', label: 'Ciudad E' },
  ],
  mapEdges: [
    { from: 'a', to: 'b', weight: 2 },
    { from: 'a', to: 'c', weight: 5 },
    { from: 'b', to: 'c', weight: 1 },
    { from: 'b', to: 'd', weight: 6 },
    { from: 'c', to: 'd', weight: 2 },
    { from: 'd', to: 'e', weight: 1 },
    { from: 'c', to: 'e', weight: 7 },
  ],
  startCityId: 'a',
  targetCityId: 'e',
};
