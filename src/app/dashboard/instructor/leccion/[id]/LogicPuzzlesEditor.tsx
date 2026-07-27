'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { saveLogicPuzzle, deleteLogicPuzzle } from '../../actions';

type LogicPuzzleRow = {
  id: string;
  order_index: number;
  kind: string;
  title: string;
  narrative: string | null;
  prompt: string;
  puzzle_data: unknown;
  solution: unknown;
  hint: string | null;
  explanation: string | null;
};

const EMPTY_ASSIGNMENT_DATA = `{
  "kind": "assignment",
  "boards": [
    {
      "id": "testigos",
      "title": "¿Quién dice la verdad?",
      "entities": [
        { "id": "a", "label": "Testigo A" },
        { "id": "b", "label": "Testigo B" }
      ],
      "options": [
        { "id": "verdad", "label": "Dice la verdad" },
        { "id": "miente", "label": "Miente" }
      ],
      "optionsAreUnique": false
    }
  ]
}`;

const EMPTY_ASSIGNMENT_SOLUTION = `{
  "kind": "assignment",
  "boards": {
    "testigos": { "a": "verdad", "b": "miente" }
  }
}`;

const EMPTY_CHOICE_DATA = `{
  "kind": "choice",
  "options": [
    { "id": "valido", "label": "El argumento es válido" },
    { "id": "invalido", "label": "El argumento no es válido" }
  ]
}`;

const EMPTY_CHOICE_SOLUTION = `{
  "kind": "choice",
  "optionId": "valido"
}`;

export default function LogicPuzzlesEditor({
  lessonId,
  puzzles,
}: {
  lessonId: string;
  puzzles: LogicPuzzleRow[];
}) {
  const sorted = puzzles.slice().sort((a, b) => a.order_index - b.order_index);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [formKind, setFormKind] = useState<'assignment' | 'choice'>('assignment');
  const [isSaving, setIsSaving] = useState(false);

  const editingPuzzle = editingId && editingId !== 'new' ? sorted.find((p) => p.id === editingId) ?? null : null;
  const isFormOpen = editingId !== null;

  function openNew() {
    setFormKind('assignment');
    setEditingId('new');
  }

  function openEdit(puzzle: LogicPuzzleRow) {
    setFormKind(puzzle.kind === 'choice' ? 'choice' : 'assignment');
    setEditingId(puzzle.id);
  }

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await saveLogicPuzzle(formData);
      setEditingId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar la pieza.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(puzzleId: string) {
    if (!window.confirm('¿Eliminar esta pieza del expediente? Esta acción no se puede deshacer.')) return;
    const formData = new FormData();
    formData.append('puzzle_id', puzzleId);
    formData.append('lesson_id', lessonId);
    try {
      await deleteLogicPuzzle(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al eliminar la pieza.');
    }
  }

  return (
    <div className="bg-brand-terminal-panel p-8 rounded-2xl border border-brand-terminal-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-beige">Piezas del expediente de esta unidad</h2>
          <p className="text-[#9c9c94] text-sm">
            {sorted.length > 0
              ? `Esta unidad tiene ${sorted.length} pieza${sorted.length === 1 ? '' : 's'} cargada${sorted.length === 1 ? '' : 's'}.`
              : 'Esta unidad todavía no tiene piezas cargadas.'}
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
          >
            <Plus size={16} /> Agregar pieza
          </button>
        )}
      </div>

      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map((puzzle) => (
            <div
              key={puzzle.id}
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6f6f68] mr-2">
                  {puzzle.kind === 'choice' ? 'Elección' : 'Asignación'} · #{puzzle.order_index}
                </span>
                <span className="font-semibold text-brand-beige">{puzzle.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => openEdit(puzzle)} className="text-[#9c9c94] hover:text-brand-mint">
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(puzzle.id)} className="text-brand-salmon hover:brightness-110">
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
          {editingId !== 'new' && <input type="hidden" name="puzzle_id" value={editingId as string} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Orden</label>
              <input
                type="number"
                name="order_index"
                defaultValue={editingPuzzle?.order_index ?? sorted.length + 1}
                required
                min={1}
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Tipo</label>
              <select
                name="kind"
                value={formKind}
                onChange={(e) => setFormKind(e.target.value as 'assignment' | 'choice')}
                required
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              >
                <option value="assignment">Asignación (tablero de testigos/orden/grupos)</option>
                <option value="choice">Elección (opción única)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Título</label>
            <input
              type="text"
              name="title"
              defaultValue={editingPuzzle?.title || ''}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Narrativa (opcional, admite markdown)</label>
            <textarea
              name="narrative"
              defaultValue={editingPuzzle?.narrative || ''}
              rows={2}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Consigna (admite markdown)</label>
            <textarea
              name="prompt"
              defaultValue={editingPuzzle?.prompt || ''}
              required
              rows={3}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Pieza (puzzle_data, JSON)</label>
            <textarea
              name="puzzle_data_json"
              defaultValue={
                editingPuzzle
                  ? JSON.stringify(editingPuzzle.puzzle_data, null, 2)
                  : formKind === 'choice'
                  ? EMPTY_CHOICE_DATA
                  : EMPTY_ASSIGNMENT_DATA
              }
              required
              rows={10}
              className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-xs bg-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Solución (JSON)</label>
            <textarea
              name="solution_json"
              defaultValue={
                editingPuzzle
                  ? JSON.stringify(editingPuzzle.solution, null, 2)
                  : formKind === 'choice'
                  ? EMPTY_CHOICE_SOLUTION
                  : EMPTY_ASSIGNMENT_SOLUTION
              }
              required
              rows={5}
              className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-xs bg-black"
            />
            <p className="text-xs text-[#6f6f68] mt-1">
              Para &quot;asignación&quot;: un objeto por cada board.id con entityId → optionId. Para &quot;elección&quot;: el optionId correcto.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">
              Explicación (se muestra al comprobar, admite markdown)
            </label>
            <textarea
              name="explanation"
              defaultValue={editingPuzzle?.explanation || ''}
              rows={3}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
            <p className="text-xs text-[#6f6f68] mt-1">
              Se muestra tanto si el alumno acierta como si no, así que conviene que explique el razonamiento
              correcto completo (eso también le muestra por qué su respuesta, si falló, no encaja).
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Pista (opcional)</label>
            <input
              type="text"
              name="hint"
              defaultValue={editingPuzzle?.hint || ''}
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
              {isSaving ? 'Guardando...' : 'Guardar pieza'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
