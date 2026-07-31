// Corrección pura de la clasificación "sobreajustado / generalizable".

export type OverfitExample = {
  id: string;
  text: string;
  isOverfit: boolean;
  note: string;
};

export type OverfitConfig = {
  examples: OverfitExample[];
};

export function scoreClassification(
  examples: OverfitExample[],
  answers: Record<string, boolean>
): { correct: number; total: number } {
  let correct = 0;
  for (const example of examples) {
    if (answers[example.id] === example.isOverfit) correct++;
  }
  return { correct, total: examples.length };
}
