'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  generateRequestStream,
  processRequest,
  evict,
  runFixedComparison,
  DEFAULT_CACHE_CONFIG,
  type CacheConfig,
  type CacheSlot,
} from '@/lib/algorithmia/cacheLru';

export type CacheSimResult = {
  hits: number;
  total: number;
  cacheSize: number;
};

export default function CacheLruSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<CacheConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: CacheSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: CacheSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<CacheConfig>(() => ({ ...DEFAULT_CACHE_CONFIG, ...config }), [config]);

  const [stream] = useState(() => generateRequestStream(fullConfig));
  const [cache, setCache] = useState<CacheSlot[]>([]);
  const [step, setStep] = useState(0);
  const [hits, setHits] = useState(0);
  const [pendingEviction, setPendingEviction] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<'hit' | 'miss' | null>(null);
  const [result, setResult] = useState<CacheSimResult | null>(initialSubmission?.simResult ?? null);
  const [showComparison, setShowComparison] = useState(!!initialSubmission);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const comparison = useMemo(
    () => (showComparison ? runFixedComparison(stream, fullConfig.cacheSize) : null),
    [showComparison, stream, fullConfig.cacheSize]
  );

  function requestNext() {
    if (step >= stream.length) return;
    const item = stream[step];
    const outcome = processRequest(cache, item, step, fullConfig.cacheSize);

    if (outcome.needsEviction) {
      setPendingEviction(true);
      return;
    }

    applyOutcome(outcome.hit, outcome.newCache);
  }

  function applyOutcome(hit: boolean, newCache: CacheSlot[]) {
    setCache(newCache);
    setLastOutcome(hit ? 'hit' : 'miss');
    if (hit) setHits((h) => h + 1);

    const nextStep = step + 1;
    setStep(nextStep);
    setPendingEviction(false);

    if (nextStep >= stream.length) {
      setResult({ hits: hit ? hits + 1 : hits, total: stream.length, cacheSize: fullConfig.cacheSize });
    }
  }

  function evictAndPlace(itemToEvict: string) {
    const item = stream[step];
    const afterEviction = evict(cache, itemToEvict);
    const outcome = processRequest(afterEviction, item, step, fullConfig.cacheSize);
    applyOutcome(outcome.hit, outcome.newCache);
  }

  async function handleSave() {
    if (!result || !reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave(result, reflection);
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {!result ? (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#6f6f68]">
            <span>Pedido {Math.min(step + 1, stream.length)} de {stream.length}</span>
            <span>Aciertos: {hits}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: fullConfig.cacheSize }).map((_, i) => {
              const slot = cache[i];
              return (
                <div
                  key={i}
                  className="w-16 h-16 rounded-xl border border-brand-terminal-border bg-black/20 flex items-center justify-center text-xl font-black text-brand-beige"
                >
                  {slot ? slot.item : <span className="text-[#4a4a44] text-sm">vacío</span>}
                </div>
              );
            })}
          </div>

          {!pendingEviction ? (
            <>
              {step < stream.length && (
                <div className="text-center py-4">
                  <p className="text-sm text-[#9c9c94] mb-3">
                    Piden el ítem <span className="font-black text-brand-beige text-xl">{stream[step]}</span>
                  </p>
                  <button
                    type="button"
                    onClick={requestNext}
                    className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
                  >
                    Atender pedido
                  </button>
                </div>
              )}
              {lastOutcome && (
                <p className={`text-center text-sm font-bold ${lastOutcome === 'hit' ? 'text-brand-mint' : 'text-[#6f6f68]'}`}>
                  {lastOutcome === 'hit' ? 'Ya estaba en la caché — acierto.' : 'No estaba en la caché.'}
                </p>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-brand-beige text-center">
                La caché está llena. ¿Qué ítem se saca para hacerle lugar a {stream[step]}?
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {cache.map((slot) => (
                  <button
                    key={slot.item}
                    type="button"
                    onClick={() => evictAndPlace(slot.item)}
                    className="px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20 hover:border-brand-salmon/50 hover:bg-black/30 transition-colors text-center"
                  >
                    <div className="font-black text-brand-beige">{slot.item}</div>
                    <div className="text-xs text-[#6f6f68]">usado hace {step - slot.lastUsedStep} {step - slot.lastUsedStep === 1 ? 'pedido' : 'pedidos'}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          <p className="text-lg font-bold text-brand-beige">
            Terminaste con {result.hits} de {result.total} pedidos acertados.
          </p>

          {!showComparison ? (
            <button
              type="button"
              onClick={() => setShowComparison(true)}
              className="text-sm font-bold text-brand-mint hover:underline"
            >
              Ver la comparación contra LRU puro y azar puro →
            </button>
          ) : (
            comparison && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-bold text-brand-beige">
                  Aciertos sobre el mismo flujo de pedidos que jugaste:
                </p>
                {(
                  [
                    ['Tu jugada', result.hits / result.total, '#C2D3E4'],
                    ['LRU puro (siempre saca lo menos usado)', comparison.lruHits / comparison.total, '#9BCCB1'],
                    ['Al azar (saca cualquiera)', comparison.randomHits / comparison.total, '#D5615B'],
                  ] as [string, number, string][]
                ).map(([label, rate, color]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs text-[#9c9c94] mb-1 gap-4">
                      <span>{label}</span>
                      <span className="font-bold text-brand-beige whitespace-nowrap">{Math.round(rate * 100)}%</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${rate * 100}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {explanation && result && showComparison && (
        <div className="text-sm text-[#9c9c94]">
          <MarkdownContent content={explanation} />
        </div>
      )}

      {result && showComparison && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-brand-beige">{reflectionPrompt}</label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={4}
            placeholder="Escribe tu respuesta..."
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
          />
          <div className="flex justify-end items-center gap-3">
            {saved && <span className="text-xs text-brand-mint">Guardado</span>}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !reflection.trim()}
              className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {isSaving ? 'Guardando...' : saved ? 'Actualizar respuesta' : 'Guardar respuesta'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
