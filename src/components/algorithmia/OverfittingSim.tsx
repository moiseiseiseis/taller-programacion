'use client';

import { useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import { scoreClassification, type OverfitConfig } from '@/lib/algorithmia/overfitting';

export type OverfitSimResult = {
  answers: Record<string, boolean>;
  correct: number;
  total: number;
};

export default function OverfittingSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<OverfitConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: OverfitSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: OverfitSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const examples = config.examples ?? [];

  const [answers, setAnswers] = useState<Record<string, boolean>>(initialSubmission?.simResult?.answers ?? {});
  const [revealed, setRevealed] = useState(!!initialSubmission);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const allAnswered = examples.every((ex) => answers[ex.id] !== undefined);
  const result = revealed ? scoreClassification(examples, answers) : null;

  function choose(exampleId: string, value: boolean) {
    if (revealed) return;
    setAnswers((prev) => ({ ...prev, [exampleId]: value }));
  }

  async function handleSave() {
    if (!reflection.trim() || !result) return;
    setIsSaving(true);
    try {
      await onSave({ answers, correct: result.correct, total: result.total }, reflection);
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {examples.map((example) => {
          const answer = answers[example.id];
          return (
            <div key={example.id} className="bg-black/20 border border-brand-terminal-border rounded-xl p-5 space-y-3">
              <p className="text-sm text-brand-beige">{example.text}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => choose(example.id, true)}
                  disabled={revealed}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold border transition-colors disabled:cursor-default ${
                    answer === true
                      ? 'bg-brand-mint text-[#0f1a15] border-brand-mint'
                      : 'bg-black/20 text-brand-beige border-brand-terminal-border hover:border-brand-mint/40'
                  }`}
                >
                  Está sobreajustado
                </button>
                <button
                  type="button"
                  onClick={() => choose(example.id, false)}
                  disabled={revealed}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold border transition-colors disabled:cursor-default ${
                    answer === false
                      ? 'bg-brand-mint text-[#0f1a15] border-brand-mint'
                      : 'bg-black/20 text-brand-beige border-brand-terminal-border hover:border-brand-mint/40'
                  }`}
                >
                  Es generalizable
                </button>
              </div>
              {revealed && (
                <p className={`text-xs ${answer === example.isOverfit ? 'text-brand-mint' : 'text-brand-salmon'}`}>
                  {answer === example.isOverfit ? 'Correcto. ' : 'No era eso. '}
                  {example.note}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!revealed ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setRevealed(true)}
            disabled={!allAnswered}
            className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
          >
            Revisar respuestas
          </button>
        </div>
      ) : (
        result && (
          <p className="text-center text-sm font-bold text-brand-beige">
            {result.correct} de {result.total} correctas.
          </p>
        )
      )}

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
