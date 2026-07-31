'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  hillClimb,
  runLandscapeComparison,
  type LandscapeConfig,
} from '@/lib/algorithmia/randomness';

export type RandomnessSimResult = {
  chosenStart: number;
  landedAt: number;
  foundGlobalBest: boolean;
};

export default function RandomnessSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<LandscapeConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: RandomnessSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: RandomnessSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const landscape = useMemo(() => config.landscape ?? [], [config.landscape]);
  const maxSteps = config.maxSteps ?? 10;
  const trialsForComparison = config.trialsForComparison ?? 500;
  const initialTemperature = config.initialTemperature ?? 5;

  const [result, setResult] = useState<RandomnessSimResult | null>(initialSubmission?.simResult ?? null);
  const [showComparison, setShowComparison] = useState(!!initialSubmission);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const globalBest = Math.max(...landscape);
  const maxValue = globalBest;

  const comparison = useMemo(
    () =>
      showComparison
        ? runLandscapeComparison({ landscape, maxSteps, trialsForComparison, initialTemperature })
        : null,
    [showComparison, landscape, maxSteps, trialsForComparison, initialTemperature]
  );

  function pickStart(start: number) {
    if (result) return;
    const landedAt = hillClimb(landscape, start, maxSteps);
    setResult({ chosenStart: start, landedAt, foundGlobalBest: landscape[landedAt] === globalBest });
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
      <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
        <p className="text-sm text-brand-beige">
          {result ? 'Así se ve el terreno completo:' : 'Elige dónde empezar (cada barra es una opción distinta):'}
        </p>
        <div className="flex items-end gap-1 h-32">
          {landscape.map((value, i) => {
            const isStart = result?.chosenStart === i;
            const isLanded = result?.landedAt === i;
            const isGlobalBest = value === globalBest;
            return (
              <button
                key={i}
                type="button"
                onClick={() => pickStart(i)}
                disabled={!!result}
                className={`flex-1 rounded-t transition-all disabled:cursor-default ${
                  isLanded
                    ? result?.foundGlobalBest
                      ? 'bg-brand-mint'
                      : 'bg-brand-salmon'
                    : isStart
                    ? 'bg-brand-highlight'
                    : isGlobalBest && result
                    ? 'bg-brand-mint/30'
                    : 'bg-black/30 hover:bg-black/40'
                }`}
                style={{ height: `${(value / maxValue) * 100}%` }}
                title={`Opción ${i + 1}`}
              />
            );
          })}
        </div>
        {result && (
          <p className={`text-center text-sm font-bold ${result.foundGlobalBest ? 'text-brand-mint' : 'text-brand-salmon'}`}>
            {result.foundGlobalBest
              ? 'Llegaste al mejor punto de todo el terreno.'
              : 'Te quedaste atorado en un punto que parecía bueno, pero no era el mejor posible.'}
          </p>
        )}
      </div>

      {result && (
        <>
          {!showComparison ? (
            <button
              type="button"
              onClick={() => setShowComparison(true)}
              className="text-sm font-bold text-brand-mint hover:underline"
            >
              Ver qué pasa agregando algo de aleatoriedad →
            </button>
          ) : (
            comparison && (
              <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-3">
                <p className="text-sm font-bold text-brand-beige">
                  De cuántos arranques al azar cada estrategia llega al mejor punto de todos:
                </p>
                {(
                  [
                    ['Determinista (siempre sube, nunca baja)', comparison.deterministicRate, '#D5615B'],
                    ['Con algo de aleatoriedad a propósito', comparison.randomizedRate, '#9BCCB1'],
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
        </>
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
