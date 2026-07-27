'use client';

import { useMemo, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import AssignmentBoard from '@/components/logic/AssignmentBoard';
import ChoiceCard from '@/components/logic/ChoiceCard';
import MarkdownContent from '@/components/lessons/MarkdownContent';
import { checkLogicPuzzle } from '@/lib/logicPuzzle/checker';
import type { AssignmentAnswer, LogicPuzzleAnswer, LogicPuzzleData, LogicPuzzleSolution } from '@/lib/logicPuzzle/types';
import { completeLogicPuzzle } from '../../actions';
import LessonQuizGate from './LessonQuizGate';
import type { LessonQuiz } from '@/lib/lessonQuiz';

export type LogicPuzzleRowData = {
  id: string;
  order_index: number;
  kind: 'assignment' | 'choice';
  title: string;
  narrative: string | null;
  prompt: string;
  puzzle_data: LogicPuzzleData;
  solution: LogicPuzzleSolution;
  hint: string | null;
  explanation: string | null;
};

export default function LogicPuzzleWorld({
  lessonId,
  puzzles,
  initiallyCompletedPuzzleIds,
  quiz,
  initiallyQuizPassed,
  quizAttempts,
  nextLessonId,
}: {
  lessonId: string;
  puzzles: LogicPuzzleRowData[];
  initiallyCompletedPuzzleIds: string[];
  quiz: LessonQuiz | null;
  initiallyQuizPassed: boolean;
  quizAttempts: { score: number; passed: boolean; created_at: string }[];
  nextLessonId: string | null;
}) {
  const sortedPuzzles = useMemo(
    () => puzzles.slice().sort((a, b) => a.order_index - b.order_index),
    [puzzles]
  );
  const [completedIds, setCompletedIds] = useState(new Set(initiallyCompletedPuzzleIds));

  const firstUnsolved = sortedPuzzles.findIndex((p) => !completedIds.has(p.id));
  const initialAllDone = sortedPuzzles.length > 0 && firstUnsolved === -1;
  const [view, setView] = useState<number | 'quiz'>(
    initialAllDone ? 'quiz' : Math.max(firstUnsolved, 0)
  );

  const allDone = sortedPuzzles.length > 0 && completedIds.size === sortedPuzzles.length;

  function handlePuzzleSolved(puzzleId: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev).add(puzzleId);
      if (next.size === sortedPuzzles.length) setView('quiz');
      return next;
    });
  }

  const currentPuzzle = typeof view === 'number' ? sortedPuzzles[view] : null;

  return (
    <div className="space-y-6">
      {/* Progreso del expediente */}
      <div className="flex flex-wrap gap-2">
        {sortedPuzzles.map((puzzle, i) => {
          const isSolved = completedIds.has(puzzle.id);
          const isLocked = i > 0 && !completedIds.has(sortedPuzzles[i - 1].id) && !isSolved;
          return (
            <button
              key={puzzle.id}
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
              Pieza {i + 1}
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
            <p className="font-bold text-brand-mint">Reuniste todas las piezas de esta unidad.</p>
          </div>
        )
      ) : currentPuzzle ? (
        <PuzzlePlayer
          key={currentPuzzle.id}
          lessonId={lessonId}
          puzzle={currentPuzzle}
          isSolved={completedIds.has(currentPuzzle.id)}
          onSolved={() => handlePuzzleSolved(currentPuzzle.id)}
        />
      ) : null}
    </div>
  );
}

function emptyAssignmentAnswer(data: LogicPuzzleData): AssignmentAnswer {
  if (data.kind !== 'assignment') return {};
  const boards: AssignmentAnswer = {};
  for (const board of data.boards) boards[board.id] = {};
  return boards;
}

function PuzzlePlayer({
  lessonId,
  puzzle,
  isSolved,
  onSolved,
}: {
  lessonId: string;
  puzzle: LogicPuzzleRowData;
  isSolved: boolean;
  onSolved: () => void;
}) {
  const [solved, setSolved] = useState(isSolved);
  const [isSaving, setIsSaving] = useState(false);
  const [checked, setChecked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [assignmentAnswer, setAssignmentAnswer] = useState<AssignmentAnswer>(() =>
    emptyAssignmentAnswer(puzzle.puzzle_data)
  );
  const [choiceAnswer, setChoiceAnswer] = useState<string | null>(null);

  function handleToggle(boardId: string, entityId: string, optionId: string) {
    setChecked(false);
    setAssignmentAnswer((prev) => {
      const data = puzzle.puzzle_data;
      const board = data.kind === 'assignment' ? data.boards.find((b) => b.id === boardId) : undefined;
      const boardAnswer = { ...(prev[boardId] ?? {}) };

      if (board?.optionsAreUnique) {
        for (const key of Object.keys(boardAnswer)) {
          if (boardAnswer[key] === optionId) delete boardAnswer[key];
        }
      }

      if (boardAnswer[entityId] === optionId) {
        delete boardAnswer[entityId];
      } else {
        boardAnswer[entityId] = optionId;
      }

      return { ...prev, [boardId]: boardAnswer };
    });
  }

  function handleSelectChoice(optionId: string) {
    setChecked(false);
    setChoiceAnswer(optionId);
  }

  async function handleCheck() {
    const answer: LogicPuzzleAnswer =
      puzzle.puzzle_data.kind === 'assignment'
        ? { kind: 'assignment', boards: assignmentAnswer }
        : { kind: 'choice', optionId: choiceAnswer };

    const correct = checkLogicPuzzle(puzzle.puzzle_data, puzzle.solution, answer);
    setChecked(true);
    setWasCorrect(correct);

    if (!correct || solved) return;
    setSolved(true);
    setIsSaving(true);
    try {
      await completeLogicPuzzle(puzzle.id, lessonId);
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
        <h3 className="text-lg font-bold text-brand-beige">{puzzle.title}</h3>
        {puzzle.narrative && (
          <div className="text-sm text-[#9c9c94] mt-1 italic">
            <MarkdownContent content={puzzle.narrative} />
          </div>
        )}
        <div className="text-sm text-brand-beige font-semibold mt-2">
          <MarkdownContent content={puzzle.prompt} />
        </div>
      </div>

      {puzzle.puzzle_data.kind === 'assignment' ? (
        <AssignmentBoard boards={puzzle.puzzle_data.boards} answer={assignmentAnswer} onToggle={handleToggle} />
      ) : (
        <ChoiceCard options={puzzle.puzzle_data.options} selected={choiceAnswer} onSelect={handleSelectChoice} />
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleCheck}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-brand-mint text-[#0f1a15] hover:brightness-110 transition-colors"
        >
          Comprobar
        </button>
        {checked && (
          <span className={`text-sm font-bold ${wasCorrect ? 'text-brand-mint' : 'text-brand-salmon'}`}>
            {wasCorrect
              ? solved && isSaving
                ? 'Guardando...'
                : 'Correcto. Esta pieza queda resuelta.'
              : 'Todavía no cuadra con la evidencia. Revisa de nuevo.'}
          </span>
        )}
      </div>

      {checked && puzzle.explanation && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            wasCorrect
              ? 'border-brand-mint/30 bg-brand-mint/10 text-brand-beige'
              : 'border-brand-salmon/30 bg-brand-salmon/10 text-brand-beige'
          }`}
        >
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${wasCorrect ? 'text-brand-mint' : 'text-brand-salmon'}`}>
            {wasCorrect ? 'Por qué es correcto' : 'Por qué no cuadra'}
          </p>
          <MarkdownContent content={puzzle.explanation} />
        </div>
      )}

      {puzzle.hint && !solved && (
        <details className="text-xs text-[#6f6f68]">
          <summary className="cursor-pointer font-bold hover:text-brand-mint">Pista</summary>
          <p className="mt-1">{puzzle.hint}</p>
        </details>
      )}
    </div>
  );
}
