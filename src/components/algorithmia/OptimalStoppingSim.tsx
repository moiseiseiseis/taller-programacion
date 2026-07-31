'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  generateSequence,
  runMonteCarloComparison,
  DEFAULT_STOPPING_CONFIG,
  type StoppingConfig,
} from '@/lib/algorithmia/optimalStopping';

export type StoppingSimResult = {
  stoppedAtIndex: number;
  sequenceLength: number;
  won: boolean;
};

export default function OptimalStoppingSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<StoppingConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: StoppingSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: StoppingSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<StoppingConfig>(() => ({ ...DEFAULT_STOPPING_CONFIG, ...config }), [config]);

  const [sequence] = useState(() => generateSequence(fullConfig.sequenceLength));
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<StoppingSimResult | null>(initialSubmission?.simResult ?? null);
  const [showComparison, setShowComparison] = useState(!!initialSubmission);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const comparison = useMemo(
    () => (showComparison ? runMonteCarloComparison(fullConfig) : null),
    [showComparison, fullConfig]
  );

  const bestSoFar = index > 0 ? Math.min(...sequence.slice(0, index)) : Infinity;
  const currentCandidate = sequence[index];
  const isBetterThanAllBefore = currentCandidate < bestSoFar;

  function stopHere() {
    setResult({ stoppedAtIndex: index, sequenceLength: fullConfig.sequenceLength, won: currentCandidate === 1 });
  }

  function keepLooking() {
    if (index === sequence.length - 1) {
      stopHere();
      return;
    }
    setIndex(index + 1);
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
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6f6f68]">
            Candidato {index + 1} de {fullConfig.sequenceLength}
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-[#9c9c94] mb-2">¿Este candidato es mejor que todos los anteriores?</p>
            <p className={`text-2xl font-black ${isBetterThanAllBefore ? 'text-brand-mint' : 'text-[#6f6f68]'}`}>
              {isBetterThanAllBefore ? 'Sí, es el mejor hasta ahora' : 'No, ya viste uno mejor'}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={stopHere}
              className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
            >
              Detenerme aquí
            </button>
            <button
              type="button"
              onClick={keepLooking}
              className="py-2.5 px-6 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border"
            >
              Seguir viendo
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          <p className={`text-lg font-bold ${result.won ? 'text-brand-mint' : 'text-brand-salmon'}`}>
            {result.won ? '¡Elegiste al mejor candidato de toda la secuencia!' : 'Ese no era el mejor candidato de la secuencia.'}
          </p>
          <p className="text-sm text-[#9c9c94]">
            Te detuviste en el candidato {result.stoppedAtIndex + 1} de {result.sequenceLength}.
          </p>

          {!showComparison ? (
            <button
              type="button"
              onClick={() => setShowComparison(true)}
              className="text-sm font-bold text-brand-mint hover:underline"
            >
              Ver la comparación contra otras estrategias →
            </button>
          ) : (
            comparison && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-bold text-brand-beige">
                  Tasa de éxito de cada estrategia en {fullConfig.trialsForComparison} secuencias simuladas:
                </p>
                {(
                  [
                    ['Detenerse muy pronto', comparison.early, '#D5615B'],
                    ['Regla del 37%', comparison.optimal, '#9BCCB1'],
                    ['Detenerse muy tarde', comparison.late, '#9DB6D3'],
                  ] as [string, number, string][]
                ).map(([label, rate, color]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs text-[#9c9c94] mb-1">
                      <span>{label}</span>
                      <span className="font-bold text-brand-beige">{Math.round(rate * 100)}%</span>
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
