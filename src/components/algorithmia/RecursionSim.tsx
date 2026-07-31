'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  generateDescentChain,
  computeUnwindValues,
  DEFAULT_RECURSION_CONFIG,
  type RecursionConfig,
} from '@/lib/algorithmia/recursion';

export type RecursionSimResult = {
  descentSteps: number;
  identifiedBaseCaseCorrectly: boolean;
  unwindGuesses: { n: number; guess: number; actual: number; correct: boolean }[];
};

type Phase = 'descending' | 'baseCheck' | 'unwinding' | 'done';

export default function RecursionSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<RecursionConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: RecursionSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: RecursionSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<RecursionConfig>(() => ({ ...DEFAULT_RECURSION_CONFIG, ...config }), [config]);
  const descentChain = useMemo(() => generateDescentChain(fullConfig), [fullConfig]);
  const unwindValues = useMemo(() => computeUnwindValues(fullConfig), [fullConfig]);

  const [phase, setPhase] = useState<Phase>(initialSubmission ? 'done' : 'descending');
  const [currentN, setCurrentN] = useState(fullConfig.startN);
  const [descentSteps, setDescentSteps] = useState(initialSubmission?.simResult?.descentSteps ?? 0);
  const [identifiedBaseCaseCorrectly, setIdentifiedBaseCaseCorrectly] = useState(
    initialSubmission?.simResult?.identifiedBaseCaseCorrectly ?? false
  );
  const [unwindGuesses, setUnwindGuesses] = useState<RecursionSimResult['unwindGuesses']>(
    initialSubmission?.simResult?.unwindGuesses ?? []
  );
  const [unwindN, setUnwindN] = useState(fullConfig.baseCaseN + 1);
  const [guess, setGuess] = useState('');
  const [lastGuessRevealed, setLastGuessRevealed] = useState<{ guess: number; actual: number } | null>(null);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  function callWithNMinus1() {
    setDescentSteps((prev) => prev + 1);
    if (currentN - 1 === fullConfig.baseCaseN) {
      setCurrentN(currentN - 1);
      setPhase('baseCheck');
    } else {
      setCurrentN(currentN - 1);
    }
  }

  function answerBaseCheck(stopsHere: boolean) {
    setIdentifiedBaseCaseCorrectly(stopsHere);
    setPhase('unwinding');
  }

  function submitUnwindGuess() {
    if (guess.trim() === '') return;
    const numGuess = Number(guess);
    const actual = unwindValues[unwindN];
    setLastGuessRevealed({ guess: numGuess, actual });
    setUnwindGuesses((prev) => [
      ...prev,
      { n: unwindN, guess: numGuess, actual, correct: numGuess === actual },
    ]);
  }

  function nextUnwindStep() {
    setLastGuessRevealed(null);
    setGuess('');
    if (unwindN + 1 > fullConfig.startN) {
      setPhase('done');
    } else {
      setUnwindN(unwindN + 1);
    }
  }

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ descentSteps, identifiedBaseCaseCorrectly, unwindGuesses }, reflection);
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  const correctCount = unwindGuesses.filter((g) => g.correct).length;

  return (
    <div className="space-y-6">
      {phase === 'descending' && (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          <p className="text-sm text-brand-beige">
            factorial(<span className="font-bold text-brand-mint">{currentN}</span>) todavía no sabe su
            respuesta — para saberla, necesita el resultado de una versión más pequeña del mismo problema.
          </p>
          <div className="flex justify-center gap-1 flex-wrap">
            {descentChain.map((n) => (
              <span
                key={n}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono ${
                  n === currentN
                    ? 'bg-brand-mint/20 border border-brand-mint text-brand-mint font-bold'
                    : n > currentN
                    ? 'bg-black/20 border border-brand-terminal-border text-[#6f6f68]'
                    : 'bg-black/10 border border-dashed border-brand-terminal-border text-[#6f6f68]'
                }`}
              >
                factorial({n})
              </span>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={callWithNMinus1}
              className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
            >
              Llamar con n-1 (factorial({currentN - 1}))
            </button>
          </div>
        </div>
      )}

      {phase === 'baseCheck' && (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          <p className="text-sm text-brand-beige">
            Llegaste a factorial(<span className="font-bold text-brand-mint">{currentN}</span>). ¿Se puede
            seguir llamando con n-1, o hay que detenerse aquí?
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => answerBaseCheck(false)}
              className="py-2.5 px-5 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border"
            >
              Seguir llamando con n-1
            </button>
            <button
              type="button"
              onClick={() => answerBaseCheck(true)}
              className="py-2.5 px-5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
            >
              Detenerse: este es el caso base
            </button>
          </div>
        </div>
      )}

      {phase === 'unwinding' && (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          {!identifiedBaseCaseCorrectly && (
            <p className="text-xs text-brand-salmon">
              factorial({fullConfig.baseCaseN}) sí es el caso base — sin él, las llamadas nunca dejarían de
              descender. Ahora toca deshacer el camino hacia arriba.
            </p>
          )}
          <p className="text-sm text-brand-beige">
            Caso base: factorial({fullConfig.baseCaseN}) = <span className="font-bold text-brand-mint">{fullConfig.baseCaseValue}</span>.
            Ahora cada llamada, de vuelta hacia arriba, usa el resultado de la llamada anterior.
          </p>
          <p className="text-sm text-brand-beige">
            Si factorial({unwindN - 1}) = <span className="font-bold text-brand-mint">{unwindValues[unwindN - 1]}</span>,
            ¿cuánto vale factorial({unwindN}) = {unwindN} × factorial({unwindN - 1})?
          </p>

          {!lastGuessRevealed ? (
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Tu respuesta"
                className="flex-1 rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
              />
              <button
                type="button"
                onClick={submitUnwindGuess}
                disabled={guess.trim() === ''}
                className="py-2.5 px-5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all whitespace-nowrap"
              >
                Revelar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className={`text-sm font-bold ${lastGuessRevealed.guess === lastGuessRevealed.actual ? 'text-brand-mint' : 'text-brand-salmon'}`}>
                factorial({unwindN}) = {lastGuessRevealed.actual}
                {lastGuessRevealed.guess === lastGuessRevealed.actual ? ' — correcto.' : ` (tu respuesta: ${lastGuessRevealed.guess})`}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextUnwindStep}
                  className="py-2 px-5 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border"
                >
                  {unwindN + 1 > fullConfig.startN ? 'Terminar' : 'Siguiente'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-2">
          <p className="text-sm font-bold text-brand-beige mb-2">
            Árbol de llamadas completo (respondiste bien {correctCount} de {unwindGuesses.length}):
          </p>
          {descentChain
            .slice()
            .reverse()
            .map((n) => (
              <div key={n} className="flex items-center justify-between text-sm text-[#9c9c94] font-mono">
                <span>factorial({n})</span>
                <span className="font-bold text-brand-mint">{unwindValues[n]}</span>
              </div>
            ))}
        </div>
      )}

      {explanation && phase === 'done' && (
        <div className="text-sm text-[#9c9c94]">
          <MarkdownContent content={explanation} />
        </div>
      )}

      {phase === 'done' && (
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
