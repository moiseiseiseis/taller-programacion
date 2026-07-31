'use client';

import { useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import type { RelaxationConfig } from '@/lib/algorithmia/relaxation';

export type RelaxationSimResult = {
  goal: string;
  selectedConstraintId: string;
  relaxedStep: string;
};

export default function RelaxationSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<RelaxationConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: RelaxationSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: RelaxationSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const options = config.constraintOptions ?? [];

  const [goal, setGoal] = useState(initialSubmission?.simResult?.goal ?? '');
  const [selectedConstraintId, setSelectedConstraintId] = useState(
    initialSubmission?.simResult?.selectedConstraintId ?? ''
  );
  const [relaxedStep, setRelaxedStep] = useState(initialSubmission?.simResult?.relaxedStep ?? '');
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const canSave = goal.trim() && selectedConstraintId && relaxedStep.trim() && reflection.trim();

  async function handleSave() {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onSave({ goal, selectedConstraintId, relaxedStep }, reflection);
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
          <label className="block text-sm font-semibold text-brand-beige mb-1">
            ¿Cuál es el objetivo que se siente imposible de planear?
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ej: cambiar de carrera, mudarse de ciudad, aprender algo nuevo desde cero..."
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-beige mb-2">¿Qué restricción se relaja primero?</p>
          <div className="space-y-2">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex items-start gap-3 px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20 cursor-pointer hover:border-brand-mint/40 transition-colors"
              >
                <input
                  type="radio"
                  name="constraint"
                  value={option.id}
                  checked={selectedConstraintId === option.id}
                  onChange={() => setSelectedConstraintId(option.id)}
                  className="accent-brand-mint mt-1"
                />
                <span>
                  <span className="font-semibold text-brand-beige">{option.label}</span>
                  <p className="text-sm text-[#9c9c94] mt-0.5">{option.description}</p>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">
            Si esa restricción no existiera por un momento, ¿cuál sería un primer paso concreto?
          </label>
          <textarea
            value={relaxedStep}
            onChange={(e) => setRelaxedStep(e.target.value)}
            rows={3}
            placeholder="Escribe tu respuesta..."
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
          />
        </div>
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
            disabled={isSaving || !canSave}
            className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isSaving ? 'Guardando...' : saved ? 'Actualizar respuesta' : 'Guardar respuesta'}
          </button>
        </div>
      </div>
    </div>
  );
}
