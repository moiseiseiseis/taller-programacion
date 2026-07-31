'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  simpleHash,
  averageLinearScanSteps,
  DEFAULT_HASH_TABLE_CONFIG,
  type HashTableConfig,
} from '@/lib/algorithmia/hashTable';

export type HashTableSimResult = {
  correctPlacements: number;
  wrongPlacements: number;
};

export default function HashTableSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<HashTableConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: HashTableSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: HashTableSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<HashTableConfig>(() => ({ ...DEFAULT_HASH_TABLE_CONFIG, ...config }), [config]);
  const n = fullConfig.items.length;

  const [queue, setQueue] = useState(fullConfig.items.map((i) => i.id));
  const [buckets, setBuckets] = useState<Record<number, string[]>>(
    Object.fromEntries(Array.from({ length: fullConfig.bucketCount }, (_, i) => [i, []]))
  );
  const [correctPlacements, setCorrectPlacements] = useState(
    initialSubmission?.simResult?.correctPlacements ?? 0
  );
  const [wrongPlacements, setWrongPlacements] = useState(initialSubmission?.simResult?.wrongPlacements ?? 0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(!!initialSubmission || queue.length === 0);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const currentItem = fullConfig.items.find((i) => i.id === queue[0]);

  function place(bucketIndex: number) {
    if (!currentItem) return;
    const correctIndex = simpleHash(currentItem.key, fullConfig.bucketCount);
    if (bucketIndex !== correctIndex) {
      setWrongPlacements((prev) => prev + 1);
      setFeedback('Esa no es la casilla que da la función de hash para esta clave — vuelve a calcular.');
      return;
    }
    setFeedback(null);
    setCorrectPlacements((prev) => prev + 1);
    setBuckets((prev) => ({ ...prev, [bucketIndex]: [...prev[bucketIndex], currentItem.key] }));
    const nextQueue = queue.slice(1);
    setQueue(nextQueue);
    if (nextQueue.length === 0) setDone(true);
  }

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ correctPlacements, wrongPlacements }, reflection);
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  const hashSteps = 1;
  const linearSteps = averageLinearScanSteps(n);
  const maxSteps = Math.max(hashSteps, linearSteps);

  return (
    <div className="space-y-6">
      <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
          {Array.from({ length: fullConfig.bucketCount }, (_, i) => (
            <div key={i} className="border border-brand-terminal-border rounded-lg p-2 bg-black/10 min-h-[4rem]">
              <p className="text-[10px] text-[#6f6f68] mb-1">Casilla {i}</p>
              <div className="space-y-1">
                {buckets[i].map((key) => (
                  <span key={key} className="block text-xs font-mono text-brand-mint">
                    {key}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!done && currentItem && (
          <div className="space-y-2">
            <p className="text-sm text-brand-beige">
              ¿En qué casilla cae la clave <span className="font-bold text-brand-mint">&ldquo;{currentItem.key}&rdquo;</span>?
            </p>
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: fullConfig.bucketCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => place(i)}
                  className="py-2 px-4 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border"
                >
                  Casilla {i}
                </button>
              ))}
            </div>
            {feedback && <p className="text-xs text-brand-salmon">{feedback}</p>}
          </div>
        )}

        {done && (
          <div className="space-y-3 border-t border-brand-terminal-border pt-4">
            <p className="text-sm text-brand-beige">
              Colocaste {correctPlacements} de {n} claves correctamente
              {wrongPlacements > 0 && <span className="text-[#6f6f68]"> ({wrongPlacements} intentos fallidos)</span>}
            </p>
            <div className="space-y-2 pt-2">
              <div>
                <div className="flex justify-between text-xs text-[#9c9c94] mb-1">
                  <span>Buscar en la hash table (ir directo a la casilla)</span>
                  <span className="font-bold text-brand-mint">{hashSteps} paso</span>
                </div>
                <div className="h-3 rounded-full bg-black/30 overflow-hidden">
                  <div className="h-full bg-brand-mint" style={{ width: `${(hashSteps / maxSteps) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-[#9c9c94] mb-1">
                  <span>Buscar en una lista sin indexar (revisar una por una, en promedio)</span>
                  <span className="font-bold text-brand-salmon">{linearSteps} pasos</span>
                </div>
                <div className="h-3 rounded-full bg-black/30 overflow-hidden">
                  <div className="h-full bg-brand-salmon" style={{ width: `${(linearSteps / maxSteps) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {explanation && done && (
        <div className="text-sm text-[#9c9c94]">
          <MarkdownContent content={explanation} />
        </div>
      )}

      {done && (
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
