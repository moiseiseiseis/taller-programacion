'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import {
  getParent,
  generationOf,
  balancedSearchSteps,
  unbalancedSearchSteps,
  DEFAULT_TREE_CONFIG,
  type TreeConfig,
} from '@/lib/algorithmia/tree';

export type TreeSimResult = {
  personAStepsUp: number;
  personBStepsUp: number;
  commonAncestorId: string;
};

type Phase = 'walking' | 'found' | 'comparison';

export default function TreeSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<TreeConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: TreeSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: TreeSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<TreeConfig>(() => ({ ...DEFAULT_TREE_CONFIG, ...config }), [config]);
  const generations = useMemo(() => {
    const byGen = new Map<number, typeof fullConfig.nodes>();
    for (const node of fullConfig.nodes) {
      const gen = generationOf(fullConfig.nodes, node.id);
      byGen.set(gen, [...(byGen.get(gen) ?? []), node]);
    }
    return Array.from(byGen.entries()).sort(([a], [b]) => a - b);
  }, [fullConfig]);

  const [phase, setPhase] = useState<Phase>(initialSubmission ? 'comparison' : 'walking');
  const [currentAId, setCurrentAId] = useState(fullConfig.personAId);
  const [currentBId, setCurrentBId] = useState(fullConfig.personBId);
  const [stepsA, setStepsA] = useState(initialSubmission?.simResult?.personAStepsUp ?? 0);
  const [stepsB, setStepsB] = useState(initialSubmission?.simResult?.personBStepsUp ?? 0);
  const [commonAncestorId, setCommonAncestorId] = useState(initialSubmission?.simResult?.commonAncestorId ?? '');
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  function upA() {
    const parent = getParent(fullConfig.nodes, currentAId);
    if (!parent) return;
    setCurrentAId(parent.id);
    setStepsA((prev) => prev + 1);
    if (parent.id === currentBId) {
      setCommonAncestorId(parent.id);
      setPhase('found');
    }
  }

  function upB() {
    const parent = getParent(fullConfig.nodes, currentBId);
    if (!parent) return;
    setCurrentBId(parent.id);
    setStepsB((prev) => prev + 1);
    if (parent.id === currentAId) {
      setCommonAncestorId(parent.id);
      setPhase('found');
    }
  }

  function labelOf(id: string) {
    return fullConfig.nodes.find((n) => n.id === id)?.label ?? id;
  }

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ personAStepsUp: stepsA, personBStepsUp: stepsB, commonAncestorId }, reflection);
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  const balancedSteps = balancedSearchSteps(fullConfig.balancedNodeCount);
  const unbalancedSteps = unbalancedSearchSteps(fullConfig.balancedNodeCount);
  const maxSteps = Math.max(balancedSteps, unbalancedSteps);

  return (
    <div className="space-y-6">
      {(phase === 'walking' || phase === 'found') && (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          <p className="text-sm text-brand-beige">
            Sube por el árbol desde <span className="font-bold text-brand-mint">{labelOf(fullConfig.personAId)}</span> y desde{' '}
            <span className="font-bold text-brand-highlight">{labelOf(fullConfig.personBId)}</span> hasta que se encuentren en el mismo ancestro.
          </p>

          <div className="space-y-2">
            {generations.map(([gen, nodes]) => (
              <div key={gen} className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-[#6f6f68] w-16 shrink-0">Gen. {gen}</span>
                {nodes.map((node) => {
                  const isA = node.id === currentAId;
                  const isB = node.id === currentBId;
                  return (
                    <span
                      key={node.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
                        isA && isB
                          ? 'bg-brand-mint/20 border-brand-mint text-brand-mint font-bold'
                          : isA
                          ? 'bg-brand-mint/10 border-brand-mint text-brand-mint font-bold'
                          : isB
                          ? 'bg-brand-highlight/10 border-brand-highlight text-brand-highlight font-bold'
                          : 'bg-black/20 border-brand-terminal-border text-[#6f6f68]'
                      }`}
                    >
                      {node.label}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>

          {phase === 'walking' ? (
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={upA}
                className="py-2.5 px-5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
              >
                Subir un nivel: {labelOf(fullConfig.personAId)}
              </button>
              <button
                type="button"
                onClick={upB}
                className="py-2.5 px-5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-highlight hover:brightness-110 transition-all"
              >
                Subir un nivel: {labelOf(fullConfig.personBId)}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-brand-mint text-center">
                Ancestro común: {labelOf(commonAncestorId)} — {labelOf(fullConfig.personAId)} subió {stepsA}{' '}
                {stepsA === 1 ? 'nivel' : 'niveles'} y {labelOf(fullConfig.personBId)} subió {stepsB} {stepsB === 1 ? 'nivel' : 'niveles'}.
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setPhase('comparison')}
                  className="py-2 px-5 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border"
                >
                  Ver la comparación
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'comparison' && (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          <p className="text-sm text-brand-beige">
            Buscar un elemento entre {fullConfig.balancedNodeCount} nodos, según qué tan balanceado esté el árbol:
          </p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-[#9c9c94] mb-1">
                <span>Árbol balanceado</span>
                <span className="font-bold text-brand-mint">{balancedSteps} pasos como máximo</span>
              </div>
              <div className="h-3 rounded-full bg-black/30 overflow-hidden">
                <div className="h-full bg-brand-mint" style={{ width: `${(balancedSteps / maxSteps) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-[#9c9c94] mb-1">
                <span>Árbol desbalanceado (una cadena)</span>
                <span className="font-bold text-brand-salmon">{unbalancedSteps} pasos en el peor caso</span>
              </div>
              <div className="h-3 rounded-full bg-black/30 overflow-hidden">
                <div className="h-full bg-brand-salmon" style={{ width: `${(unbalancedSteps / maxSteps) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {explanation && phase === 'comparison' && (
        <div className="text-sm text-[#9c9c94]">
          <MarkdownContent content={explanation} />
        </div>
      )}

      {phase === 'comparison' && (
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
