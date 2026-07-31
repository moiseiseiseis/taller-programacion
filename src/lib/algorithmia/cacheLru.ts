// Simulación pura de una caché de tamaño fijo con reemplazo LRU (menos
// usado recientemente). Sin I/O, mismo espíritu que el resto del motor.

export type CacheConfig = {
  cacheSize: number;
  streamLength: number;
  distinctItems: number;
};

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  cacheSize: 4,
  streamLength: 20,
  distinctItems: 7,
};

// Genera un flujo de pedidos con "localidad": unos pocos ítems se repiten
// mucho, el resto casi nada — así LRU realmente le gana al azar (si todos
// los ítems se pidieran por igual, ninguna política sería mejor que otra).
export function generateRequestStream(config: CacheConfig): string[] {
  const items = Array.from({ length: config.distinctItems }, (_, i) => String.fromCharCode(65 + i));
  const weights = items.map((_, i) => 1 / (i + 1)); // el primer ítem pesa más, van decreciendo
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const stream: string[] = [];
  for (let i = 0; i < config.streamLength; i++) {
    let r = Math.random() * totalWeight;
    let chosen = items[items.length - 1];
    for (let j = 0; j < items.length; j++) {
      r -= weights[j];
      if (r <= 0) {
        chosen = items[j];
        break;
      }
    }
    stream.push(chosen);
  }
  return stream;
}

export type CacheSlot = { item: string; lastUsedStep: number };

export type ProcessResult = {
  hit: boolean;
  needsEviction: boolean;
  newCache: CacheSlot[];
};

// Procesa un pedido contra el estado actual de la caché. Si hace falta
// desalojar a alguien y la caché está llena, needsEviction=true y newCache
// vuelve sin tocar — quien llama tiene que desalojar primero y volver a
// llamar.
export function processRequest(cache: CacheSlot[], item: string, step: number, cacheSize: number): ProcessResult {
  const existingIndex = cache.findIndex((slot) => slot.item === item);

  if (existingIndex !== -1) {
    const newCache = cache.slice();
    newCache[existingIndex] = { item, lastUsedStep: step };
    return { hit: true, needsEviction: false, newCache };
  }

  if (cache.length < cacheSize) {
    return { hit: false, needsEviction: false, newCache: [...cache, { item, lastUsedStep: step }] };
  }

  return { hit: false, needsEviction: true, newCache: cache };
}

export function evict(cache: CacheSlot[], itemToEvict: string): CacheSlot[] {
  return cache.filter((slot) => slot.item !== itemToEvict);
}

export function lruVictim(cache: CacheSlot[]): string {
  return cache.reduce((oldest, slot) => (slot.lastUsedStep < oldest.lastUsedStep ? slot : oldest), cache[0]).item;
}

export function randomVictim(cache: CacheSlot[]): string {
  return cache[Math.floor(Math.random() * cache.length)].item;
}

// Corre el MISMO stream (el que ya jugó el alumno) contra la política LRU
// pura y contra desalojo al azar, para una comparación directa uno a uno.
export function runFixedComparison(
  stream: string[],
  cacheSize: number
): { lruHits: number; randomHits: number; total: number } {
  let lruCache: CacheSlot[] = [];
  let lruHits = 0;
  let randomCache: CacheSlot[] = [];
  let randomHits = 0;

  stream.forEach((item, step) => {
    const lruResult = processRequest(lruCache, item, step, cacheSize);
    if (lruResult.hit) lruHits++;
    lruCache = lruResult.needsEviction
      ? processRequest(evict(lruCache, lruVictim(lruCache)), item, step, cacheSize).newCache
      : lruResult.newCache;

    const randomResult = processRequest(randomCache, item, step, cacheSize);
    if (randomResult.hit) randomHits++;
    randomCache = randomResult.needsEviction
      ? processRequest(evict(randomCache, randomVictim(randomCache)), item, step, cacheSize).newCache
      : randomResult.newCache;
  });

  return { lruHits, randomHits, total: stream.length };
}
