import type { PythonTestSpec } from './pythonTestSpec';

export type LessonQuizOption = {
  label: string;
  score: number;
};

export type LessonQuizMcQuestion = {
  kind?: 'mc';
  text: string;
  options: LessonQuizOption[];
  // Preguntas equivalentes (mismo concepto, distinto dato) para que un
  // reintento del quiz no muestre literalmente la misma pregunta.
  variants?: { text: string; options: LessonQuizOption[] }[];
};

export type LessonQuizCodeQuestion = {
  kind: 'code';
  text: string;
  starterCode: string;
  testSpec: PythonTestSpec;
  score: number;
  variants?: { text: string; starterCode: string; testSpec: PythonTestSpec }[];
};

export type LessonQuizQuestion = LessonQuizMcQuestion | LessonQuizCodeQuestion;

export type LessonQuiz = {
  passScore: number;
  questions: LessonQuizQuestion[];
};

// Lo que manda el cliente por pregunta. index es la opción elegida (mc);
// passed es el resultado de correr el test_spec en Pyodide (code). variantIndex
// identifica qué variante se le mostró al alumno, para que el servidor sepa
// contra qué opciones/testSpec puntuar (cada variante puede tener la
// respuesta correcta en una posición distinta).
export type LessonQuizAnswer =
  | { variantIndex?: number; index: number }
  | { variantIndex?: number; passed: boolean };

function resolveMcOptions(question: LessonQuizMcQuestion, variantIndex: number | undefined): LessonQuizOption[] {
  if (variantIndex != null && question.variants?.[variantIndex]) {
    return question.variants[variantIndex].options;
  }
  return question.options;
}

// El puntaje SIEMPRE se calcula acá, server-side, a partir del quiz guardado
// en la base. Para opción múltiple, el índice elegido se valida contra las
// opciones reales de la variante mostrada (el cliente no puede inventar un
// score). Para preguntas de código, Pyodide corrió en el navegador del
// alumno y no hay forma de re-ejecutarlo en el servidor sin reimplementar
// Python ahí; se confía en el pasa/no-pasa que reportó el cliente (mismo
// nivel de confianza que ya se usa en el resto de la plataforma, p. ej. el
// minijuego de terminal), pero el puntaje en sí sigue siendo el que define
// el quiz, nunca uno que mande el cliente.
export function scoreLessonQuiz(
  quiz: LessonQuiz,
  answers: LessonQuizAnswer[]
): { score: number; passed: boolean; results: boolean[] } {
  let score = 0;
  const results: boolean[] = [];

  quiz.questions.forEach((question, i) => {
    const answer = answers[i];
    if (!answer) {
      results.push(false);
      return;
    }

    if (question.kind === 'code') {
      const correct = 'passed' in answer && answer.passed;
      if (correct) score += question.score;
      results.push(correct);
      return;
    }

    if ('index' in answer) {
      const options = resolveMcOptions(question, answer.variantIndex);
      const option = options[answer.index];
      const optionScore = option ? option.score : 0;
      const maxOptionScore = Math.max(0, ...options.map((o) => o.score));
      score += optionScore;
      results.push(maxOptionScore > 0 && optionScore >= maxOptionScore);
      return;
    }

    results.push(false);
  });

  return { score, passed: score >= quiz.passScore, results };
}

export function getLessonQuizMaxScore(quiz: LessonQuiz): number {
  return quiz.questions.reduce((sum, q) => {
    if (q.kind === 'code') return sum + q.score;
    return sum + Math.max(0, ...q.options.map((o) => o.score));
  }, 0);
}
