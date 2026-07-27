export type MetacogKind =
  | 'diagnostic'
  | 'embedded_challenge'
  | 'comparison'
  | 'applied_reference'
  | 'spaced_calendar'
  | 'interleaved_set'
  | 'elaboration'
  | 'calibration'
  | 'integration';

export type DiagnosticConfig = Record<string, never>;
export type DiagnosticResponse = { text: string };

export type EmbeddedChallengeConfig = { logicPuzzleId: string; focusedMinutes: number };
export type EmbeddedChallengeResponse = { solved: boolean; reflection: string };

export type ComparisonConfig = { labelA: string; labelB: string };
export type ComparisonResponse = { a: string; b: string; reflection: string };

export type AppliedReferenceConfig = Record<string, never>;
export type AppliedReferenceResponse = {
  referencedLessonId: string | null;
  items: { question: string; recalledWithoutLooking: boolean }[];
  reflection: string;
};

export type SpacedCalendarConfig = Record<string, never>;
export type SpacedCalendarResponse = {
  topic: string;
  referencedLessonId: string | null;
  intervals: { dueDate: string; done: boolean }[];
};

export type InterleavedSetConfig = {
  items: { id: string; scenario: string; options: { id: string; label: string }[] }[];
};
export type InterleavedSetResponse = { answers: Record<string, string>; reflection: string };

export type ElaborationConfig = Record<string, never>;
export type ElaborationResponse = { explanation: string; stuckPoint: string };

export type CalibrationConfig = Record<string, never>;
export type CalibrationResponse = {
  referencedLessonId: string | null;
  predictedScore: number | null;
  predictedPassed: boolean | null;
  reflection: string;
};

export type IntegrationConfig = { diagnosticLessonId: string };
export type IntegrationResponse = { plan: string; techniquesUsed: string[] };

export type MetacogConfig =
  | DiagnosticConfig
  | EmbeddedChallengeConfig
  | ComparisonConfig
  | AppliedReferenceConfig
  | SpacedCalendarConfig
  | InterleavedSetConfig
  | ElaborationConfig
  | CalibrationConfig
  | IntegrationConfig;

export type MetacogResponse =
  | DiagnosticResponse
  | EmbeddedChallengeResponse
  | ComparisonResponse
  | AppliedReferenceResponse
  | SpacedCalendarResponse
  | InterleavedSetResponse
  | ElaborationResponse
  | CalibrationResponse
  | IntegrationResponse;

// Unión "aplanada" de todas las formas posibles de config/response, para los
// componentes genéricos que renderizan según `kind` sin poder discriminar el
// tipo en tiempo de compilación (el kind llega por separado, como prop).
export type AnyMetacogConfig = Partial<
  EmbeddedChallengeConfig & ComparisonConfig & InterleavedSetConfig & IntegrationConfig
>;

export type AnyMetacogResponse = Partial<
  DiagnosticResponse &
    EmbeddedChallengeResponse &
    ComparisonResponse &
    AppliedReferenceResponse &
    SpacedCalendarResponse &
    InterleavedSetResponse &
    ElaborationResponse &
    CalibrationResponse &
    IntegrationResponse
>;

export const METACOG_TECHNIQUES = [
  'Modo enfocado/difuso',
  'Fragmentación (chunking)',
  'Evitar ilusiones de competencia',
  'Práctica de recuperación',
  'Práctica espaciada',
  'Intercalado',
  'Elaboración/generación',
  'Calibración',
] as const;
