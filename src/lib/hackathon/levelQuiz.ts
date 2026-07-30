export type LevelQuizOption = {
  label: string;
  // Puntos que suma esta opción hacia cada nivel, indexados por level_id.
  scores: Record<string, number>;
};

export type LevelQuizQuestionRow = {
  id: string;
  options: LevelQuizOption[];
};

export type LevelQuizAnswer = {
  questionId: string;
  optionIndex: number;
};

// El puntaje SIEMPRE se calcula aquí, server-side, a partir de las preguntas
// guardadas en la base (mismo criterio que scoreLessonQuiz en lessonQuiz.ts).
// El cliente solo manda qué opción eligió por pregunta, nunca un puntaje.
export function scoreLevelQuiz(
  questions: LevelQuizQuestionRow[],
  answers: LevelQuizAnswer[]
): { totals: Record<string, number>; suggestedLevelId: string | null } {
  const totals: Record<string, number> = {};

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    const option = question?.options[answer.optionIndex];
    if (!option) continue;

    for (const [levelId, points] of Object.entries(option.scores)) {
      totals[levelId] = (totals[levelId] ?? 0) + points;
    }
  }

  let suggestedLevelId: string | null = null;
  let best = -Infinity;
  for (const [levelId, total] of Object.entries(totals)) {
    if (total > best) {
      best = total;
      suggestedLevelId = levelId;
    }
  }

  return { totals, suggestedLevelId };
}
