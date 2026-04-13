import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PracticeForm from './PracticeForm'; 
import LessonSettings from './LessonSettings';
import TheoryEditor from './TheoryEditor'; 
import ToolSelector from './ToolSelector';

export default async function GestionarLeccionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
          className="text-sm font-semibold text-zinc-500 hover:text-black mb-4 inline-block"
        >
          ← Volver al Módulo: {lesson.modules?.title}
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-zinc-900">{lesson.title}</h1>
          <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
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

      {/* Renderizado condicional del editor principal según el tipo de lección */}
      {(lesson.type === 'practice' || lesson.type === 'challenge') ? (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="mb-6 border-b border-zinc-100 pb-4">
            <h2 className="text-xl font-bold text-zinc-900">Configuración del Ejercicio</h2>
            <p className="text-zinc-500 text-sm">Define el entorno de código para tus alumnos.</p>
          </div>

          <PracticeForm 
            lessonId={lesson.id} 
            moduleId={lesson.module_id} 
            practice={practice} 
          />
        </div>
      ) : lesson.type === 'theory' ? (
        <TheoryEditor lesson={lesson} theory={theory} />
      ) : (
        <div className="p-12 border border-dashed border-zinc-300 rounded-2xl text-center bg-white">
          <p className="text-zinc-500 font-semibold text-lg">Tipo de lección no reconocido.</p>
        </div>
      )}
    </div>
  );
}