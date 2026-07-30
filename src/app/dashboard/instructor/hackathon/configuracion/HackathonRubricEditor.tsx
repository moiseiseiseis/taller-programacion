'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { saveRubricCriterion, deleteRubricCriterion } from '../actions';

const ANCHOR_BANDS = ['1-2', '3-4', '5-6', '7-8', '9-10'] as const;

type CriterionRow = {
  id: string;
  level_id: string;
  order_index: number;
  name: string;
  weight: number;
  anchor_descriptors: Record<string, string> | null;
};

type LevelRef = { id: string; name: string };

export default function HackathonRubricEditor({
  levels,
  criteria,
}: {
  levels: LevelRef[];
  criteria: CriterionRow[];
}) {
  const [selectedLevelId, setSelectedLevelId] = useState(levels[0]?.id ?? '');
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const levelCriteria = criteria
    .filter((c) => c.level_id === selectedLevelId)
    .sort((a, b) => a.order_index - b.order_index);

  const editing = editingId && editingId !== 'new' ? levelCriteria.find((c) => c.id === editingId) ?? null : null;
  const isFormOpen = editingId !== null;
  const weightSum = levelCriteria.reduce((sum, c) => sum + c.weight, 0);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await saveRubricCriterion(formData);
      setEditingId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar el criterio.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(criterionId: string) {
    if (!window.confirm('¿Eliminar este criterio de la rúbrica?')) return;
    const formData = new FormData();
    formData.append('criterion_id', criterionId);
    try {
      await deleteRubricCriterion(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al eliminar el criterio.');
    }
  }

  if (levels.length === 0) {
    return (
      <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
        <h2 className="text-lg font-bold text-brand-beige mb-2">Rúbrica de evaluación</h2>
        <p className="text-[#9c9c94] text-sm">Creá al menos un nivel primero para poder cargar su rúbrica.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-brand-beige">Rúbrica de evaluación</h2>
          <p className="text-[#9c9c94] text-sm">
            {levelCriteria.length > 0
              ? `${levelCriteria.length} criterio${levelCriteria.length === 1 ? '' : 's'} · suma de pesos: ${weightSum}%`
              : 'Este nivel todavía no tiene criterios cargados.'}
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={() => setEditingId('new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
          >
            <Plus size={16} /> Agregar criterio
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {levels.map((level) => (
          <button
            key={level.id}
            type="button"
            onClick={() => {
              setSelectedLevelId(level.id);
              setEditingId(null);
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              selectedLevelId === level.id
                ? 'bg-brand-mint text-[#0f1a15]'
                : 'bg-black/30 text-[#9c9c94] border border-brand-terminal-border'
            }`}
          >
            {level.name}
          </button>
        ))}
      </div>

      {levelCriteria.length > 0 && (
        <div className="space-y-2">
          {levelCriteria.map((criterion) => (
            <div
              key={criterion.id}
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6f6f68] mr-2">#{criterion.order_index}</span>
                <span className="font-semibold text-brand-beige">{criterion.name}</span>
                <span className="text-xs text-[#6f6f68] ml-2">{criterion.weight}%</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => setEditingId(criterion.id)} className="text-[#9c9c94] hover:text-brand-mint">
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(criterion.id)} className="text-brand-salmon hover:brightness-110">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <form action={handleSubmit} className="space-y-4 border-t border-brand-terminal-border pt-6">
          <input type="hidden" name="level_id" value={selectedLevelId} />
          {editingId !== 'new' && <input type="hidden" name="criterion_id" value={editingId as string} />}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Orden</label>
              <input
                type="number"
                name="order_index"
                defaultValue={editing?.order_index ?? levelCriteria.length + 1}
                required
                min={1}
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-brand-beige mb-1">Criterio</label>
              <input
                type="text"
                name="name"
                defaultValue={editing?.name || ''}
                required
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Peso (%)</label>
              <input
                type="number"
                name="weight"
                defaultValue={editing?.weight ?? ''}
                required
                min={0}
                max={100}
                step="0.01"
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
          </div>

          <div>
            <p className="block text-sm font-semibold text-brand-beige mb-2">
              Anclas de referencia (opcional, para que el jurado no califique a ojo)
            </p>
            <div className="space-y-2">
              {ANCHOR_BANDS.map((band) => (
                <div key={band} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#6f6f68] w-14 shrink-0">{band}</span>
                  <input
                    type="text"
                    name={`anchor_${band}`}
                    defaultValue={editing?.anchor_descriptors?.[band] || ''}
                    placeholder="Descriptor de este rango"
                    className="flex-1 rounded-lg border border-brand-terminal-border bg-black/30 px-3 py-2 text-sm text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditingId(null)} className="text-sm font-bold text-[#9c9c94] hover:text-brand-mint">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {isSaving ? 'Guardando...' : 'Guardar criterio'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
