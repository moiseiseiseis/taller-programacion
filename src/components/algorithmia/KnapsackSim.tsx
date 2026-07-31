'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  bruteForceCombinationsCount,
  knapsackDP,
  DEFAULT_KNAPSACK_CONFIG,
  type KnapsackConfig,
} from '@/lib/algorithmia/knapsack';

export type KnapsackSimResult = {
  chosenIds: string[];
  chosenValue: number;
  chosenWeight: number;
  optimalValue: number;
};

export default function KnapsackSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<KnapsackConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: KnapsackSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: KnapsackSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<KnapsackConfig>(() => ({ ...DEFAULT_KNAPSACK_CONFIG, ...config }), [config]);
  const dpResult = useMemo(() => knapsackDP(fullConfig), [fullConfig]);
  const combinationsCount = bruteForceCombinationsCount(fullConfig.items.length);

  const [chosenIds, setChosenIds] = useState<string[]>(initialSubmission?.simResult?.chosenIds ?? []);
  const [revealed, setRevealed] = useState(!!initialSubmission);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const chosenWeight = fullConfig.items
    .filter((item) => chosenIds.includes(item.id))
    .reduce((sum, item) => sum + item.weight, 0);
  const chosenValue = fullConfig.items
    .filter((item) => chosenIds.includes(item.id))
    .reduce((sum, item) => sum + item.value, 0);
  const overCapacity = chosenWeight > fullConfig.capacity;

  function toggleItem(id: string) {
    setChosenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ chosenIds, chosenValue, chosenWeight, optimalValue: dpResult.bestValue }, reflection);
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-beige font-bold">
            Capacidad: {chosenWeight} / {fullConfig.capacity}
          </span>
          <span className={`font-bold ${overCapacity ? 'text-brand-salmon' : 'text-brand-mint'}`}>
            Valor acumulado: {chosenValue}
          </span>
        </div>

        <div className="space-y-2">
          {fullConfig.items.map((item) => (
            <label
              key={item.id}
              className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                chosenIds.includes(item.id)
                  ? 'border-brand-mint bg-brand-mint/10'
                  : 'border-brand-terminal-border bg-black/20 hover:border-brand-mint/40'
              } ${revealed ? 'pointer-events-none opacity-80' : ''}`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={chosenIds.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                  disabled={revealed}
                  className="accent-brand-mint"
                />
                <span className="text-sm text-brand-beige">{item.label}</span>
              </span>
              <span className="text-xs text-[#9c9c94]">
                costo {item.weight} · valor {item.value}
              </span>
            </label>
          ))}
        </div>

        {overCapacity && !revealed && (
          <p className="text-xs text-brand-salmon">Te pasaste de la capacidad disponible.</p>
        )}

        {!revealed ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              disabled={overCapacity || chosenIds.length === 0}
              className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
            >
              Confirmar mi selección
            </button>
          </div>
        ) : (
          <div className="space-y-3 border-t border-brand-terminal-border pt-4">
            <p className="text-sm text-brand-beige">
              Tu selección: valor <span className="font-bold text-brand-mint">{chosenValue}</span>
            </p>
            <p className="text-sm text-brand-beige">
              Mejor combinación posible: valor{' '}
              <span className="font-bold text-brand-mint">{dpResult.bestValue}</span> (
              {dpResult.chosenIds.map((id) => fullConfig.items.find((it) => it.id === id)?.label).join(', ')})
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-[#9c9c94]">
                <span>Combinaciones que revisa la fuerza bruta</span>
                <span className="font-bold text-brand-salmon">{combinationsCount}</span>
              </div>
              <div className="flex justify-between text-xs text-[#9c9c94]">
                <span>Subproblemas que calcula la programación dinámica (una sola vez cada uno)</span>
                <span className="font-bold text-brand-mint">{dpResult.cellsComputed}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {explanation && revealed && (
        <div className="text-sm text-[#9c9c94]">
          <MarkdownContent content={explanation} />
        </div>
      )}

      {revealed && (
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
