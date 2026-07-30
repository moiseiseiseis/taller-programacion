'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { saveQuizQuestion, deleteQuizQuestion } from '../actions';

type QuestionRow = {
  id: string;
  order_index: number;
  text: string;
  options: { label: string; scores: Record<string, number> }[];
};

type LevelRef = { id: string; name: string };

function emptyOptionsTemplate(levels: LevelRef[]) {
  const scores: Record<string, number> = {};
  levels.forEach((l) => (scores[l.id] = 0));
  return JSON.stringify(
    [
      { label: 'Opción A', scores },
      { label: 'Opción B', scores },
    ],
    null,
    2
  );
}

export default function HackathonQuizEditor({
  eventId,
  questions,
  levels,
}: {
  eventId: string;
  questions: QuestionRow[];
  levels: LevelRef[];
}) {
  const sorted = questions.slice().sort((a, b) => a.order_index - b.order_index);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const editing = editingId && editingId !== 'new' ? sorted.find((q) => q.id === editingId) ?? null : null;
  const isFormOpen = editingId !== null;

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await saveQuizQuestion(formData);
      setEditingId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar la pregunta.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(questionId: string) {
    if (!window.confirm('¿Eliminar esta pregunta del test de nivel?')) return;
    const formData = new FormData();
    formData.append('question_id', questionId);
    try {
      await deleteQuizQuestion(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al eliminar la pregunta.');
    }
  }

  return (
    <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-brand-beige">Preguntas del test de nivel</h2>
          <p className="text-[#9c9c94] text-sm">
            {sorted.length > 0 ? `${sorted.length} pregunta${sorted.length === 1 ? '' : 's'} cargada${sorted.length === 1 ? '' : 's'}.` : 'Todavía no hay preguntas.'}
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={() => setEditingId('new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
          >
            <Plus size={16} /> Agregar pregunta
          </button>
        )}
      </div>

      {levels.length > 0 && (
        <div className="text-xs text-[#6f6f68] bg-black/20 rounded-lg px-4 py-2 font-mono">
          IDs de nivel para armar &quot;scores&quot;: {levels.map((l) => `${l.name}=${l.id}`).join(' · ')}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map((question) => (
            <div
              key={question.id}
              className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6f6f68] mr-2">#{question.order_index}</span>
                <span className="font-semibold text-brand-beige">{question.text}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => setEditingId(question.id)} className="text-[#9c9c94] hover:text-brand-mint">
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(question.id)} className="text-brand-salmon hover:brightness-110">
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
          {editingId !== 'new' && <input type="hidden" name="question_id" value={editingId as string} />}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-brand-beige mb-1">Pregunta</label>
              <input
                type="text"
                name="text"
                defaultValue={editing?.text || ''}
                required
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Opciones (JSON)</label>
            <textarea
              name="options_json"
              defaultValue={editing ? JSON.stringify(editing.options, null, 2) : emptyOptionsTemplate(levels)}
              required
              rows={10}
              className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-xs bg-black"
            />
            <p className="text-xs text-[#6f6f68] mt-1">
              Array de opciones: cada una con &quot;label&quot; y &quot;scores&quot; (puntos que suma hacia cada nivel, por id de nivel).
            </p>
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
              {isSaving ? 'Guardando...' : 'Guardar pregunta'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
