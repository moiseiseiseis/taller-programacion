// Simulación pura de una hash table rudimentaria: una función de hash
// (suma de códigos de caracteres, módulo la cantidad de casillas) decide
// en qué casilla cae cada clave, y buscar algo se reduce a ir directo a
// esa casilla en vez de revisar una lista completa.

export type HashItem = {
  id: string;
  key: string;
};

export type HashTableConfig = {
  items: HashItem[];
  bucketCount: number;
};

export const DEFAULT_HASH_TABLE_CONFIG: HashTableConfig = {
  items: [
    { id: 'p1', key: 'manzana' },
    { id: 'p2', key: 'pera' },
    { id: 'p3', key: 'uva' },
    { id: 'p4', key: 'kiwi' },
    { id: 'p5', key: 'mango' },
    { id: 'p6', key: 'limon' },
    { id: 'p7', key: 'fresa' },
    { id: 'p8', key: 'sandia' },
  ],
  bucketCount: 5,
};

export function simpleHash(key: string, bucketCount: number): number {
  let sum = 0;
  for (const ch of key) sum += ch.charCodeAt(0);
  return sum % bucketCount;
}

export function buildBuckets(items: HashItem[], bucketCount: number): HashItem[][] {
  const buckets: HashItem[][] = Array.from({ length: bucketCount }, () => []);
  for (const item of items) {
    buckets[simpleHash(item.key, bucketCount)].push(item);
  }
  return buckets;
}

// Promedio de pasos para encontrar algo revisando una lista sin indexar,
// elemento por elemento, hasta encontrarlo.
export function averageLinearScanSteps(n: number): number {
  return Math.ceil((n + 1) / 2);
}
