'use client';

import { useMemo, useState } from 'react';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import { getNeighbors, shortestPath, DEFAULT_GRAPH_CONFIG, type GraphConfig } from '@/lib/algorithmia/graph';

export type GraphSimResult = {
  socialPath: string[];
  socialHops: number;
  socialOptimalHops: number;
  mapPath: string[];
  mapCost: number;
  mapOptimalCost: number;
};

type Phase = 'social-walking' | 'social-reveal' | 'map-walking' | 'map-reveal' | 'done';

export default function GraphSim({
  config,
  reflectionPrompt,
  explanation,
  initialSubmission,
  onSave,
}: {
  config: Partial<GraphConfig>;
  reflectionPrompt: string;
  explanation: string | null;
  initialSubmission: { simResult: GraphSimResult | null; reflectionResponse: string | null } | null;
  onSave: (simResult: GraphSimResult, reflectionResponse: string) => Promise<void>;
}) {
  const fullConfig = useMemo<GraphConfig>(() => ({ ...DEFAULT_GRAPH_CONFIG, ...config }), [config]);

  const [phase, setPhase] = useState<Phase>(initialSubmission ? 'done' : 'social-walking');
  const [socialPath, setSocialPath] = useState<string[]>(
    initialSubmission?.simResult?.socialPath ?? [fullConfig.startPersonId]
  );
  const [mapPath, setMapPath] = useState<string[]>(
    initialSubmission?.simResult?.mapPath ?? [fullConfig.startCityId]
  );
  const [mapCost, setMapCost] = useState(initialSubmission?.simResult?.mapCost ?? 0);
  const [reflection, setReflection] = useState(initialSubmission?.reflectionResponse ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialSubmission);

  const socialOptimal = useMemo(
    () => shortestPath(fullConfig.socialEdges, fullConfig.startPersonId, fullConfig.targetPersonId),
    [fullConfig]
  );
  const mapOptimal = useMemo(
    () => shortestPath(fullConfig.mapEdges, fullConfig.startCityId, fullConfig.targetCityId),
    [fullConfig]
  );

  function labelOf(nodes: { id: string; label: string }[], id: string) {
    return nodes.find((n) => n.id === id)?.label ?? id;
  }

  function pickSocialNeighbor(id: string) {
    const nextPath = [...socialPath, id];
    setSocialPath(nextPath);
    if (id === fullConfig.targetPersonId) setPhase('social-reveal');
  }

  function pickMapNeighbor(id: string, weight: number) {
    const nextPath = [...mapPath, id];
    const nextCost = mapCost + weight;
    setMapPath(nextPath);
    setMapCost(nextCost);
    if (id === fullConfig.targetCityId) setPhase('map-reveal');
  }

  async function handleSave() {
    if (!reflection.trim()) return;
    setIsSaving(true);
    try {
      await onSave(
        {
          socialPath,
          socialHops: socialPath.length - 1,
          socialOptimalHops: socialOptimal.path.length - 1,
          mapPath,
          mapCost,
          mapOptimalCost: mapOptimal.distance,
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
      {(phase === 'social-walking' || phase === 'social-reveal') && (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          <p className="text-sm text-brand-beige">
            Camino recorrido: {socialPath.map((id) => labelOf(fullConfig.socialNodes, id)).join(' → ')}
          </p>

          {phase === 'social-walking' ? (
            <div className="space-y-2">
              <p className="text-xs text-[#6f6f68]">
                Conocidos de {labelOf(fullConfig.socialNodes, socialPath[socialPath.length - 1])}:
              </p>
              <div className="flex flex-wrap gap-2">
                {getNeighbors(fullConfig.socialEdges, socialPath[socialPath.length - 1])
                  .filter((n) => !socialPath.includes(n.to) || n.to === fullConfig.targetPersonId)
                  .map((n) => (
                    <button
                      key={n.to}
                      type="button"
                      onClick={() => pickSocialNeighbor(n.to)}
                      className="py-2 px-4 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
                    >
                      {labelOf(fullConfig.socialNodes, n.to)}
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-bold text-brand-beige">
                Tu camino: {socialPath.length - 1} {socialPath.length - 1 === 1 ? 'grado' : 'grados'} de separación
              </p>
              <p className="text-sm font-bold text-brand-mint">
                Mínimo posible: {socialOptimal.path.length - 1}{' '}
                {socialOptimal.path.length - 1 === 1 ? 'grado' : 'grados'} (
                {socialOptimal.path.map((id) => labelOf(fullConfig.socialNodes, id)).join(' → ')})
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPhase('map-walking')}
                  className="py-2 px-5 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border"
                >
                  Siguiente: ruta más barata
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(phase === 'map-walking' || phase === 'map-reveal' || phase === 'done') && (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 space-y-4">
          <p className="text-sm text-brand-beige">
            Camino recorrido: {mapPath.map((id) => labelOf(fullConfig.mapNodes, id)).join(' → ')} · costo acumulado:{' '}
            <span className="font-bold text-brand-mint">{mapCost}</span>
          </p>

          {phase === 'map-walking' && (
            <div className="space-y-2">
              <p className="text-xs text-[#6f6f68]">
                Conexiones desde {labelOf(fullConfig.mapNodes, mapPath[mapPath.length - 1])}:
              </p>
              <div className="flex flex-wrap gap-2">
                {getNeighbors(fullConfig.mapEdges, mapPath[mapPath.length - 1])
                  .filter((n) => !mapPath.includes(n.to) || n.to === fullConfig.targetCityId)
                  .map((n) => (
                    <button
                      key={n.to}
                      type="button"
                      onClick={() => pickMapNeighbor(n.to, n.weight)}
                      className="py-2 px-4 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
                    >
                      {labelOf(fullConfig.mapNodes, n.to)} (+{n.weight})
                    </button>
                  ))}
              </div>
            </div>
          )}

          {(phase === 'map-reveal' || phase === 'done') && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-brand-beige">Tu costo total: {mapCost}</p>
              <p className="text-sm font-bold text-brand-mint">
                Costo mínimo posible: {mapOptimal.distance} (
                {mapOptimal.path.map((id) => labelOf(fullConfig.mapNodes, id)).join(' → ')})
              </p>
              {phase === 'map-reveal' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPhase('done')}
                    className="py-2 px-5 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border"
                  >
                    Terminar
                  </button>
                </div>
              )}
            </div>
          )}
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
