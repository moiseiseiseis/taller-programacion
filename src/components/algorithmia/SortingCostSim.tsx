'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  costWithoutSorting,
  costWithSorting,
  findBreakEvenSearches,
  DEFAULT_SORTING_CONFIG,
  type SortingConfig,
} from '@/lib/algorithmia/sortingCost';

export type SortingSimResult = {
  itemCount: number;
  numSearches: number;
  costWithSorting: number;
  costWithoutSorting: number;
  breakEvenSearches: number | null;
};

export default function SortingCostSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<SortingConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: SortingSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: SortingSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<SortingConfig>(() => ({ ...DEFAULT_SORTING_CONFIG, ...config }), [config]);

  const [itemCount, setItemCount] = useState(fullConfig.defaultItemCount);
  const [numSearches, setNumSearches] = useState(Math.round(fullConfig.maxSearchesSlider / 3));
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const costSorted = costWithSorting(fullConfig, itemCount, numSearches);
  const costUnsorted = costWithoutSorting(fullConfig, itemCount, numSearches);
  const breakEven = useMemo(() => findBreakEvenSearches(fullConfig, itemCount), [fullConfig, itemCount]);
  const maxCost = Math.max(costSorted, costUnsorted, 1);
  const sortingWins = costSorted < costUnsorted;

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave(
        { itemCount, numSearches, costWithSorting: costSorted, costWithoutSorting: costUnsorted, breakEvenSearches: breakEven },
        reflection
      );
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-5">
        <div>
          <label className="flex items-center justify-between text-sm font-semibold text-brand-beige mb-1">
            <span>Tamaño de la colección</span>
            <span className="text-brand-mint">{itemCount} ítems</span>
          </label>
          <input
            type="range"
            min={10}
            max={2000}
            step={10}
            value={itemCount}
            onChange={(e) => setItemCount(Number(e.target.value))}
            className="w-full accent-brand-mint"
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-semibold text-brand-beige mb-1">
            <span>¿Cuántas veces vas a buscar en ella?</span>
            <span className="text-brand-mint">{numSearches}</span>
          </label>
          <input
            type="range"
            min={0}
            max={fullConfig.maxSearchesSlider}
            value={numSearches}
            onChange={(e) => setNumSearches(Number(e.target.value))}
            className="w-full accent-brand-mint"
          />
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <div className="flex items-center justify-between text-xs text-[#9c9c94] mb-1">
              <span>Ordenar primero, después buscar</span>
              <span className={`font-bold ${sortingWins ? 'text-brand-mint' : 'text-brand-beige'}`}>{Math.round(costSorted)}</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-mint transition-all"
                style={{ width: `${(costSorted / maxCost) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-[#9c9c94] mb-1">
              <span>Buscar sin ordenar, siempre</span>
              <span className={`font-bold ${!sortingWins ? 'text-brand-salmon' : 'text-brand-beige'}`}>{Math.round(costUnsorted)}</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-salmon transition-all"
                style={{ width: `${(costUnsorted / maxCost) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-sm text-[#9c9c94]">
          {sortingWins
            ? 'Con esta cantidad de búsquedas, ordenar primero sale más barato en total.'
            : 'Con esta cantidad de búsquedas, no vale la pena ordenar todavía.'}
          {breakEven != null && (
            <>
              {' '}
              El punto de equilibrio para {itemCount} ítems está en{' '}
              <span className="font-bold text-brand-beige">{breakEven} búsquedas</span>.
            </>
          )}
        </p>
      </div>

      {explanation && (
        <div className="text-sm text-[#9c9c94]">
          <MarkdownContent content={explanation} />
        </div>
      )}

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
    </div>
  );
}
