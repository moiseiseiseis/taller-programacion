'use client';

import { useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import { predictRemaining, type BayesConfig } from '@/lib/algorithmia/bayesPrediction';

export type BayesSimResult = {
  guesses: { scenarioId: string; guess: number; predicted: number }[];
};

export default function BayesSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<BayesConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: BayesSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: BayesSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const scenarios = config.scenarios ?? [];

  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [guesses, setGuesses] = useState<BayesSimResult['guesses']>(initialSubmission?.simResult?.guesses ?? []);
  const [finished, setFinished] = useState(!!initialSubmission);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const scenario = scenarios[index];

  function reveal() {
    if (!scenario || guess.trim() === '') return;
    setRevealed(true);
    setGuesses((prev) => [
      ...prev,
      { scenarioId: scenario.id, guess: Number(guess), predicted: predictRemaining(scenario) },
    ]);
  }

  function next() {
    if (index + 1 >= scenarios.length) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setGuess('');
    setRevealed(false);
  }

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ guesses }, reflection);
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {!finished && scenario ? (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6f6f68]">
            Escenario {index + 1} de {scenarios.length}
          </div>
          <p className="text-sm text-brand-beige">{scenario.description}</p>

          {!revealed ? (
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder={`¿Cuánto falta, en ${scenario.unit}?`}
                className="flex-1 rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
              />
              <button
                type="button"
                onClick={reveal}
                disabled={guess.trim() === ''}
                className="py-2.5 px-5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all whitespace-nowrap"
              >
                Ver la regla
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9c9c94]">Tu estimación: <span className="font-bold text-brand-beige">{guess} {scenario.unit}</span></span>
                <span className="text-[#9c9c94]">
                  Regla: <span className="font-bold text-brand-mint">{predictRemaining(scenario)} {scenario.unit}</span>
                </span>
              </div>
              <p className="text-xs text-[#6f6f68]">
                {scenario.distributionType === 'normal'
                  ? 'Este proceso tiene una duración típica esperable: la regla resta lo ya transcurrido del promedio.'
                  : 'Este proceso no tiene una escala natural: cuanto más duró hasta ahora, más se espera que dure — la regla dice que falta aproximadamente lo mismo que ya pasó.'}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={next}
                  className="py-2 px-5 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border"
                >
                  {index + 1 >= scenarios.length ? 'Terminar' : 'Siguiente escenario'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-2">
          <p className="text-sm font-bold text-brand-beige mb-2">Resumen de tus estimaciones:</p>
          {guesses.map((g) => {
            const s = scenarios.find((sc) => sc.id === g.scenarioId);
            return (
              <div key={g.scenarioId} className="flex items-center justify-between text-sm text-[#9c9c94]">
                <span>{s?.description.slice(0, 50)}...</span>
                <span>
                  tu estimación: <span className="font-bold text-brand-beige">{g.guess}</span> · regla:{' '}
                  <span className="font-bold text-brand-mint">{g.predicted}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {explanation && finished && (
        <div className="text-sm text-[#9c9c94]">
          <MarkdownContent content={explanation} />
        </div>
      )}

      {finished && (
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
