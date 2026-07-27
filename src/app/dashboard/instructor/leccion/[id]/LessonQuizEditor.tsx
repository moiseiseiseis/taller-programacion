'use client';

import { useState } from 'react';
import { updateLessonQuiz } from '../../actions';

const QUIZ_PLACEHOLDER = `{
  "passScore": 2,
  "questions": [
    {
      "text": "¿Qué guarda la RAM cuando apagas la compu?",
      "options": [
        { "label": "Nada, se borra todo", "score": 1 },
        { "label": "Todo se guarda igual", "score": 0 }
      ]
    }
  ]
}`;

export default function LessonQuizEditor({ lessonId, quiz }: { lessonId: string; quiz: unknown | null }) {
  const [quizJson, setQuizJson] = useState(quiz ? JSON.stringify(quiz, null, 2) : '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (quizJson.trim()) {
      try {
        JSON.parse(quizJson);
      } catch {
        alert('El JSON del quiz no es válido. Revisá el formato antes de guardar.');
        return;
      }
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append('lesson_id', lessonId);
    formData.append('quiz_json', quizJson);

    try {
      await updateLessonQuiz(formData);
      alert(
        quizJson.trim()
          ? 'Quiz guardado. Ahora es obligatorio aprobarlo para avanzar a la siguiente lección.'
          : 'Quiz eliminado. La lección ya no bloquea el avance.'
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar el quiz.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-brand-beige">Quiz de avance (opcional)</h2>
        <p className="text-[#9c9c94] text-sm">
          Si cargas un quiz aquí, el alumno tiene que aprobarlo para poder pasar a la siguiente lección del taller.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={quizJson}
          onChange={(e) => setQuizJson(e.target.value)}
          rows={12}
          placeholder={QUIZ_PLACEHOLDER}
          className="w-full px-4 py-3 border border-brand-terminal-border bg-black/30 text-brand-beige rounded-lg focus:ring-2 focus:ring-brand-mint outline-none font-mono text-xs placeholder:text-[#6f6f68]"
        />
        <p className="text-xs text-[#6f6f68]">Déjalo vacío y guarda para quitar el quiz de esta lección.</p>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-brand-mint text-[#0f1a15] px-6 py-2.5 rounded-lg font-bold hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isSaving ? 'Guardando...' : 'Guardar Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}
