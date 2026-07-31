'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import { nearestNeighbors, majorityCategory, DEFAULT_KNN_CONFIG, type KnnConfig } from '@/lib/algorithmia/knn';

export type KnnSimResult = {
  guessCategory: string;
  predictedCategory: string;
  correct: boolean;
};

export default function KnnSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<KnnConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: KnnSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: KnnSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<KnnConfig>(() => ({ ...DEFAULT_KNN_CONFIG, ...config }), [config]);
  const categories = useMemo(
    () => Array.from(new Set(fullConfig.points.map((p) => p.category))),
    [fullConfig]
  );
  const neighbors = useMemo(
    () => nearestNeighbors(fullConfig.points, fullConfig.newCaseFeature, fullConfig.k),
    [fullConfig]
  );
  const neighborIds = new Set(neighbors.map((n) => n.id));
  const prediction = useMemo(() => majorityCategory(neighbors), [neighbors]);

  const [guess, setGuess] = useState(initialSubmission?.simResult?.guessCategory ?? '');
  const [revealed, setRevealed] = useState(!!initialSubmission);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ guessCategory: guess, predictedCategory: prediction, correct: guess === prediction }, reflection);
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
          {fullConfig.newCaseLabel}: {fullConfig.featureName} = <span className="font-bold text-brand-mint">{fullConfig.newCaseFeature}</span>.
          Según los {fullConfig.k} vecinos más parecidos, ¿en qué categoría cae?
        </p>

        {!revealed ? (
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setGuess(cat)}
                className={`py-2 px-4 rounded-lg text-sm font-bold transition-colors border ${
                  guess === cat
                    ? 'border-brand-mint bg-brand-mint/10 text-brand-mint'
                    : 'border-brand-terminal-border bg-black/20 text-brand-beige hover:border-brand-mint/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}

        {!revealed ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              disabled={!guess}
              className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
            >
              Ver los vecinos más cercanos
            </button>
          </div>
        ) : (
          <div className="space-y-3 border-t border-brand-terminal-border pt-4">
            <div className="space-y-1.5">
              {[...fullConfig.points]
                .sort((a, b) => Math.abs(a.feature - fullConfig.newCaseFeature) - Math.abs(b.feature - fullConfig.newCaseFeature))
                .map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg ${
                      neighborIds.has(p.id) ? 'bg-brand-mint/10 border border-brand-mint' : 'bg-black/10 text-[#6f6f68]'
                    }`}
                  >
                    <span className={neighborIds.has(p.id) ? 'text-brand-beige font-bold' : ''}>
                      {p.label} · {fullConfig.featureName}: {p.feature}
                    </span>
                    <span className={neighborIds.has(p.id) ? 'text-brand-mint font-bold' : ''}>{p.category}</span>
                  </div>
                ))}
            </div>
            <p className={`text-sm font-bold ${guess === prediction ? 'text-brand-mint' : 'text-brand-salmon'}`}>
              Predicción por k-NN: {prediction}
              {guess === prediction ? ' — coincide con tu respuesta.' : ` (tu respuesta fue: ${guess})`}
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
