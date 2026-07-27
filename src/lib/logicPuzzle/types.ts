export type AssignmentBoard = {
  id: string;
  title?: string;
  entities: { id: string; label: string }[];
  options: { id: string; label: string }[];
  // true = cada opción la puede usar como máximo una entidad (orden/permutación).
  // false/undefined = una opción la pueden compartir varias entidades (agrupación, veredicto de testigo).
  optionsAreUnique?: boolean;
};

export type LogicPuzzleData =
  | { kind: 'assignment'; boards: AssignmentBoard[] }
  | { kind: 'choice'; options: { id: string; label: string }[] };

export type LogicPuzzleSolution =
  | { kind: 'assignment'; boards: Record<string, Record<string, string>> }
  | { kind: 'choice'; optionId: string };

export type AssignmentAnswer = Record<string, Record<string, string>>;

export type LogicPuzzleAnswer =
  | { kind: 'assignment'; boards: AssignmentAnswer }
  | { kind: 'choice'; optionId: string | null };
