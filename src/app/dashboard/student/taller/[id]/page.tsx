import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, Lock, BookOpen, Code2, Trophy } from 'lucide-react';
import { getOrderedLessons, getLockedLessonIds, calculateProgress } from '@/lib/lessonSequence';
import { urlKind } from '@/lib/media';

const categoryStyles: Record<string, { label: string, color: string }> = {
  hardware: { label: 'Hardware', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  software: { label: 'Software', color: 'bg-brand-steel/10 text-brand-steel border-brand-steel/30' },
  language: { label: 'Lenguaje', color: 'bg-brand-mint/10 text-brand-mint border-brand-mint/30' },
};

export default async function StudentWorkshopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Traemos el taller con todos sus módulos y lecciones ordenadas
  const { data: workshop, error: workshopError } = await supabase
    .from('workshops')
    .select(`
      *,
      modules (
        id, title, order_index, cover_url,
        lessons ( id, title, type, order_index )
      )
    `)
    .eq('id', id)
    .single();



  if (workshopError) {
    return (
      <div className="p-12 text-center mt-10">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Error en la Base de Datos</h1>
        <p className="text-red-300 bg-red-500/10 p-4 rounded-lg inline-block font-mono text-sm">
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

  // 5. Progreso: ordenamos las lecciones del taller y cruzamos con lo que
  // este alumno ya completó / ya desbloqueó vía quizzes aprobados.
  const orderedLessons = await getOrderedLessons(supabase, id);

  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('user_id', user?.id);
  const completedLessonIds = new Set((completions ?? []).map((c: { lesson_id: string }) => c.lesson_id));

  const { data: passedAttempts } = await supabase
    .from('lesson_quiz_attempts')
    .select('lesson_id')
    .eq('user_id', user?.id)
    .eq('passed', true);
  const passedLessonIds = new Set((passedAttempts ?? []).map((a: { lesson_id: string }) => a.lesson_id));

  const lockedLessonIds = getLockedLessonIds(orderedLessons, passedLessonIds);
  const progress = calculateProgress(orderedLessons, completedLessonIds);

  // Ordenamos módulos y lecciones para que se muestren en el orden real del taller
  const sortedModules = (workshop.modules ?? [])
    .slice()
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map((mod: any) => ({
      ...mod,
      lessons: (mod.lessons ?? []).slice().sort((a: any, b: any) => a.order_index - b.order_index),
    }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Encabezado del Taller */}
      <div>
        <h1 className="font-mono text-4xl font-bold text-brand-beige">{workshop.title}</h1>
        <p className="text-lg text-[#9c9c94] mt-4">{workshop.description}</p>
      </div>

      {/* Barra de progreso general */}
      {progress.totalLessons > 0 && (
        <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border p-6">
          <div className="flex items-center justify-between text-sm font-bold text-brand-beige mb-2">
            <span>Tu progreso</span>
            <span>{progress.completedLessons} de {progress.totalLessons} lecciones ({progress.percent}%)</span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-mint transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de Módulos y Lecciones */}
      <div className="space-y-6">
        <h2 className="font-mono text-2xl font-bold text-brand-beige">Temario</h2>

        {sortedModules.map((modulo: any, index: number) => (
          <div key={modulo.id} className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border overflow-hidden">
            {modulo.cover_url && (
              urlKind(modulo.cover_url) === 'video' ? (
                <video src={modulo.cover_url} muted loop autoPlay playsInline className="w-full h-32 sm:h-40 object-cover" />
              ) : (
                <img src={modulo.cover_url} alt="" className="w-full h-32 sm:h-40 object-cover" />
              )
            )}
            <div className="bg-black/20 p-6 border-b border-brand-terminal-border">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-mint text-[#0f1a15] font-bold text-sm">
                  {index + 1}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-brand-beige">{modulo.title}</h2>
                  {modulo.description && <p className="text-sm text-[#9c9c94] mt-1">{modulo.description}</p>}
                </div>
              </div>
            </div>

            <div className="divide-y divide-brand-terminal-border">
              {modulo.lessons?.map((lesson: any) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                const isLocked = lockedLessonIds.has(lesson.id);

                const content = (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-[#9c9c94] group-hover:scale-110 transition-transform">
                        {lesson.type === 'theory' ? (
                          <BookOpen size={22} />
                        ) : lesson.type === 'practice' ? (
                          <Code2 size={22} />
                        ) : (
                          <Trophy size={22} />
                        )}
                      </span>
                      <span className={`font-semibold transition-colors ${isLocked ? 'text-[#6f6f68]' : 'text-[#9c9c94] group-hover:text-brand-mint'}`}>
                        {lesson.title}
                      </span>
                    </div>
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 text-brand-mint text-xs font-bold">
                        <Check size={16} /> Completada
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-1.5 text-[#6f6f68] text-xs font-bold">
                        <Lock size={14} /> Bloqueada
                      </span>
                    ) : (
                      <span className="text-[#4a4a44] group-hover:text-brand-mint transition-colors">→</span>
                    )}
                  </>
                );

                if (isLocked) {
                  return (
                    <div key={lesson.id} className="flex items-center justify-between p-4 opacity-60 cursor-not-allowed">
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/student/leccion/${lesson.id}`}
                    className="flex items-center justify-between p-4 hover:bg-black/20 transition-colors group"
                  >
                    {content}
                  </Link>
                );
              })}
              {modulo.lessons?.length === 0 && (
                <div className="p-6 text-center text-[#6f6f68] text-sm">
                  Aún no hay lecciones en este módulo.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Herramientas requeridas del taller */}
      {requiredTools.length > 0 && (
        <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border p-6">
          <h2 className="text-lg font-bold text-brand-beige mb-4">Herramientas necesarias</h2>
          <div className="flex flex-wrap gap-2">
            {requiredTools.map((tool: any) => (
              <a
                key={tool.id}
                href={tool.description_url || '#'}
                target={tool.description_url ? '_blank' : '_self'}
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
    </div>
  );
}
