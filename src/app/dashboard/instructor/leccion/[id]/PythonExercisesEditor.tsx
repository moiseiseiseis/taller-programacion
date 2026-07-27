'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { savePythonExercise, deletePythonExercise } from '../../actions';

type PythonExerciseRow = {
  id: string;
  order_index: number;
  kind: string;
  title: string;
  prompt: string;
  starter_code: string;
  test_spec: unknown;
  hint: string | null;
};

const EMPTY_TEST_SPEC = `{
  "type": "stdout_equals",
  "value": ""
}`;

export default function PythonExercisesEditor({
  lessonId,
  exercises,
}: {
  lessonId: string;
  exercises: PythonExerciseRow[];
}) {
  const sorted = exercises.slice().sort((a, b) => a.order_index - b.order_index);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const editingExercise = editingId && editingId !== 'new' ? sorted.find((e) => e.id === editingId) ?? null : null;
  const isFormOpen = editingId !== null;

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await savePythonExercise(formData);
      setEditingId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar el ejercicio.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(exerciseId: string) {
    if (!window.confirm('¿Eliminar este ejercicio? Esta acción no se puede deshacer.')) return;
    const formData = new FormData();
    formData.append('exercise_id', exerciseId);
    formData.append('lesson_id', lessonId);
    try {
      await deletePythonExercise(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al eliminar el ejercicio.');
    }
  }

  return (
    <div className="bg-brand-terminal-panel p-8 rounded-2xl border border-brand-terminal-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-beige">Ejercicios de esta unidad</h2>
          <p className="text-[#9c9c94] text-sm">
            {sorted.length > 0
              ? `Esta unidad tiene ${sorted.length} ejercicio${sorted.length === 1 ? '' : 's'} cargado${sorted.length === 1 ? '' : 's'}.`
              : 'Esta unidad todavía no tiene ejercicios cargados.'}
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={() => setEditingId('new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
          >
            <Plus size={16} /> Agregar ejercicio
          </button>
        )}
      </div>

      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6f6f68] mr-2">
                  {exercise.kind === 'guided' ? 'Guiado' : 'Libre'} · #{exercise.order_index}
                </span>
                <span className="font-semibold text-brand-beige">{exercise.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => setEditingId(exercise.id)} className="text-[#9c9c94] hover:text-brand-mint">
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(exercise.id)} className="text-brand-salmon hover:brightness-110">
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
          {editingId !== 'new' && <input type="hidden" name="exercise_id" value={editingId as string} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Orden</label>
              <input
                type="number"
                name="order_index"
                defaultValue={editingExercise?.order_index ?? sorted.length + 1}
                required
                min={1}
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Tipo</label>
              <select
                name="kind"
                defaultValue={editingExercise?.kind || 'guided'}
                required
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              >
                <option value="guided">Guiado</option>
                <option value="free">Libre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Título</label>
            <input
              type="text"
              name="title"
              defaultValue={editingExercise?.title || ''}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Consigna (admite markdown)</label>
            <textarea
              name="prompt"
              defaultValue={editingExercise?.prompt || ''}
              required
              rows={3}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Código inicial</label>
            <textarea
              name="starter_code"
              defaultValue={editingExercise?.starter_code || ''}
              required
              rows={5}
              className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-sm bg-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Validador (test_spec, JSON)</label>
            <textarea
              name="test_spec_json"
              defaultValue={editingExercise ? JSON.stringify(editingExercise.test_spec, null, 2) : EMPTY_TEST_SPEC}
              required
              rows={6}
              className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-xs bg-black"
            />
            <p className="text-xs text-[#6f6f68] mt-1">
              Tipos válidos: stdout_equals, stdout_contains, no_error (los tres aceptan un campo opcional
              &quot;inputs&quot; con los valores simulados de input()), function_returns (prueba una función)
              y multi_function_returns (prueba varias funciones del mismo ejercicio).
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Pista (opcional)</label>
            <input
              type="text"
              name="hint"
              defaultValue={editingExercise?.hint || ''}
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
              {isSaving ? 'Guardando...' : 'Guardar ejercicio'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
