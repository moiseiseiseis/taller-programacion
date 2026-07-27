'use client';

import { useState } from 'react';
import { saveMetacogExercise, deleteMetacogExercise } from '../../actions';

type MetacogExerciseRow = {
  id: string;
  kind: string;
  title: string;
  prompt: string;
  config: unknown;
  hint: string | null;
};

const KIND_LABELS: Record<string, string> = {
  diagnostic: 'Diagnóstico descriptivo',
  embedded_challenge: 'Reto embebido (acertijo real de Lógica)',
  comparison: 'Comparación de dos métodos',
  applied_reference: 'Aplicación sobre contenido real',
  spaced_calendar: 'Calendario de repaso espaciado',
  interleaved_set: 'Set de práctica intercalada',
  elaboration: 'Elaboración / técnica Feynman',
  calibration: 'Calibración (predicción vs. resultado real)',
  integration: 'Integración final',
};

const EMPTY_CONFIG: Record<string, string> = {
  diagnostic: `{}`,
  embedded_challenge: `{
  "logicPuzzleId": "",
  "focusedMinutes": 15
}`,
  comparison: `{
  "labelA": "Primer método",
  "labelB": "Segundo método"
}`,
  applied_reference: `{}`,
  spaced_calendar: `{}`,
  interleaved_set: `{
  "items": [
    {
      "id": "item1",
      "scenario": "Describe una situación de estudio aquí.",
      "options": [
        { "id": "a", "label": "Modo enfocado/difuso" },
        { "id": "b", "label": "Fragmentación" },
        { "id": "c", "label": "Recuperación activa" }
      ]
    }
  ]
}`,
  elaboration: `{}`,
  calibration: `{}`,
  integration: `{
  "diagnosticLessonId": ""
}`,
};

export default function ReflectionExerciseEditor({
  lessonId,
  exercise,
}: {
  lessonId: string;
  exercise: MetacogExerciseRow | null;
}) {
  const [kind, setKind] = useState(exercise?.kind || 'diagnostic');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await saveMetacogExercise(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar el ejercicio.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!exercise) return;
    if (!window.confirm('¿Eliminar este ejercicio? Esta acción no se puede deshacer.')) return;
    const formData = new FormData();
    formData.append('exercise_id', exercise.id);
    formData.append('lesson_id', lessonId);
    try {
      await deleteMetacogExercise(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al eliminar el ejercicio.');
    }
  }

  return (
    <div className="bg-brand-terminal-panel p-8 rounded-2xl border border-brand-terminal-border space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-beige">Ejercicio reflexivo de esta unidad</h2>
          <p className="text-[#9c9c94] text-sm">
            {exercise ? 'Esta unidad ya tiene un ejercicio configurado.' : 'Esta unidad todavía no tiene ejercicio configurado.'}
          </p>
        </div>
        {exercise && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-brand-salmon bg-brand-salmon/10 hover:bg-brand-salmon/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
          >
            Eliminar ejercicio
          </button>
        )}
      </div>

      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="lesson_id" value={lessonId} />
        {exercise && <input type="hidden" name="exercise_id" value={exercise.id} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Tipo de ejercicio</label>
            <select
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            >
              {Object.entries(KIND_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Título</label>
            <input
              type="text"
              name="title"
              defaultValue={exercise?.title || ''}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">Consigna (admite markdown)</label>
          <textarea
            name="prompt"
            defaultValue={exercise?.prompt || ''}
            required
            rows={4}
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">Configuración (config, JSON)</label>
          <textarea
            name="config_json"
            defaultValue={exercise ? JSON.stringify(exercise.config, null, 2) : EMPTY_CONFIG[kind]}
            rows={8}
            className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-xs bg-black"
          />
          <p className="text-xs text-[#6f6f68] mt-1">
            Para &quot;reto embebido&quot;: logicPuzzleId debe ser el id de una fila real de logic_puzzles.
            Para &quot;integración final&quot;: diagnosticLessonId debe ser el id de la lección de diagnóstico (Unidad 1).
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">Pista (opcional)</label>
          <input
            type="text"
            name="hint"
            defaultValue={exercise?.hint || ''}
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isSaving ? 'Guardando...' : 'Guardar ejercicio'}
          </button>
        </div>
      </form>
    </div>
  );
}
