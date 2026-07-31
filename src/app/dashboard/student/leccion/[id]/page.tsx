import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { PartyPopper } from 'lucide-react';
import StudentCodeEditor from './StudentCodeEditor';
import LessonSteps from './LessonSteps';
import LessonQuizGate from './LessonQuizGate';
import MarkCompleteButton from './MarkCompleteButton';
import TerminalWorld, { type TerminalLevelData } from './TerminalWorld';
import PythonWorld, { type PythonExerciseData } from './PythonWorld';
import LogicPuzzleWorld, { type LogicPuzzleRowData } from './LogicPuzzleWorld';
import ReflectionWorld, { type MetacogExerciseData } from './ReflectionWorld';
import AlgorithmiaWorld, { type AlgorithmiaExerciseData } from './AlgorithmiaWorld';
import { getOrderedLessons, getNextLessonId, getFirstLockedLessonId } from '@/lib/lessonSequence';
import { getLessonQuizMaxScore, type LessonQuiz } from '@/lib/lessonQuiz';
import type { LogicPuzzleData, LogicPuzzleSolution } from '@/lib/logicPuzzle/types';
import { getYouTubeEmbedUrl } from '@/lib/media';

// Diccionario visual para los colores de las categoríasIgual que el del instructor)
const categoryStyles: Record<string, { label: string, color: string }> = {
  hardware: { label: 'Hardware', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  software: { label: 'Software', color: 'bg-brand-steel/10 text-brand-steel border-brand-steel/30' },
  language: { label: 'Lenguaje', color: 'bg-brand-mint/10 text-brand-mint border-brand-mint/30' },
};

export default async function StudentLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Buscamos la lección
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, modules(id, workshop_id, title)')
    .eq('id', id)
    .single();

  if (!lesson) notFound();

  // 1.5. Calculamos la secuencia del taller para saber si esta lección está
  // desbloqueada (no hay quizzes anteriores sin aprobar) y cuál es la siguiente.
  const workshopId = lesson.modules?.workshop_id;
  const orderedLessons = workshopId ? await getOrderedLessons(supabase, workshopId) : [];

  const { data: passedAttempts } = await supabase
    .from('lesson_quiz_attempts')
    .select('lesson_id')
    .eq('user_id', user?.id)
    .eq('passed', true);
  const passedLessonIds = new Set((passedAttempts ?? []).map((a: { lesson_id: string }) => a.lesson_id));

  const lockedLessonId = getFirstLockedLessonId(orderedLessons, id, passedLessonIds);
  if (lockedLessonId) {
    redirect(`/dashboard/student/leccion/${lockedLessonId}`);
  }

  const nextLessonId = getNextLessonId(orderedLessons, id);

  // 1.6. Progreso general (para checkmarks y para saber si esta lección ya
  // fue completada) y, si tiene quiz, el historial de intentos de este alumno.
  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('user_id', user?.id);
  const completedLessonIds = new Set((completions ?? []).map((c: { lesson_id: string }) => c.lesson_id));

  const { data: quizAttempts } = lesson.quiz
    ? await supabase
        .from('lesson_quiz_attempts')
        .select('score, passed, created_at')
        .eq('lesson_id', id)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
    : { data: null };

  // 2. Buscamos el contenido dependiendo del tipo
  let practice = null;
  let submission = null;
  let theory = null;

  if (lesson.type === 'practice' || lesson.type === 'challenge') {
    const { data: p } = await supabase.from('practices').select('*').eq('lesson_id', id).maybeSingle();
    practice = p;
    if (practice) {
      const { data: s } = await supabase.from('submissions').select('*').eq('practice_id', practice.id).eq('user_id', user?.id).maybeSingle();
      submission = s;
    }
  } else if (lesson.type === 'theory') {
    const { data: t } = await supabase.from('theory_contents').select('*').eq('lesson_id', id).maybeSingle();
    theory = t;
  }

  // 2.5. Si es una lección de minijuego de terminal, traemos sus niveles y
  // cuáles ya resolvió este alumno.
  let terminalLevels: TerminalLevelData[] = [];
  let solvedLevelIds: string[] = [];
  if (lesson.type === 'terminal') {
    const { data: levels } = await supabase
      .from('terminal_levels')
      .select('*')
      .eq('lesson_id', id)
      .order('order_index', { ascending: true });
    terminalLevels = levels || [];

    if (terminalLevels.length > 0) {
      const { data: progress } = await supabase
        .from('terminal_level_progress')
        .select('level_id')
        .eq('user_id', user?.id)
        .in('level_id', terminalLevels.map((l) => l.id));
      solvedLevelIds = (progress || []).map((p: { level_id: string }) => p.level_id);
    }
  }

  // 2.6. Si es una lección de Python, traemos sus ejercicios y cuáles ya
  // resolvió este alumno.
  let pythonExercises: PythonExerciseData[] = [];
  let solvedExerciseIds: string[] = [];
  if (lesson.type === 'python') {
    const { data: exercises } = await supabase
      .from('python_exercises')
      .select('*')
      .eq('lesson_id', id)
      .order('order_index', { ascending: true });
    pythonExercises = exercises || [];

    if (pythonExercises.length > 0) {
      const { data: progress } = await supabase
        .from('python_exercise_progress')
        .select('exercise_id')
        .eq('user_id', user?.id)
        .in('exercise_id', pythonExercises.map((ex) => ex.id));
      solvedExerciseIds = (progress || []).map((p: { exercise_id: string }) => p.exercise_id);
    }
  }

  // 2.7. Si es una lección de acertijos de lógica, traemos sus piezas y
  // cuáles ya resolvió este alumno.
  let logicPuzzles: LogicPuzzleRowData[] = [];
  let solvedPuzzleIds: string[] = [];
  if (lesson.type === 'logic') {
    const { data: puzzlesData } = await supabase
      .from('logic_puzzles')
      .select('*')
      .eq('lesson_id', id)
      .order('order_index', { ascending: true });
    logicPuzzles = puzzlesData || [];

    if (logicPuzzles.length > 0) {
      const { data: progress } = await supabase
        .from('logic_puzzle_progress')
        .select('puzzle_id')
        .eq('user_id', user?.id)
        .in('puzzle_id', logicPuzzles.map((p) => p.id));
      solvedPuzzleIds = (progress || []).map((p: { puzzle_id: string }) => p.puzzle_id);
    }
  }

  // 2.8. Si es una lección de ejercicio reflexivo (Metacognición), traemos
  // el ejercicio, la respuesta ya guardada (si hay), la lista de lecciones
  // de otros talleres para referenciar, y datos extra según el tipo de
  // ejercicio (el acertijo embebido, el diagnóstico de la Unidad 1, o el
  // resultado real de un quiz para calibración).
  let metacogExercise: MetacogExerciseData | null = null;
  let metacogSubmission: { response: unknown; referenced_lesson_id: string | null } | null = null;
  let availableLessons: { id: string; label: string }[] = [];
  let embeddedPuzzle: { id: string; puzzle_data: LogicPuzzleData; solution: LogicPuzzleSolution; title: string; prompt: string } | null = null;
  let diagnosticText: string | null = null;
  let actualQuizResult: { score: number; maxScore: number; passed: boolean } | null = null;

  if (lesson.type === 'reflection') {
    const { data: exerciseData } = await supabase
      .from('metacog_exercises')
      .select('*')
      .eq('lesson_id', id)
      .maybeSingle();
    metacogExercise = exerciseData;

    if (metacogExercise) {
      const { data: submissionData } = await supabase
        .from('metacog_submissions')
        .select('response, referenced_lesson_id')
        .eq('exercise_id', metacogExercise.id)
        .eq('user_id', user?.id)
        .maybeSingle();
      metacogSubmission = submissionData;

      type OtherLessonRow = {
        id: string;
        title: string;
        modules: { title: string; workshops: { title: string; id: string } | null } | null;
      };
      const { data: otherLessons } = await supabase
        .from('lessons')
        .select('id, title, modules(title, workshops(title, id))')
        .neq('modules.workshops.id', workshopId ?? '');
      availableLessons = ((otherLessons as unknown as OtherLessonRow[]) || [])
        .filter((l) => l.modules?.workshops)
        .map((l) => ({
          id: l.id,
          label: `${l.modules!.workshops!.title} — ${l.title}`,
        }));

      if (metacogExercise.kind === 'embedded_challenge') {
        const puzzleId = (metacogExercise.config as { logicPuzzleId?: string })?.logicPuzzleId;
        if (puzzleId) {
          const { data: puzzleData } = await supabase
            .from('logic_puzzles')
            .select('id, puzzle_data, solution, title, prompt')
            .eq('id', puzzleId)
            .maybeSingle();
          embeddedPuzzle = puzzleData as typeof embeddedPuzzle;
        }
      }

      if (metacogExercise.kind === 'integration') {
        const diagnosticLessonId = (metacogExercise.config as { diagnosticLessonId?: string })?.diagnosticLessonId;
        if (diagnosticLessonId) {
          const { data: diagnosticExercise } = await supabase
            .from('metacog_exercises')
            .select('id')
            .eq('lesson_id', diagnosticLessonId)
            .maybeSingle();
          if (diagnosticExercise) {
            const { data: diagnosticSubmission } = await supabase
              .from('metacog_submissions')
              .select('response')
              .eq('exercise_id', diagnosticExercise.id)
              .eq('user_id', user?.id)
              .maybeSingle();
            diagnosticText = (diagnosticSubmission?.response as { text?: string })?.text || null;
          }
        }
      }

      if (metacogExercise.kind === 'calibration' && metacogSubmission?.referenced_lesson_id) {
        const { data: referencedLesson } = await supabase
          .from('lessons')
          .select('quiz')
          .eq('id', metacogSubmission.referenced_lesson_id)
          .maybeSingle();
        if (referencedLesson?.quiz) {
          const { data: attempt } = await supabase
            .from('lesson_quiz_attempts')
            .select('score, passed')
            .eq('lesson_id', metacogSubmission.referenced_lesson_id)
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (attempt) {
            actualQuizResult = {
              score: attempt.score,
              maxScore: getLessonQuizMaxScore(referencedLesson.quiz as LessonQuiz),
              passed: attempt.passed,
            };
          }
        }
      }
    }
  }

  // 2.9. Si es una lección de simulación de Algoritmia, traemos el
  // ejercicio y la entrega ya guardada (si hay).
  let algorithmiaExercise: AlgorithmiaExerciseData | null = null;
  let algorithmiaSubmission: { sim_result: unknown; reflection_response: string | null } | null = null;

  if (lesson.type === 'algorithm_sim') {
    const { data: exerciseData } = await supabase
      .from('algorithmia_exercises')
      .select('*')
      .eq('lesson_id', id)
      .maybeSingle();
    algorithmiaExercise = exerciseData;

    if (algorithmiaExercise) {
      const { data: submissionData } = await supabase
        .from('algorithmia_submissions')
        .select('sim_result, reflection_response')
        .eq('exercise_id', algorithmiaExercise.id)
        .eq('user_id', user?.id)
        .maybeSingle();
      algorithmiaSubmission = submissionData;
    }
  }

  // 3. Buscamos los recursos adjuntos (PDFs)
  const { data: resources } = await supabase
    .from('lesson_resources')
    .select('*')
    .eq('lesson_id', id);

  // 4. Buscamos las herramientas asignadas haciendo un JOIN con la tabla tools
  const { data: lessonTools } = await supabase
    .from('lesson_tools')
    .select(`
      tools (
        id,
        name,
        category,
        description_url
      )
    `)
    .eq('lesson_id', id);

  
  const requiredTools = lessonTools?.map((lt: any) => lt.tools).filter(Boolean) || [];
  
  const embedUrl = theory?.video_url ? getYouTubeEmbedUrl(theory.video_url) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Encabezado y Título */}
      <div>
        <Link
          href={`/dashboard/student/taller/${lesson.modules?.workshop_id}`}
          className="text-sm font-semibold text-[#9c9c94] hover:text-brand-mint mb-4 inline-block"
        >
          ← Volver al Temario
        </Link>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-[#9c9c94] mt-2">{lesson.description}</p>
        )}
      </div>

      {/* Herramientas Requeridas */}
      {requiredTools.length > 0 && (
        <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="text-sm font-bold text-brand-beige whitespace-nowrap">
            ⚙️ Requisitos para esta clase:
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredTools.map((tool: any) => (
              <a 
                key={tool.id}
                href={tool.description_url || '#'} 
                target={tool.description_url ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${categoryStyles[tool.category]?.color} ${tool.description_url ? 'hover:opacity-80' : 'cursor-default'}`}
              >
                {tool.name}
                {tool.description_url && <span className="text-[10px] opacity-70">↗</span>}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Contenido Principal (Teoría o Práctica) */}
      {lesson.type === 'theory' ? (
        theory ? (
          <div className="space-y-6">
            <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border overflow-hidden">
              {embedUrl ? (
                <div className="w-full aspect-video bg-black">
                  <iframe src={embedUrl} className="w-full h-full" allowFullScreen></iframe>
                </div>
              ) : theory?.video_url ? (
                <div className="w-full aspect-video bg-black">
                  <video src={theory.video_url} controls className="w-full h-full" />
                </div>
              ) : null}
              <div className="p-8 lg:p-12">
                <LessonSteps content={theory.content_markdown} />
              </div>
            </div>

            {/* DESCARGAS */}
            {resources && resources.length > 0 && (
              <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border p-6">
                <h3 className="font-bold text-brand-beige mb-4 flex items-center gap-2">
                  Material Complementario
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {resources.map((res: any) => (
                    <a
                      key={res.id}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-brand-terminal-border rounded-lg hover:bg-black/20 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-black/30 rounded flex items-center justify-center text-xl mr-3 group-hover:bg-black/40 transition-colors">
                        {res.resource_type === 'pdf' ? '' : ''}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-brand-beige truncate">{res.title}</p>
                        <p className="text-xs text-[#9c9c94]">Descargar</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-brand-terminal-panel p-12 rounded-2xl border border-dashed border-brand-terminal-border text-center">
            <p className="text-[#9c9c94] font-semibold">El instructor aún está redactando esta lección.</p>
          </div>
        )
      ) : lesson.type === 'terminal' ? (
        terminalLevels.length > 0 ? (
          <TerminalWorld
            lessonId={lesson.id}
            levels={terminalLevels}
            initiallyCompletedLevelIds={solvedLevelIds}
            nextLessonId={nextLessonId}
          />
        ) : (
          <div className="bg-brand-terminal-panel p-12 rounded-2xl border border-dashed border-brand-terminal-border text-center">
            <p className="text-[#9c9c94] font-semibold">El instructor aún no ha configurado los niveles de este mundo.</p>
          </div>
        )
      ) : lesson.type === 'python' ? (
        pythonExercises.length > 0 ? (
          <PythonWorld
            lessonId={lesson.id}
            exercises={pythonExercises}
            initiallyCompletedExerciseIds={solvedExerciseIds}
            quiz={lesson.quiz}
            initiallyQuizPassed={passedLessonIds.has(lesson.id)}
            quizAttempts={quizAttempts || []}
            nextLessonId={nextLessonId}
          />
        ) : (
          <div className="bg-brand-terminal-panel p-12 rounded-2xl border border-dashed border-brand-terminal-border text-center">
            <p className="text-[#9c9c94] font-semibold">El instructor aún no ha configurado los ejercicios de esta unidad.</p>
          </div>
        )
      ) : lesson.type === 'logic' ? (
        logicPuzzles.length > 0 ? (
          <LogicPuzzleWorld
            lessonId={lesson.id}
            puzzles={logicPuzzles}
            initiallyCompletedPuzzleIds={solvedPuzzleIds}
            quiz={lesson.quiz}
            initiallyQuizPassed={passedLessonIds.has(lesson.id)}
            quizAttempts={quizAttempts || []}
            nextLessonId={nextLessonId}
          />
        ) : (
          <div className="bg-brand-terminal-panel p-12 rounded-2xl border border-dashed border-brand-terminal-border text-center">
            <p className="text-[#9c9c94] font-semibold">El instructor aún no ha configurado las piezas de esta unidad.</p>
          </div>
        )
      ) : lesson.type === 'reflection' ? (
        metacogExercise ? (
          <ReflectionWorld
            lessonId={lesson.id}
            exercise={metacogExercise}
            initialResponse={metacogSubmission?.response ?? null}
            availableLessons={availableLessons}
            embeddedPuzzle={embeddedPuzzle}
            diagnosticText={diagnosticText}
            actualQuizResult={actualQuizResult}
          />
        ) : (
          <div className="bg-brand-terminal-panel p-12 rounded-2xl border border-dashed border-brand-terminal-border text-center">
            <p className="text-[#9c9c94] font-semibold">El instructor aún no ha configurado el ejercicio de esta unidad.</p>
          </div>
        )
      ) : lesson.type === 'algorithm_sim' ? (
        algorithmiaExercise ? (
          <AlgorithmiaWorld
            lessonId={lesson.id}
            exercise={algorithmiaExercise}
            initialSubmission={algorithmiaSubmission}
          />
        ) : (
          <div className="bg-brand-terminal-panel p-12 rounded-2xl border border-dashed border-brand-terminal-border text-center">
            <p className="text-[#9c9c94] font-semibold">El instructor aún no ha configurado la simulación de esta unidad.</p>
          </div>
        )
      ) : practice ? (
        <StudentCodeEditor practice={practice} submission={submission} />
      ) : (
        <div className="bg-brand-terminal-panel p-12 rounded-2xl border border-dashed border-brand-terminal-border text-center">
          <p className="text-[#9c9c94] font-semibold">El instructor aún no ha configurado esta práctica.</p>
        </div>
      )}

      {/* Avance: quiz obligatorio si la lección lo tiene, si no, botón directo.
          Las lecciones de terminal, Python y lógica manejan su propio avance
          dentro de TerminalWorld/PythonWorld/LogicPuzzleWorld (el quiz de
          Python y de lógica queda embebido ahí, recién disponible cuando se
          resuelven los ejercicios/piezas). */}
      {lesson.type === 'terminal' || lesson.type === 'python' || lesson.type === 'logic' ? null : lesson.quiz ? (
        <LessonQuizGate
          lessonId={lesson.id}
          quiz={lesson.quiz}
          initiallyPassed={passedLessonIds.has(lesson.id)}
          nextLessonId={nextLessonId}
          attempts={quizAttempts || []}
        />
      ) : lesson.type === 'theory' && !completedLessonIds.has(lesson.id) ? (
        <MarkCompleteButton lessonId={lesson.id} nextLessonId={nextLessonId} workshopId={workshopId} />
      ) : nextLessonId ? (
        <div className="flex justify-end">
          <Link
            href={`/dashboard/student/leccion/${nextLessonId}`}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
          >
            Siguiente lección →
          </Link>
        </div>
      ) : (
        <div className="text-center py-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-mint">
            <PartyPopper size={16} /> ¡Completaste el taller!
          </span>
        </div>
      )}
    </div>
  );
}