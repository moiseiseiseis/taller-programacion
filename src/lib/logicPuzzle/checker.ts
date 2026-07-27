import type { LogicPuzzleAnswer, LogicPuzzleData, LogicPuzzleSolution } from './types';

export function checkLogicPuzzle(
  data: LogicPuzzleData,
  solution: LogicPuzzleSolution,
  answer: LogicPuzzleAnswer
): boolean {
  if (data.kind === 'choice' || solution.kind === 'choice' || answer.kind === 'choice') {
    if (data.kind !== 'choice' || solution.kind !== 'choice' || answer.kind !== 'choice') return false;
    return answer.optionId !== null && answer.optionId === solution.optionId;
  }

  return data.boards.every((board) => {
    const solvedBoard = solution.boards[board.id];
    const answeredBoard = answer.boards[board.id];
    if (!solvedBoard || !answeredBoard) return false;
    return board.entities.every((entity) => answeredBoard[entity.id] === solvedBoard[entity.id]);
  });
}
