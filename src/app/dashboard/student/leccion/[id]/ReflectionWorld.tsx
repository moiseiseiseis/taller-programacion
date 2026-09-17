'use client';

import MarkdownContent from '@/components/lessons/MarkdownContent';
import ExerciseInstructions from '@/components/lessons/ExerciseInstructions';
import ReflectionExercise from '@/components/metacog/ReflectionExercise';
import { saveReflectionResponse } from '../../actions';
import type { AnyMetacogConfig, AnyMetacogResponse, MetacogKind } from '@/lib/metacog/types';
import type { LogicPuzzleData, LogicPuzzleSolution } from '@/lib/logicPuzzle/types';

const METACOG_INSTRUCTIONS: Record<MetacogKind, string[]> = {
  diagnostic: [
    'Escribe en el cuadro de texto, con tus propias palabras, cómo estudias o resuelves problemas actualmente.',
    'No hay respuesta correcta: es un diagnóstico de partida que vas a poder comparar más adelante en el taller.',
    'Presiona "Guardar respuesta" cuando termines de escribir.',
  ],
  embedded_challenge: [
    'Resuelve el acertijo igual que en el taller de Lógica: haz clic para marcar tu respuesta y presiona "Comprobar".',
    'Después de comprobarlo (te haya salido bien o no), responde la reflexión sobre si te alejaste del problema y qué cambió al volver.',
    'Presiona "Guardar respuesta" para guardar tanto el resultado del acertijo como tu reflexión.',
  ],
  comparison: [
    'Completa los dos cuadros de texto describiendo cada método o enfoque que se te pide comparar.',
    'En el tercer cuadro, escribe qué diferencia notaste entre ambos.',
    'Presiona "Guardar respuesta" cuando termines.',
  ],
  applied_reference: [
    'Elige la lección a la que se refiere este ejercicio con el selector de lecciones.',
    'Escribe tus propias preguntas de recuperación activa sobre esa lección; usa "+ agregar pregunta" para sumar más.',
    'Marca la casilla "la recordé sin mirar" en cada pregunta que hayas podido responder de memoria.',
    'Cierra con tu reflexión y presiona "Guardar respuesta".',
  ],
  spaced_calendar: [
    'Escribe el tema que vas a repasar y, si corresponde, elige la lección relacionada con el selector.',
    'El calendario de repaso ya viene generado con las fechas sugeridas; marca cada casilla a medida que completes ese repaso.',
    'Presiona "Guardar respuesta" para guardar tu avance; puedes volver más adelante y marcar las fechas que falten.',
  ],
  interleaved_set: [
    'Para cada escenario, selecciona la opción que consideres correcta marcando el círculo correspondiente.',
    'Al terminar todos los escenarios, responde la reflexión sobre si se sintió más difícil que practicar un solo tipo de problema seguido.',
    'Presiona "Guardar respuesta" cuando termines.',
  ],
  elaboration: [
    'Explica el concepto en el primer cuadro como si se lo estuvieras enseñando a alguien que no sabe nada del tema.',
    'En el segundo cuadro, identifica el punto exacto en el que te trabaste al explicarlo.',
    'Presiona "Guardar respuesta" cuando termines.',
  ],
  calibration: [
    'Elige el examen o reto que vas a predecir con el selector.',
    'Escribe el puntaje que crees que vas a sacar y marca si crees que vas a aprobar o no.',
    'Si ya hay un resultado real disponible, lo vas a ver debajo de tu predicción para compararlo.',
    'Cierra con tu reflexión sobre qué tan cerca estuvo tu predicción y presiona "Guardar respuesta".',
  ],
  integration: [
    'Si ya completaste el diagnóstico inicial del taller, lo vas a ver arriba como referencia.',
    'Escribe tu plan de estudio en el cuadro de texto.',
    'Marca (haciendo clic) las técnicas que usaste explícitamente en tu plan; puedes seleccionar varias.',
    'Presiona "Guardar respuesta" cuando termines.',
  ],
};

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

      <ExerciseInstructions items={METACOG_INSTRUCTIONS[exercise.kind] ?? []} />

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
