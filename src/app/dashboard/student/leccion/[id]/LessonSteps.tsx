'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, BookOpen, Lightbulb, Layers, Target, Compass, Sparkles } from 'lucide-react';
import { parseMarkdownSteps } from '@/lib/markdownSteps';
import MarkdownContent from '@/components/lessons/MarkdownContent';

// Ciclo de íconos decorativos por paso (no dependen del contenido, solo del
// índice) para que las cards no se vean todas idénticas.
const STEP_ICONS = [BookOpen, Lightbulb, Layers, Target, Compass, Sparkles];

export default function LessonSteps({ content }: { content: string }) {
  const steps = useMemo(() => parseMarkdownSteps(content), [content]);
  const [index, setIndex] = useState(0);

  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;
  const stepLabel = step.title || 'Introducción';
  const StepIcon = STEP_ICONS[index % STEP_ICONS.length];

  return (
    <div>
      {/* Barra de progreso */}
      {steps.length > 1 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-[#9c9c94] mb-2">
            <span>Paso {index + 1} de {steps.length}</span>
            <span className="truncate max-w-[60%]">{stepLabel}</span>
          </div>
          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-mint transition-all duration-300"
              style={{ width: `${((index + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Indicadores de paso */}
          <div className="flex flex-wrap gap-2 mt-4">
            {steps.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  i === index
                    ? 'bg-brand-mint text-[#0f1a15]'
                    : i < index
                    ? 'bg-brand-mint/20 text-brand-mint hover:bg-brand-mint/30'
                    : 'bg-black/30 text-[#6f6f68] hover:bg-black/40'
                }`}
              >
                {i < index ? <Check size={14} /> : i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenido del paso actual */}
      <div className="min-h-[160px]">
        {step.title && (
          <div className="flex items-center gap-3 mb-5">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-black/30 text-brand-mint shrink-0">
              <StepIcon size={18} />
            </span>
            <h2 className="text-lg font-bold text-brand-beige">{step.title}</h2>
          </div>
        )}
        <MarkdownContent content={step.markdown} />
      </div>

      {/* Navegación */}
      {steps.length > 1 && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-brand-terminal-border">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={isFirst}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-[#9c9c94] hover:bg-black/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          {!isLast ? (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-brand-mint">
              <Check size={16} /> Lección completa
            </span>
          )}
        </div>
      )}
    </div>
  );
}
