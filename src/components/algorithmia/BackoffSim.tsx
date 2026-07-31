'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import { computeSchedule, DEFAULT_BACKOFF_CONFIG, type BackoffConfig } from '@/lib/algorithmia/backoff';

export type BackoffSimResult = {
  multiplier: number;
  schedule: { attempt: number; waitDays: number; cumulativeDay: number }[];
};

export default function BackoffSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<BackoffConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: BackoffSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: BackoffSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<BackoffConfig>(() => ({ ...DEFAULT_BACKOFF_CONFIG, ...config }), [config]);

  const [multiplier, setMultiplier] = useState(initialSubmission?.simResult?.multiplier ?? 2);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const schedule = useMemo(() => computeSchedule(fullConfig, multiplier), [fullConfig, multiplier]);

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ multiplier, schedule }, reflection);
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
          <label className="flex items-center justify-between text-sm font-semibold text-brand-beige mb-1">
            <span>Qué tan rápido crece la espera entre intentos</span>
            <span className="text-brand-mint">×{multiplier.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="w-full accent-brand-mint"
          />
          <p className="text-xs text-[#6f6f68] mt-1">
            ×1 = esperar siempre lo mismo entre intentos. Más alto = cada espera es más larga que la anterior.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6f6f68]">Tu calendario de seguimiento</p>
          {schedule.map((step) => (
            <div key={step.attempt} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-black/20">
              <span className="text-brand-beige">Intento {step.attempt}</span>
              <span className="text-[#9c9c94]">
                esperar {step.waitDays} {step.waitDays === 1 ? 'día' : 'días'} · día {step.cumulativeDay} en total
              </span>
            </div>
          ))}
        </div>

        {multiplier <= 1.05 && (
          <p className="text-xs text-brand-salmon">
            Con espera constante, cada intento llega igual de seguido — es el patrón que más se siente como insistir.
          </p>
        )}
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
            disabled={isSaving || !reflection.trim()}
            className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isSaving ? 'Guardando...' : saved ? 'Actualizar respuesta' : 'Guardar respuesta'}
          </button>
        </div>
      </div>
    </div>
  );
}
