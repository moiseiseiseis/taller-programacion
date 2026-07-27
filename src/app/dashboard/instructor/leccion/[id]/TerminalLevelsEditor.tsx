'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { saveTerminalLevel, deleteTerminalLevel } from '../../actions';

type TerminalLevelRow = {
  id: string;
  order_index: number;
  title: string;
  narrative: string | null;
  goal: string;
  filesystem: unknown;
  validator: unknown;
  hint: string | null;
};

const EMPTY_FILESYSTEM = `{
  "initialCwd": ["hogar", "pip"],
  "tree": {
    "type": "dir", "name": "", "children": [
      { "type": "dir", "name": "hogar", "children": [
        { "type": "dir", "name": "pip", "children": [] }
      ]}
    ]
  }
}`;

const EMPTY_VALIDATOR = `{
  "type": "command_used",
  "command": "ls"
}`;

export default function TerminalLevelsEditor({
  lessonId,
  levels,
}: {
  lessonId: string;
  levels: TerminalLevelRow[];
}) {
  const sorted = levels.slice().sort((a, b) => a.order_index - b.order_index);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const editingLevel = editingId && editingId !== 'new' ? sorted.find((l) => l.id === editingId) ?? null : null;
  const isFormOpen = editingId !== null;

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await saveTerminalLevel(formData);
      setEditingId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar el nivel.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(levelId: string) {
    if (!window.confirm('¿Eliminar este nivel? Esta acción no se puede deshacer.')) return;
    const formData = new FormData();
    formData.append('level_id', levelId);
    formData.append('lesson_id', lessonId);
    try {
      await deleteTerminalLevel(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al eliminar el nivel.');
    }
  }

  return (
    <div className="bg-brand-terminal-panel p-8 rounded-2xl border border-brand-terminal-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-beige">Niveles de este mundo</h2>
          <p className="text-[#9c9c94] text-sm">
            {sorted.length > 0
              ? `Este mundo tiene ${sorted.length} nivel${sorted.length === 1 ? '' : 'es'} cargado${sorted.length === 1 ? '' : 's'}.`
              : 'Este mundo todavía no tiene niveles cargados.'}
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
                <span className="font-semibold text-brand-beige">{level.title}</span>
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
          <input type="hidden" name="lesson_id" value={lessonId} />
          {editingId !== 'new' && <input type="hidden" name="level_id" value={editingId as string} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Orden</label>
              <input
                type="number"
                name="order_index"
                defaultValue={editingLevel?.order_index ?? sorted.length + 1}
                required
                min={1}
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Título</label>
              <input
                type="text"
                name="title"
                defaultValue={editingLevel?.title || ''}
                required
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Narrativa (opcional)</label>
            <textarea
              name="narrative"
              defaultValue={editingLevel?.narrative || ''}
              rows={2}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Objetivo</label>
            <textarea
              name="goal"
              defaultValue={editingLevel?.goal || ''}
              required
              rows={2}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Sistema de archivos inicial (filesystem, JSON)</label>
            <textarea
              name="filesystem_json"
              defaultValue={editingLevel ? JSON.stringify(editingLevel.filesystem, null, 2) : EMPTY_FILESYSTEM}
              required
              rows={8}
              className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-xs bg-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Validador (JSON)</label>
            <textarea
              name="validator_json"
              defaultValue={editingLevel ? JSON.stringify(editingLevel.validator, null, 2) : EMPTY_VALIDATOR}
              required
              rows={4}
              className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-xs bg-black"
            />
            <p className="text-xs text-[#6f6f68] mt-1">
              Tipos válidos: cwd_equals, command_used, output_contains, node_exists, node_missing, file_contains.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Pista (opcional)</label>
            <input
              type="text"
              name="hint"
              defaultValue={editingLevel?.hint || ''}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
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
