import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PracticeForm from './PracticeForm';
import LessonSettings from './LessonSettings';
import TheoryEditor from './TheoryEditor';
import ToolSelector from './ToolSelector';
import LessonQuizEditor from './LessonQuizEditor';
import PythonExercisesEditor from './PythonExercisesEditor';
import TerminalLevelsEditor from './TerminalLevelsEditor';
import LogicPuzzlesEditor from './LogicPuzzlesEditor';
import ReflectionExerciseEditor from './ReflectionExerciseEditor';
import AlgorithmiaExerciseEditor from './AlgorithmiaExerciseEditor';

export default async function GestionarLeccionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { user } = await getAuthUser();

  // Traemos la lección y cruzamos datos
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, modules(id, title)')
    .eq('id', id)
    .single();

  if (!lesson) notFound();

  // Traemos la práctica asociada (si es que ya existe)
  const { data: practice } = await supabase
    .from('practices')
    .select('*')
    .eq('lesson_id', id)
    .maybeSingle();

  //Traemos el contenido teórico (si es que ya existe y si es una lección de teoría)
  let theory = null;
  if (lesson.type === 'theory') {
    const { data: theoryData } = await supabase
      .from('theory_contents')
      .select('*')
      .eq('lesson_id', id)
      .maybeSingle();
    
    theory = theoryData;
  }

  // Traemos los niveles del minijuego de terminal (si aplica)
  let terminalLevels: {
    id: string;
    order_index: number;
    title: string;
    narrative: string | null;
    goal: string;
    filesystem: unknown;
    validator: unknown;
    hint: string | null;
  }[] = [];
  if (lesson.type === 'terminal') {
    const { data } = await supabase
      .from('terminal_levels')
      .select('*')
      .eq('lesson_id', id)
      .order('order_index', { ascending: true });
    terminalLevels = data || [];
  }

  // Traemos los ejercicios de Python (si aplica)
  let pythonExercises: {
    id: string;
    order_index: number;
    kind: string;
    title: string;
    prompt: string;
    starter_code: string;
    test_spec: unknown;
    hint: string | null;
  }[] = [];
  if (lesson.type === 'python') {
    const { data } = await supabase
      .from('python_exercises')
      .select('*')
      .eq('lesson_id', id)
      .order('order_index', { ascending: true });
    pythonExercises = data || [];
  }

  // Traemos las piezas del expediente (si aplica)
  let logicPuzzles: {
    id: string;
    order_index: number;
    kind: string;
    title: string;
    narrative: string | null;
    prompt: string;
    puzzle_data: unknown;
    solution: unknown;
    hint: string | null;
    explanation: string | null;
  }[] = [];
  if (lesson.type === 'logic') {
    const { data } = await supabase
      .from('logic_puzzles')
      .select('*')
      .eq('lesson_id', id)
      .order('order_index', { ascending: true });
    logicPuzzles = data || [];
  }

  // Traemos el ejercicio reflexivo (si aplica)
  let metacogExercise: {
    id: string;
    kind: string;
    title: string;
    prompt: string;
    config: unknown;
    hint: string | null;
  } | null = null;
  if (lesson.type === 'reflection') {
    const { data } = await supabase
      .from('metacog_exercises')
      .select('*')
      .eq('lesson_id', id)
      .maybeSingle();
    metacogExercise = data;
  }

  // Traemos la simulación de Algoritmia (si aplica)
  let algorithmiaExercise: {
    id: string;
    kind: string;
    title: string;
    dilemma: string;
    theory: string;
    config: unknown;
    reflection_prompt: string;
    explanation: string | null;
    hint: string | null;
  } | null = null;
  if (lesson.type === 'algorithm_sim') {
    const { data } = await supabase
      .from('algorithmia_exercises')
      .select('*')
      .eq('lesson_id', id)
      .maybeSingle();
    algorithmiaExercise = data;
  }

  // Traemos el inventario de herramientas del instructor
  const { data: availableTools } = await supabase
    .from('tools')
    .select('*')
    .eq('created_by', user?.id);

  // Traemos las herramientas que  están asignadas a esta lección
  const { data: assignedTools } = await supabase
    .from('lesson_tools')
    .select('tool_id')
    .eq('lesson_id', id);
  
  
  const initialSelectedTools = assignedTools?.map(at => at.tool_id) || [];


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <Link
          href={`/dashboard/instructor/modulo/${lesson.module_id}`}
          className="text-sm font-semibold text-[#9c9c94] hover:text-brand-mint mb-4 inline-block"
        >
          ← Volver al Módulo: {lesson.modules?.title}
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="font-mono text-3xl font-bold text-brand-beige">{lesson.title}</h1>
          <span className="bg-brand-mint text-[#0f1a15] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {lesson.type}
          </span>
        </div>
      </div>

      {/* Ajustes Generales de la Lección */}
      <LessonSettings lesson={lesson} />

      {/* selector de Herramientas */}
      <ToolSelector
        lessonId={lesson.id}
        availableTools={availableTools || []}
        initialSelected={initialSelectedTools}
      />

      {/* Quiz obligatorio para avanzar a la siguiente lección */}
      <LessonQuizEditor lessonId={lesson.id} quiz={lesson.quiz} />

      {/* Renderizado condicional del editor principal según el tipo de lección */}
      {(lesson.type === 'practice' || lesson.type === 'challenge') ? (
        <div className="bg-brand-terminal-panel p-8 rounded-2xl border border-brand-terminal-border">
          <div className="mb-6 border-b border-brand-terminal-border pb-4">
            <h2 className="text-xl font-bold text-brand-beige">Configuración del Ejercicio</h2>
            <p className="text-[#9c9c94] text-sm">Define el entorno de código para tus alumnos.</p>
          </div>

          <PracticeForm
            lessonId={lesson.id}
            moduleId={lesson.module_id}
            practice={practice}
          />
        </div>
      ) : lesson.type === 'theory' ? (
        <TheoryEditor lesson={lesson} theory={theory} />
      ) : lesson.type === 'terminal' ? (
        <TerminalLevelsEditor lessonId={lesson.id} levels={terminalLevels} />
      ) : lesson.type === 'python' ? (
        <PythonExercisesEditor lessonId={lesson.id} exercises={pythonExercises} />
      ) : lesson.type === 'logic' ? (
        <LogicPuzzlesEditor lessonId={lesson.id} puzzles={logicPuzzles} />
      ) : lesson.type === 'reflection' ? (
        <ReflectionExerciseEditor lessonId={lesson.id} exercise={metacogExercise} />
      ) : lesson.type === 'algorithm_sim' ? (
        <AlgorithmiaExerciseEditor lessonId={lesson.id} exercise={algorithmiaExercise} />
      ) : (
        <div className="p-12 border border-dashed border-brand-terminal-border rounded-2xl text-center bg-brand-terminal-panel">
          <p className="text-[#9c9c94] font-semibold text-lg">Tipo de lección no reconocido.</p>
        </div>
      )}
    </div>
  );
}