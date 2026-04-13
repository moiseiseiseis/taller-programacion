import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const categoryStyles: Record<string, { label: string, color: string }> = {
  hardware: { label: 'Hardware', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  software: { label: 'Software', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  language: { label: 'Lenguaje', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export default async function StudentWorkshopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Traemos el taller con todos sus módulos y lecciones ordenadas
  const { data: workshop, error: workshopError } = await supabase
    .from('workshops')
    .select(`
      *,
      modules (
        id, title,
        lessons ( id, title, type )
      )
    `)
    .eq('id', id)
    .single();

  

  if (workshopError) {
    return (
      <div className="p-12 text-center mt-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error en la Base de Datos</h1>
        <p className="text-zinc-700 bg-red-50 p-4 rounded-lg inline-block font-mono text-sm">
          {workshopError.message}
        </p>
      </div>
    );
  }

  if (!workshop) notFound();

  // 2. LÓGICA DE HERRAMIENTAS
  const lessonIds = workshop.modules?.flatMap((m: any) => (m.lessons || []).map((l: any) => l.id)) || [];
  
  let requiredTools: any[] = [];
  
  if (lessonIds.length > 0) {
    // 3. Buscamos todas las herramientas usadas en estas lecciones
    const { data: lessonTools } = await supabase
      .from('lesson_tools')
      .select('tools(id, name, category, description_url)')
      .in('lesson_id', lessonIds);

    // 4. Limpiamos duplicados (Si 3 lecciones usan ESP32, solo mostramos uno)
    const uniqueToolsMap = new Map();
    lessonTools?.forEach((lt: any) => {
      if (lt.tools && !uniqueToolsMap.has(lt.tools.id)) {
        uniqueToolsMap.set(lt.tools.id, lt.tools);
      }
    });
    requiredTools = Array.from(uniqueToolsMap.values());
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Encabezado del Taller */}
      <div>
        <h1 className="text-4xl font-bold text-zinc-900">{workshop.title}</h1>
        <p className="text-lg text-zinc-500 mt-4">{workshop.description}</p>
      </div>



      {/* Lista de Módulos y Lecciones */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-zinc-900">Temario</h2>
        
        {workshop.modules?.map((modulo: any, index: number) => (
          <div key={modulo.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="bg-zinc-50 p-6 border-b border-zinc-200">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white font-bold text-sm">
                  {index + 1}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">{modulo.title}</h2>
                  {modulo.description && <p className="text-sm text-zinc-500 mt-1">{modulo.description}</p>}
                </div>
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              {modulo.lessons?.map((lesson: any) => (
                <Link 
                  key={lesson.id} 
                  href={`/dashboard/student/leccion/${lesson.id}`}
                  className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {lesson.type === 'theory' ? '' : lesson.type === 'practice' ? '' : ''}
                    </span>
                    <span className="font-semibold text-zinc-700 group-hover:text-black transition-colors">
                      {lesson.title}
                    </span>
                  </div>
                  <span className="text-zinc-300 group-hover:text-black transition-colors">→</span>
                </Link>
              ))}
              {modulo.lessons?.length === 0 && (
                <div className="p-6 text-center text-zinc-400 text-sm">
                  Aún no hay lecciones en este módulo.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}