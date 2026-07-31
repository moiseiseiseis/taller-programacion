'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  selectionSortComparisons,
  quicksortAverageComparisons,
  DEFAULT_SORTING_ALGORITHMS_CONFIG,
  type SortingAlgorithmsConfig,
} from '@/lib/algorithmia/sortingAlgorithms';

export type SortingAlgorithmsSimResult = {
  comparisonsMade: number;
  wrongPicks: number;
};

export default function SortingAlgorithmsSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<SortingAlgorithmsConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: SortingAlgorithmsSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: SortingAlgorithmsSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<SortingAlgorithmsConfig>(
    () => ({ ...DEFAULT_SORTING_ALGORITHMS_CONFIG, ...config }),
    [config]
  );
  const n = fullConfig.list.length;

  const [remainingIndices, setRemainingIndices] = useState<number[]>(
    Array.from({ length: n }, (_, i) => i)
  );
  const [sorted, setSorted] = useState<number[]>([]);
  const [comparisonsMade, setComparisonsMade] = useState(initialSubmission?.simResult?.comparisonsMade ?? 0);
  const [wrongPicks, setWrongPicks] = useState(initialSubmission?.simResult?.wrongPicks ?? 0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(!!initialSubmission || remainingIndices.length === 0);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  function pick(idx: number) {
    const remainingValues = remainingIndices.map((i) => fullConfig.list[i]);
    const minValue = Math.min(...remainingValues);
    if (fullConfig.list[idx] !== minValue) {
      setWrongPicks((prev) => prev + 1);
      setFeedback('Ese no es el menor de los que quedan — revisa de nuevo.');
      return;
    }
    setFeedback(null);
    setComparisonsMade((prev) => prev + (remainingIndices.length - 1));
    setSorted((prev) => [...prev, fullConfig.list[idx]]);
    const nextRemaining = remainingIndices.filter((i) => i !== idx);
    setRemainingIndices(nextRemaining);
    if (nextRemaining.length === 0) setDone(true);
  }

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ comparisonsMade, wrongPicks }, reflection);
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  const selectionTotal = selectionSortComparisons(n);
  const quicksortAvg = quicksortAverageComparisons(n);
  const maxComparisons = Math.max(selectionTotal, quicksortAvg);

  return (
    <div className="space-y-6">
      <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
        <div>
          <p className="text-xs text-[#6f6f68] mb-1">Ordenados:</p>
          <div className="flex gap-1.5 flex-wrap min-h-[2.25rem]">
            {sorted.map((v, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-mono bg-brand-mint/20 border border-brand-mint text-brand-mint font-bold">
                {v}
              </span>
            ))}
          </div>
        </div>

        {!done && (
          <div>
            <p className="text-xs text-[#6f6f68] mb-1">Elige el menor de los que quedan:</p>
            <div className="flex gap-1.5 flex-wrap">
              {remainingIndices.map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => pick(idx)}
                  className="px-3 py-1.5 rounded-lg text-sm font-mono bg-black/20 border border-brand-terminal-border text-brand-beige hover:border-brand-mint/40 transition-colors"
                >
                  {fullConfig.list[idx]}
                </button>
              ))}
            </div>
            {feedback && <p className="text-xs text-brand-salmon mt-2">{feedback}</p>}
          </div>
        )}

        {done && (
          <div className="space-y-3 border-t border-brand-terminal-border pt-4">
            <p className="text-sm text-brand-beige">
              Comparaciones que hiciste: <span className="font-bold text-brand-mint">{comparisonsMade}</span>
              {wrongPicks > 0 && <span className="text-[#6f6f68]"> ({wrongPicks} intentos fallidos)</span>}
            </p>
            <div className="space-y-2 pt-2">
              <div>
                <div className="flex justify-between text-xs text-[#9c9c94] mb-1">
                  <span>Selection sort (fórmula exacta)</span>
                  <span className="font-bold text-brand-mint">{selectionTotal}</span>
                </div>
                <div className="h-3 rounded-full bg-black/30 overflow-hidden">
                  <div className="h-full bg-brand-mint" style={{ width: `${(selectionTotal / maxComparisons) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-[#9c9c94] mb-1">
                  <span>Quicksort (promedio estimado)</span>
                  <span className="font-bold text-brand-highlight">{quicksortAvg}</span>
                </div>
                <div className="h-3 rounded-full bg-black/30 overflow-hidden">
                  <div className="h-full bg-brand-highlight" style={{ width: `${(quicksortAvg / maxComparisons) * 100}%` }} />
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
