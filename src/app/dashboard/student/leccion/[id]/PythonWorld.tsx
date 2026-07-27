'use client';

import { useMemo, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import PyodideCodeRunner from '@/components/python/PyodideCodeRunner';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import { completePythonExercise } from '../../actions';
import LessonQuizGate from './LessonQuizGate';
import type { PythonTestSpec } from '@/lib/pythonTestSpec';
import type { LessonQuiz } from '@/lib/lessonQuiz';

export type PythonExerciseData = {
  id: string;
  order_index: number;
  kind: 'guided' | 'free';
  title: string;
  prompt: string;
  starter_code: string;
  test_spec: PythonTestSpec;
  hint: string | null;
};

export default function PythonWorld({
  lessonId,
  exercises,
  initiallyCompletedExerciseIds,
  quiz,
  initiallyQuizPassed,
  quizAttempts,
  nextLessonId,
}: {
  lessonId: string;
  exercises: PythonExerciseData[];
  initiallyCompletedExerciseIds: string[];
  quiz: LessonQuiz | null;
  initiallyQuizPassed: boolean;
  quizAttempts: { score: number; passed: boolean; created_at: string }[];
  nextLessonId: string | null;
}) {
  const sortedExercises = useMemo(
    () => exercises.slice().sort((a, b) => a.order_index - b.order_index),
    [exercises]
  );
  const [completedIds, setCompletedIds] = useState(new Set(initiallyCompletedExerciseIds));

  const firstUnsolved = sortedExercises.findIndex((ex) => !completedIds.has(ex.id));
  const initialAllDone = sortedExercises.length > 0 && firstUnsolved === -1;
  const [view, setView] = useState<number | 'quiz'>(
    initialAllDone ? 'quiz' : Math.max(firstUnsolved, 0)
  );

  const allDone = sortedExercises.length > 0 && completedIds.size === sortedExercises.length;

  function handleExerciseSolved(exerciseId: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev).add(exerciseId);
      if (next.size === sortedExercises.length) setView('quiz');
      return next;
    });
  }

  const currentExercise = typeof view === 'number' ? sortedExercises[view] : null;

  return (
    <div className="space-y-6">
      {/* Progreso de la unidad */}
      <div className="flex flex-wrap gap-2">
        {sortedExercises.map((exercise, i) => {
          const isSolved = completedIds.has(exercise.id);
          const isLocked = i > 0 && !completedIds.has(sortedExercises[i - 1].id) && !isSolved;
          return (
            <button
              key={exercise.id}
              type="button"
              disabled={isLocked}
              onClick={() => setView(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                view === i
                  ? 'bg-brand-mint text-[#0f1a15]'
                  : isSolved
                  ? 'bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20'
                  : isLocked
                  ? 'bg-black/30 text-[#6f6f68] cursor-not-allowed'
                  : 'bg-black/30 text-[#9c9c94] hover:bg-black/40'
              }`}
            >
              {isSolved ? <Check size={12} /> : isLocked ? <Lock size={12} /> : null}
              {exercise.kind === 'guided' ? 'Guiado' : 'Libre'} {i + 1}
            </button>
          );
        })}
        {allDone && (
          <button
            type="button"
            onClick={() => setView('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              view === 'quiz'
                ? 'bg-brand-mint text-[#0f1a15]'
                : 'bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20'
            }`}
          >
            <Check size={12} /> Quiz
          </button>
        )}
      </div>

      {view === 'quiz' ? (
        quiz ? (
          <LessonQuizGate
            lessonId={lessonId}
            quiz={quiz}
            initiallyPassed={initiallyQuizPassed}
            nextLessonId={nextLessonId}
            attempts={quizAttempts}
          />
        ) : (
          <div className="bg-brand-mint/10 border border-brand-mint/30 rounded-2xl p-6">
            <p className="font-bold text-brand-mint">Completaste todos los ejercicios de esta lección.</p>
          </div>
        )
      ) : currentExercise ? (
        <ExercisePlayer
          key={currentExercise.id}
          lessonId={lessonId}
          exercise={currentExercise}
          isSolved={completedIds.has(currentExercise.id)}
          onSolved={() => handleExerciseSolved(currentExercise.id)}
        />
      ) : null}
    </div>
  );
}

function ExercisePlayer({
  lessonId,
  exercise,
  isSolved,
  onSolved,
}: {
  lessonId: string;
  exercise: PythonExerciseData;
  isSolved: boolean;
  onSolved: () => void;
}) {
  const [solved, setSolved] = useState(isSolved);
  const [isSaving, setIsSaving] = useState(false);

  async function handleResult(passed: boolean) {
    if (!passed || solved) return;
    setSolved(true);
    setIsSaving(true);
    try {
      await completePythonExercise(exercise.id, lessonId);
    } catch {
      // El progreso visual ya se marcó; si falla el guardado, no bloqueamos al alumno.
    } finally {
      setIsSaving(false);
    }
    onSolved();
  }

  return (
    <div className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-brand-beige">{exercise.title}</h3>
        <div className="text-sm text-[#9c9c94] mt-1">
          <MarkdownContent content={exercise.prompt} />
        </div>
      </div>

      <PyodideCodeRunner
        starterCode={exercise.starter_code}
        testSpec={exercise.test_spec}
        onResult={handleResult}
      />

      {solved && (
        <div className="flex items-center gap-2 text-brand-mint text-sm font-bold">
          <Check size={16} /> {isSaving ? 'Guardando...' : 'Ejercicio resuelto. Puedes seguir editando y probando el código.'}
        </div>
      )}

      {exercise.hint && !solved && (
        <details className="text-xs text-[#6f6f68]">
          <summary className="cursor-pointer font-bold hover:text-brand-mint">Pista</summary>
          <p className="mt-1">{exercise.hint}</p>
        </details>
      )}
    </div>
  );
}
