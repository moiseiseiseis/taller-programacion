import { createClient } from '@/lib/supabase/server';
import { enrollInWorkshop } from './actions';
import Link from 'next/link';
import { getOrderedLessons, calculateProgress } from '@/lib/lessonSequence';
import { getPendingSurveyMomento } from '@/lib/anxietySurvey/triggers';
import AnxietySurveyBanner from './AnxietySurveyBanner';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const pendingSurveyMomento = await getPendingSurveyMomento(supabase, user!.id);

  // OPTIMIZACIÓN
  const [workshopsResponse, enrollmentsResponse, completionsResponse] = await Promise.all([
    supabase
      .from('workshops')
      .select('*, users!workshops_created_by_fkey(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('enrollments')
      .select('workshop_id')
      .eq('user_id', user?.id),
    supabase
      .from('lesson_completions')
      .select('lesson_id')
      .eq('user_id', user?.id),
  ]);

  const activeWorkshops = workshopsResponse.data;
  const myEnrollments = enrollmentsResponse.data;
  const completedLessonIds = new Set(
    (completionsResponse.data ?? []).map((c: { lesson_id: string }) => c.lesson_id)
  );

  // Convertimos las inscripciones en un Set para búsqueda rápida
  const enrolledIds = new Set(myEnrollments?.map(e => e.workshop_id) || []);

  // Progreso de cada taller en el que ya está inscrito
  const progressByWorkshop = new Map<string, number>();
  await Promise.all(
    Array.from(enrolledIds).map(async (workshopId) => {
      const ordered = await getOrderedLessons(supabase, workshopId as string);
      progressByWorkshop.set(workshopId as string, calculateProgress(ordered, completedLessonIds).percent);
    })
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {pendingSurveyMomento && <AnxietySurveyBanner momento={pendingSurveyMomento} />}

      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Catálogo de Talleres</h1>
        <p className="text-[#9c9c94] mt-2">Explora e inscríbete en los talleres disponibles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeWorkshops && activeWorkshops.length > 0 ? (
          activeWorkshops.map((taller) => {
            const isEnrolled = enrolledIds.has(taller.id);

            return (
              <div key={taller.id} className="bg-brand-terminal-panel rounded-xl border border-brand-terminal-border p-6 flex flex-col hover:border-brand-mint/40 transition-colors">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-brand-beige mb-2 line-clamp-2">
                    {taller.title}
                  </h3>
                  <p className="text-sm text-[#9c9c94] font-semibold mb-3">
                    Instructor: {taller.users?.name || 'CUTLAJO'}
                  </p>
                  <p className="text-[#9c9c94] text-sm line-clamp-3 mb-6">
                    {taller.description}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-brand-terminal-border">
                  {isEnrolled ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#9c9c94]">
                        <span>Tu progreso</span>
                        <span>{progressByWorkshop.get(taller.id) ?? 0}%</span>
                      </div>
                      <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-mint transition-all duration-300"
                          style={{ width: `${progressByWorkshop.get(taller.id) ?? 0}%` }}
                        />
                      </div>
                      <Link
                        href={`/dashboard/student/taller/${taller.id}`}
                        className="block w-full text-center py-2.5 px-4 rounded-lg text-sm font-bold text-brand-beige bg-black/30 border border-brand-terminal-border hover:border-brand-mint/50 transition-colors"
                      >
                        Continuar Aprendiendo →
                      </Link>
                    </div>
                  ) : (
                    <form action={enrollInWorkshop}>
                      <input type="hidden" name="workshop_id" value={taller.id} />
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
                      >
                        Inscribirse al Taller
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 text-center bg-brand-terminal-panel rounded-2xl border border-dashed border-brand-terminal-border">
            <p className="text-[#9c9c94] font-semibold text-lg">No hay talleres activos en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}