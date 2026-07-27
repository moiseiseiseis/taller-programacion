'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, History, PartyPopper } from 'lucide-react';
import { submitLessonQuiz } from '../../actions';
import { getLessonQuizMaxScore, type LessonQuiz, type LessonQuizAnswer, type LessonQuizQuestion } from '@/lib/lessonQuiz';
import PyodideCodeRunner from '@/components/python/PyodideCodeRunner';

type QuizAttempt = {
  score: number;
  passed: boolean;
  created_at: string;
};

// Si la pregunta tiene variantes (mismo concepto, distinto dato), elige una
// al azar para este intento — así un reintento no muestra literalmente la
// misma pregunta y desalienta memorizar la respuesta.
function pickVariantIndex(question: LessonQuizQuestion): number | null {
  if (!question.variants || question.variants.length === 0) return null;
  return Math.floor(Math.random() * question.variants.length);
}

function getEffectiveQuestion(question: LessonQuizQuestion, variantIndex: number | null) {
  if (question.kind === 'code') {
    const variant = variantIndex != null ? question.variants?.[variantIndex] : undefined;
    return {
      kind: 'code' as const,
      text: variant?.text ?? question.text,
      starterCode: variant?.starterCode ?? question.starterCode,
      testSpec: variant?.testSpec ?? question.testSpec,
    };
  }
  const variant = variantIndex != null ? question.variants?.[variantIndex] : undefined;
  return {
    kind: 'mc' as const,
    text: variant?.text ?? question.text,
    options: variant?.options ?? question.options,
  };
}

export default function LessonQuizGate({
  lessonId,
  quiz,
  initiallyPassed,
  nextLessonId,
  attempts,
}: {
  lessonId: string;
  quiz: LessonQuiz;
  initiallyPassed: boolean;
  nextLessonId: string | null;
  attempts: QuizAttempt[];
}) {
  const [variantIndexes, setVariantIndexes] = useState<(number | null)[]>(() => quiz.questions.map(pickVariantIndex));
  const [answers, setAnswers] = useState<(LessonQuizAnswer | null)[]>(quiz.questions.map(() => null));
  const [result, setResult] = useState<{ score: number; passed: boolean; results: boolean[] } | null>(null);
  const [passed, setPassed] = useState(initiallyPassed);
  const [retaking, setRetaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState(attempts);

  const allAnswered = answers.every((a) => a !== null);
  const maxScore = getLessonQuizMaxScore(quiz);

  function selectOption(qIndex: number, oIndex: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = { variantIndex: variantIndexes[qIndex] ?? undefined, index: oIndex };
      return next;
    });
  }

  function setCodeResult(qIndex: number, codePassed: boolean) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = { variantIndex: variantIndexes[qIndex] ?? undefined, passed: codePassed };
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;
    setIsSubmitting(true);
    try {
      const res = await submitLessonQuiz(lessonId, answers as LessonQuizAnswer[]);
      setResult(res);
      setAttemptHistory((prev) => [{ score: res.score, passed: res.passed, created_at: new Date().toISOString() }, ...prev]);
      if (res.passed) setPassed(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al enviar el quiz.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function startRetake() {
    setVariantIndexes(quiz.questions.map(pickVariantIndex));
    setAnswers(quiz.questions.map(() => null));
    setResult(null);
    setRetaking(true);
  }

  function clearAnswers() {
    setAnswers(quiz.questions.map(() => null));
    setResult(null);
  }

  const historyPanel = attemptHistory.length > 0 && (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setShowHistory((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9c9c94] hover:text-brand-mint transition-colors"
      >
        <History size={14} />
        {showHistory ? 'Ocultar' : 'Ver'} historial de intentos ({attemptHistory.length})
      </button>

      {showHistory && (
        <div className="mt-3 space-y-1.5">
          {attemptHistory.map((attempt, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs bg-black/20 border border-brand-terminal-border rounded-lg px-3 py-2"
            >
              <span className="text-[#9c9c94]">
                {new Date(attempt.created_at).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className={`font-bold flex items-center gap-1 ${attempt.passed ? 'text-brand-mint' : 'text-brand-salmon'}`}>
                {attempt.passed ? <Check size={12} /> : <X size={12} />}
                {attempt.score} / {maxScore}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (passed && !retaking && !result) {
    return (
      <div className="bg-brand-mint/10 border border-brand-mint/30 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-brand-mint">
            <Check size={20} />
            <p className="font-bold">Aprobaste el quiz de esta lección.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={startRetake}
              className="text-sm font-bold text-brand-mint hover:brightness-110 underline underline-offset-2 whitespace-nowrap"
            >
              Volver a intentar
            </button>
            {nextLessonId ? (
              <Link
                href={`/dashboard/student/leccion/${nextLessonId}`}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
              >
                Siguiente lección →
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-mint whitespace-nowrap">
                <PartyPopper size={16} /> ¡Completaste el taller!
              </span>
            )}
          </div>
        </div>
        {historyPanel}
      </div>
    );
  }

  return (
    <div className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-brand-beige">Quiz de la lección</h3>
          <p className="text-sm text-[#9c9c94]">
            Necesitas al menos {quiz.passScore} de {maxScore} puntos para avanzar a la siguiente lección.
          </p>
        </div>
        {retaking && (
          <button
            type="button"
            onClick={() => setRetaking(false)}
            className="text-xs font-bold text-[#9c9c94] hover:text-brand-mint whitespace-nowrap"
          >
            Cancelar
          </button>
        )}
      </div>

      {result && (
        <div
          className={`mb-6 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
            result.passed ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint' : 'bg-brand-salmon/10 border-brand-salmon/30 text-brand-salmon'
          }`}
        >
          <div className="flex items-center gap-3">
            {result.passed ? <Check size={18} /> : <X size={18} />}
            <p className="text-sm font-bold">
              {result.passed
                ? `Aprobaste con ${result.score} de ${maxScore}. Revisa abajo qué preguntas estuvieron bien y cuáles mal.`
                : `Sacaste ${result.score} de ${maxScore}. Todavía no alcanza — revisa las preguntas marcadas abajo e intenta de nuevo.`}
            </p>
          </div>
          {result.passed &&
            (nextLessonId ? (
              <Link
                href={`/dashboard/student/leccion/${nextLessonId}`}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
              >
                Siguiente lección →
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-mint whitespace-nowrap">
                <PartyPopper size={16} /> ¡Completaste el taller!
              </span>
            ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((question, qIndex) => {
          const effective = getEffectiveQuestion(question, variantIndexes[qIndex]);
          const answer = answers[qIndex];
          const questionResult = result ? result.results[qIndex] : null;

          return (
            <div key={qIndex}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-bold text-brand-beige">{qIndex + 1}. {effective.text}</p>
                {questionResult !== null && (
                  <span
                    className={`inline-flex items-center gap-1 shrink-0 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                      questionResult
                        ? 'bg-brand-mint/10 text-brand-mint'
                        : 'bg-brand-salmon/10 text-brand-salmon'
                    }`}
                  >
                    {questionResult ? <Check size={12} /> : <X size={12} />}
                    {questionResult ? 'Correcta' : 'Incorrecta'}
                  </span>
                )}
              </div>

              {effective.kind === 'code' ? (
                <PyodideCodeRunner
                  starterCode={effective.starterCode}
                  testSpec={effective.testSpec}
                  onResult={(codePassed) => setCodeResult(qIndex, codePassed)}
                />
              ) : (
                <div className="space-y-2">
                  {effective.options.map((option, oIndex) => (
                    <label
                      key={oIndex}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors text-sm text-[#c8c8c0] ${
                        answer && 'index' in answer && answer.index === oIndex
                          ? 'border-brand-mint bg-brand-mint/10'
                          : 'border-brand-terminal-border hover:border-brand-mint/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${qIndex}`}
                        checked={!!answer && 'index' in answer && answer.index === oIndex}
                        onChange={() => selectOption(qIndex, oIndex)}
                        className="accent-brand-mint"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {!result?.passed && (
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!allAnswered || isSubmitting}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar respuestas'}
            </button>
            {result && (
              <button
                type="button"
                onClick={clearAnswers}
                className="text-sm font-bold text-[#9c9c94] hover:text-brand-mint"
              >
                Limpiar respuestas
              </button>
            )}
          </div>
        )}
      </form>

      {historyPanel}
    </div>
  );
}
