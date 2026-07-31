'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  activitiesOverlap,
  maxNonOverlapping,
  DEFAULT_GREEDY_ACTIVITY_CONFIG,
  type GreedyActivityConfig,
} from '@/lib/algorithmia/greedyScheduling';

export type GreedySchedulingSimResult = {
  chosenIds: string[];
  optimalCount: number;
};

function formatHour(h: number): string {
  const hour = Math.floor(h);
  const minutes = Math.round((h - hour) * 60);
  return `${hour}:${minutes === 0 ? '00' : minutes}`;
}

export default function GreedySchedulingSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<GreedyActivityConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: GreedySchedulingSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: GreedySchedulingSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<GreedyActivityConfig>(
    () => ({ ...DEFAULT_GREEDY_ACTIVITY_CONFIG, ...config }),
    [config]
  );
  const optimal = useMemo(() => maxNonOverlapping(fullConfig.activities), [fullConfig]);

  const [chosenIds, setChosenIds] = useState<string[]>(initialSubmission?.simResult?.chosenIds ?? []);
  const [revealed, setRevealed] = useState(!!initialSubmission);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const chosenActivities = fullConfig.activities.filter((a) => chosenIds.includes(a.id));

  function toggle(id: string) {
    if (chosenIds.includes(id)) {
      setChosenIds((prev) => prev.filter((x) => x !== id));
      return;
    }
    const activity = fullConfig.activities.find((a) => a.id === id)!;
    const conflicts = chosenActivities.some((a) => activitiesOverlap(a, activity));
    if (conflicts) return;
    setChosenIds((prev) => [...prev, id]);
  }

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ chosenIds, optimalCount: optimal.length }, reflection);
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
        <p className="text-sm text-brand-beige">
          Elige la mayor cantidad posible de actividades que no se traslapen en el tiempo. Elegiste{' '}
          <span className="font-bold text-brand-mint">{chosenIds.length}</span>.
        </p>

        <div className="space-y-2">
          {fullConfig.activities.map((activity) => {
            const isChosen = chosenIds.includes(activity.id);
            const wouldConflict = !isChosen && chosenActivities.some((a) => activitiesOverlap(a, activity));
            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => toggle(activity.id)}
                disabled={revealed || (wouldConflict && !isChosen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border text-left transition-colors disabled:cursor-not-allowed ${
                  isChosen
                    ? 'border-brand-mint bg-brand-mint/10'
                    : wouldConflict
                    ? 'border-brand-terminal-border bg-black/10 opacity-40'
                    : 'border-brand-terminal-border bg-black/20 hover:border-brand-mint/40'
                }`}
              >
                <span className="text-sm text-brand-beige">{activity.label}</span>
                <span className="text-xs text-[#9c9c94]">
                  {formatHour(activity.start)}–{formatHour(activity.end)}
                </span>
              </button>
            );
          })}
        </div>

        {!revealed ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              disabled={chosenIds.length === 0}
              className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
            >
              Confirmar mi selección
            </button>
          </div>
        ) : (
          <div className="space-y-2 border-t border-brand-terminal-border pt-4">
            <p className="text-sm text-brand-beige">
              Tu selección: <span className="font-bold text-brand-mint">{chosenIds.length}</span> actividades
            </p>
            <p className="text-sm text-brand-beige">
              Máximo posible: <span className="font-bold text-brand-mint">{optimal.length}</span> actividades (
              {optimal.map((a) => a.label).join(', ')})
            </p>
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
