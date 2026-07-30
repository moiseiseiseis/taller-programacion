'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { saveHackathonLevel, deleteHackathonLevel } from '../actions';

type LevelRow = {
  id: string;
  order_index: number;
  name: string;
  description: string | null;
  max_team_size: number;
};

export default function HackathonLevelsEditor({ eventId, levels }: { eventId: string; levels: LevelRow[] }) {
  const sorted = levels.slice().sort((a, b) => a.order_index - b.order_index);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const editing = editingId && editingId !== 'new' ? sorted.find((l) => l.id === editingId) ?? null : null;
  const isFormOpen = editingId !== null;

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await saveHackathonLevel(formData);
      setEditingId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar el nivel.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(levelId: string) {
    if (!window.confirm('¿Eliminar este nivel? Los equipos y registros de ese nivel también se eliminan.')) return;
    const formData = new FormData();
    formData.append('level_id', levelId);
    try {
      await deleteHackathonLevel(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al eliminar el nivel.');
    }
  }

  return (
    <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-brand-beige">Niveles</h2>
          <p className="text-[#9c9c94] text-sm">
            {sorted.length > 0 ? `${sorted.length} nivel${sorted.length === 1 ? '' : 'es'} configurado${sorted.length === 1 ? '' : 's'}.` : 'Todavía no hay niveles.'}
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={() => setEditingId('new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
          >
            <Plus size={16} /> Agregar nivel
          </button>
        )}
      </div>

      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map((level) => (
            <div
              key={level.id}
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6f6f68] mr-2">#{level.order_index}</span>
                <span className="font-semibold text-brand-beige">{level.name}</span>
                <span className="text-xs text-[#6f6f68] ml-2">máx. {level.max_team_size}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => setEditingId(level.id)} className="text-[#9c9c94] hover:text-brand-mint">
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(level.id)} className="text-brand-salmon hover:brightness-110">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <form action={handleSubmit} className="space-y-4 border-t border-brand-terminal-border pt-6">
          <input type="hidden" name="event_id" value={eventId} />
          {editingId !== 'new' && <input type="hidden" name="level_id" value={editingId as string} />}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Orden</label>
              <input
                type="number"
                name="order_index"
                defaultValue={editing?.order_index ?? sorted.length + 1}
                required
                min={1}
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Nombre</label>
              <input
                type="text"
                name="name"
                defaultValue={editing?.name || ''}
                required
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Máx. integrantes</label>
              <input
                type="number"
                name="max_team_size"
                defaultValue={editing?.max_team_size ?? 6}
                required
                min={1}
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Descripción (menú informativo)</label>
            <textarea
              name="description"
              defaultValue={editing?.description || ''}
              rows={3}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
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
              {isSaving ? 'Guardando...' : 'Guardar nivel'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
