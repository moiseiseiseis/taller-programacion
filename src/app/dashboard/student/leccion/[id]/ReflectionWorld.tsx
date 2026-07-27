'use client';

import MarkdownContent from '@/components/lessons/MarkdownContent';
import ReflectionExercise from '@/components/metacog/ReflectionExercise';
import { saveReflectionResponse } from '../../actions';
import type { AnyMetacogConfig, AnyMetacogResponse, MetacogKind } from '@/lib/metacog/types';
import type { LogicPuzzleData, LogicPuzzleSolution } from '@/lib/logicPuzzle/types';

export type MetacogExerciseData = {
  id: string;
  kind: MetacogKind;
  title: string;
  prompt: string;
  config: AnyMetacogConfig;
  hint: string | null;
};

export default function ReflectionWorld({
  lessonId,
  exercise,
  initialResponse,
  availableLessons,
  embeddedPuzzle,
  diagnosticText,
  actualQuizResult,
}: {
  lessonId: string;
  exercise: MetacogExerciseData;
  initialResponse: AnyMetacogResponse | null;
  availableLessons: { id: string; label: string }[];
  embeddedPuzzle?: { id: string; puzzle_data: LogicPuzzleData; solution: LogicPuzzleSolution; title: string; prompt: string } | null;
  diagnosticText?: string | null;
  actualQuizResult?: { score: number; maxScore: number; passed: boolean } | null;
}) {
  async function handleSave(response: AnyMetacogResponse, referencedLessonId: string | null) {
    await saveReflectionResponse(exercise.id, lessonId, response, referencedLessonId);
  }

  return (
    <div className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 md:p-8 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-brand-beige">{exercise.title}</h3>
        <div className="text-sm text-[#9c9c94] mt-1">
          <MarkdownContent content={exercise.prompt} />
        </div>
      </div>

      <ReflectionExercise
        kind={exercise.kind}
        config={exercise.config}
        initialResponse={initialResponse}
        availableLessons={availableLessons}
        embeddedPuzzle={embeddedPuzzle}
        diagnosticText={diagnosticText}
        actualQuizResult={actualQuizResult}
        onSave={handleSave}
      />

      {exercise.hint && (
        <details className="text-xs text-[#6f6f68]">
          <summary className="cursor-pointer font-bold hover:text-brand-mint">Pista</summary>
          <p className="mt-1">{exercise.hint}</p>
        </details>
      )}
    </div>
  );
}
