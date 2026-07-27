'use client';

import { useState } from 'react';

type QuizOption = {
  label: string;
  score: number;
};

type QuizQuestion = {
  text: string;
  options: QuizOption[];
};

type QuizResult = {
  max: number;
  title: string;
  text: string;
};

export type QuizData = {
  questions: QuizQuestion[];
  results: QuizResult[];
};

export default function BlogQuiz({ quiz }: { quiz: QuizData }) {
  const [answers, setAnswers] = useState<(number | null)[]>(quiz.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = answers.every((a) => a !== null);

  function selectOption(questionIndex: number, score: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = score;
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;
    setSubmitted(true);
  }

  function reset() {
    setAnswers(quiz.questions.map(() => null));
    setSubmitted(false);
  }

  const total = answers.reduce((sum: number, a) => sum + (a || 0), 0);
  const result = quiz.results
    .slice()
    .sort((a, b) => a.max - b.max)
    .find((r) => total <= r.max) || quiz.results[quiz.results.length - 1];

  return (
    <div className="my-10 bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 md:p-10">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex}>
              <p className="font-sans font-bold text-brand-beige mb-3">
                {qIndex + 1}. {question.text}
              </p>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors font-sans text-sm text-[#c8c8c0] ${
                      answers[qIndex] === option.score
                        ? 'border-brand-mint bg-brand-mint/10 text-brand-beige'
                        : 'border-brand-terminal-border hover:border-brand-mint/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={answers[qIndex] === option.score}
                      onChange={() => selectOption(qIndex, option.score)}
                      className="accent-brand-mint"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={!allAnswered}
            className="inline-flex items-center justify-center px-6 py-3 font-sans font-bold text-[#0f1a15] bg-brand-mint rounded-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Ver resultado
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <span className="text-xs font-sans font-bold text-brand-salmon uppercase tracking-widest">
            Resultado
          </span>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-brand-beige">
            {result.title}
          </h3>
          <p className="font-sans text-[#9c9c94] max-w-xl mx-auto leading-relaxed">
            {result.text}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 font-sans font-bold text-sm text-brand-mint border-2 border-brand-mint rounded-xl hover:bg-brand-mint hover:text-[#0f1a15] transition-all"
          >
            Repetir el test
          </button>
        </div>
      )}
    </div>
  );
}
