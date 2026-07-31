'use client';

import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  computeLateness,
  shortestJobFirstOrder,
  earliestDeadlineFirstOrder,
  type SchedulingConfig,
  type Task,
} from '@/lib/algorithmia/scheduling';

export type SchedulingSimResult = {
  order: string[];
  totalLateness: number;
  shortestJobFirstLateness: number;
  earliestDeadlineFirstLateness: number;
};

export default function SchedulingSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<SchedulingConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: SchedulingSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: SchedulingSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const tasks = useMemo<Task[]>(() => config.tasks ?? [], [config.tasks]);

  const [order, setOrder] = useState<Task[]>(tasks);
  const [showComparison, setShowComparison] = useState(!!initialSubmission);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const ownResult = computeLateness(order);
  const sjfResult = useMemo(() => computeLateness(shortestJobFirstOrder(tasks)), [tasks]);
  const edfResult = useMemo(() => computeLateness(earliestDeadlineFirstOrder(tasks)), [tasks]);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = order.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave(
        {
          order: order.map((t) => t.id),
          totalLateness: ownResult.totalLateness,
          shortestJobFirstLateness: sjfResult.totalLateness,
          earliestDeadlineFirstLateness: edfResult.totalLateness,
        },
        reflection
      );
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-3">
        <p className="text-sm font-bold text-brand-beige mb-2">Ordena tus pendientes (el primero es el que haces primero):</p>
        {order.map((task, i) => {
          const taskResult = ownResult.perTask.find((t) => t.id === task.id)!;
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-[#9c9c94] hover:text-brand-mint disabled:opacity-20 disabled:hover:text-[#9c9c94]"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1}
                  className="text-[#9c9c94] hover:text-brand-mint disabled:opacity-20 disabled:hover:text-[#9c9c94]"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-beige">{task.label}</p>
                <p className="text-xs text-[#6f6f68]">
                  dura {task.duration} · vence en {task.deadline}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-[#6f6f68]">termina en {taskResult.completionTime}</p>
                <p className={`text-sm font-bold ${taskResult.lateness > 0 ? 'text-brand-salmon' : 'text-brand-mint'}`}>
                  {taskResult.lateness > 0 ? `${taskResult.lateness} tarde` : 'a tiempo'}
                </p>
              </div>
            </div>
          );
        })}
        <p className="text-center text-sm font-bold text-brand-beige pt-2">
          Arrepentimiento total con este orden: <span className="text-brand-mint">{ownResult.totalLateness}</span>
        </p>
      </div>

      {!showComparison ? (
        <button
          type="button"
          onClick={() => setShowComparison(true)}
          className="text-sm font-bold text-brand-mint hover:underline"
        >
          Ver la comparación contra otras estrategias →
        </button>
      ) : (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-3">
          <p className="text-sm font-bold text-brand-beige">Arrepentimiento total según la estrategia:</p>
          {(
            [
              ['Tu orden', ownResult.totalLateness, '#C2D3E4'],
              ['La más corta primero', sjfResult.totalLateness, '#9BCCB1'],
              ['La de fecha límite más próxima primero', edfResult.totalLateness, '#9DB6D3'],
            ] as [string, number, string][]
          ).map(([label, lateness, color]) => {
            const maxLateness = Math.max(ownResult.totalLateness, sjfResult.totalLateness, edfResult.totalLateness, 1);
            return (
              <div key={label}>
                <div className="flex items-center justify-between text-xs text-[#9c9c94] mb-1 gap-4">
                  <span>{label}</span>
                  <span className="font-bold text-brand-beige">{lateness}</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(lateness / maxLateness) * 100}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {explanation && showComparison && (
        <div className="text-sm text-[#9c9c94]">
          <MarkdownContent content={explanation} />
        </div>
      )}

      {showComparison && (
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
