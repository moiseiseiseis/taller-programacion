// Simulación pura de un árbol (ej. genealógico): encontrar el ancestro
// común de dos nodos subiendo hacia la raíz, y comparar cuántos pasos toma
// buscar algo en un árbol balanceado vs. uno desbalanceado (una cadena).

export type TreeNode = {
  id: string;
  label: string;
  parentId: string | null;
};

export type TreeConfig = {
  nodes: TreeNode[];
  personAId: string;
  personBId: string;
  balancedNodeCount: number;
};

export const DEFAULT_TREE_CONFIG: TreeConfig = {
  nodes: [
    { id: 'g0', label: 'Trisabuela Rosa', parentId: null },
    { id: 'g1a', label: 'Abuelo Jorge', parentId: 'g0' },
    { id: 'g1b', label: 'Abuela Marta', parentId: 'g0' },
    { id: 'g2a', label: 'Papá Luis', parentId: 'g1a' },
    { id: 'g2b', label: 'Tía Elena', parentId: 'g1a' },
    { id: 'g2c', label: 'Tío Raúl', parentId: 'g1b' },
    { id: 'g3a', label: 'Tú', parentId: 'g2a' },
    { id: 'g3b', label: 'Prima Sofía', parentId: 'g2b' },
    { id: 'g3c', label: 'Primo Diego', parentId: 'g2c' },
  ],
  personAId: 'g3a',
  personBId: 'g3b',
  balancedNodeCount: 15,
};

export function getParent(nodes: TreeNode[], id: string): TreeNode | null {
  const node = nodes.find((n) => n.id === id);
  if (!node || node.parentId === null) return null;
  return nodes.find((n) => n.id === node.parentId) ?? null;
}

// [id, id del padre, ..., id de la raíz]
export function pathToRoot(nodes: TreeNode[], id: string): string[] {
  const path: string[] = [id];
  let current = nodes.find((n) => n.id === id) ?? null;
  while (current && current.parentId !== null) {
    path.push(current.parentId);
    current = nodes.find((n) => n.id === current!.parentId) ?? null;
  }
  return path;
}

export function findCommonAncestorId(nodes: TreeNode[], aId: string, bId: string): string {
  const pathA = pathToRoot(nodes, aId);
  const pathB = new Set(pathToRoot(nodes, bId));
  return pathA.find((id) => pathB.has(id))!;
}

export function generationOf(nodes: TreeNode[], id: string): number {
  return pathToRoot(nodes, id).length - 1;
}

export function countGenerations(nodes: TreeNode[]): number {
  return Math.max(...nodes.map((n) => generationOf(nodes, n.id))) + 1;
}

// Mejor caso posible con un árbol balanceado (búsqueda binaria sobre la
// estructura) vs. el peor caso de un árbol desbalanceado, degenerado en
// una cadena de un solo nodo por nivel.
export function balancedSearchSteps(nodeCount: number): number {
  return Math.ceil(Math.log2(nodeCount + 1));
}

export function unbalancedSearchSteps(nodeCount: number): number {
  return nodeCount;
}
