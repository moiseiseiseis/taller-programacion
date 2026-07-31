'use client';

import { useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import { findNashEquilibria, findBestJointOutcome, type GameConfig, type GameCell } from '@/lib/algorithmia/gameTheory';

export type GameTheorySimResult = {
  guess: { choiceA: 0 | 1; choiceB: 0 | 1 };
  guessedRight: boolean;
};

function cellKey(choiceA: 0 | 1, choiceB: 0 | 1) {
  return `${choiceA}-${choiceB}`;
}

export default function GameTheorySim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<GameConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: GameTheorySimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: GameTheorySimResult, reflectionResponse: string) => Promise<void>;
}) {
  const choiceLabels = config.choiceLabels ?? ['Opción A', 'Opción B'];
  const cells = config.cells ?? [];

  const [guess, setGuess] = useState<{ choiceA: 0 | 1; choiceB: 0 | 1 } | null>(
    initialSubmission?.simResult?.guess ?? null
  );
  const [revealed, setRevealed] = useState(!!initialSubmission);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const equilibria = revealed ? findNashEquilibria({ choiceLabels, cells }) : [];
  const equilibriaKeys = new Set(equilibria.map((c) => cellKey(c.choiceA, c.choiceB)));
  const bestJoint = revealed ? findBestJointOutcome({ choiceLabels, cells }) : null;

  function findCell(a: 0 | 1, b: 0 | 1): GameCell | undefined {
    return cells.find((c) => c.choiceA === a && c.choiceB === b);
  }

  async function handleReveal() {
    if (!guess) return;
    setRevealed(true);
  }

  async function handleSave() {
    if (!guess || !reflection.trim()) return;
    setIsSaving(true);
    try {
      const guessedRight = equilibriaKeys.has(cellKey(guess.choiceA, guess.choiceB));
      await onSave({ guess, guessedRight }, reflection);
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
          {!revealed
            ? 'Si dos personas solo piensan en su propio resultado, ¿en cuál combinación van a terminar? Elige una casilla.'
            : 'Así queda el tablero completo:'}
        </p>

        <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-sm">
          <div />
          <div className="text-center font-bold text-[#6f6f68] text-xs">{choiceLabels[0]} (B)</div>
          <div className="text-center font-bold text-[#6f6f68] text-xs">{choiceLabels[1]} (B)</div>

          {[0, 1].map((a) => (
            <div key={a} className="contents">
              <div className="flex items-center justify-end pr-2 font-bold text-[#6f6f68] text-xs">
                {choiceLabels[a]} (A)
              </div>
              {[0, 1].map((b) => {
                const cell = findCell(a as 0 | 1, b as 0 | 1);
                const key = cellKey(a as 0 | 1, b as 0 | 1);
                const isGuess = guess && guess.choiceA === a && guess.choiceB === b;
                const isEquilibrium = revealed && equilibriaKeys.has(key);
                const isBestJoint = revealed && bestJoint && bestJoint.choiceA === a && bestJoint.choiceB === b;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => !revealed && setGuess({ choiceA: a as 0 | 1, choiceB: b as 0 | 1 })}
                    disabled={revealed}
                    className={`p-4 rounded-xl border text-center transition-colors disabled:cursor-default ${
                      isEquilibrium
                        ? 'border-brand-mint bg-brand-mint/10'
                        : isGuess
                        ? 'border-brand-highlight bg-brand-highlight/10'
                        : 'border-brand-terminal-border bg-black/20 hover:border-brand-mint/40'
                    }`}
                  >
                    {revealed && cell ? (
                      <span className="text-brand-beige font-bold">
                        {cell.payoffA} / {cell.payoffB}
                      </span>
                    ) : (
                      <span className="text-[#6f6f68] text-xs">{isGuess ? 'Tu apuesta' : '?'}</span>
                    )}
                    {isBestJoint && <div className="text-[10px] text-brand-highlight mt-1">mejor resultado conjunto</div>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {!revealed ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReveal}
              disabled={!guess}
              className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
            >
              Revelar el tablero
            </button>
          </div>
        ) : (
          guess && (
            <p className={`text-center text-sm font-bold ${equilibriaKeys.has(cellKey(guess.choiceA, guess.choiceB)) ? 'text-brand-mint' : 'text-brand-salmon'}`}>
              {equilibriaKeys.has(cellKey(guess.choiceA, guess.choiceB))
                ? 'Tu apuesta era un equilibrio.'
                : 'Tu apuesta no era un equilibrio — la casilla marcada en verde sí lo es.'}
            </p>
          )
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
