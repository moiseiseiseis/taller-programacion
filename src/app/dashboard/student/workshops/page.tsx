import { getActiveWorkshops } from '@/lib/workshops/actions';
import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import EnrollButton from './EnrollButton';
import { getOrderedLessons, calculateProgress } from '@/lib/lessonSequence';

export default async function StudentWorkshopsPage() {
  const workshops = await getActiveWorkshops();

  const supabase = await createClient();
  const { user } = await getAuthUser();

  // Traemos los IDs de los talleres a los que este alumno ya está inscrito
  const { data: userEnrollments } = await supabase
    .from('enrollments')
    .select('workshop_id')
    .eq('user_id', user?.id);

  // Creamos un Set para buscar más rápido
  const enrolledWorkshopIds = new Set(userEnrollments?.map(e => e.workshop_id) || []);

  // Progreso de cada taller en el que ya está inscrito
  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('user_id', user?.id);
  const completedLessonIds = new Set((completions ?? []).map((c: { lesson_id: string }) => c.lesson_id));

  const progressByWorkshop = new Map<string, number>();
  await Promise.all(
    Array.from(enrolledWorkshopIds).map(async (workshopId) => {
      const ordered = await getOrderedLessons(supabase, workshopId as string);
      progressByWorkshop.set(workshopId as string, calculateProgress(ordered, completedLessonIds).percent);
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="font-mono text-3xl font-bold text-brand-mint">Talleres Disponibles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {workshops.map((workshop) => {
          // Verificamos si el usuario ya está en este taller específico
          const isEnrolled = enrolledWorkshopIds.has(workshop.id);

          return (
            <div key={workshop.id} className="bg-brand-terminal-panel border border-brand-terminal-border p-6 rounded-xl hover:border-brand-mint/40 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-brand-beige">{workshop.title}</h3>
                  {isEnrolled && (
                    <span className="bg-brand-mint/10 text-brand-mint text-xs font-bold px-2 py-1 rounded-full border border-brand-mint/40">
                      Inscrito
                    </span>
                  )}
                </div>
                <p className="text-[#9c9c94] text-sm mb-4 line-clamp-3">{workshop.description}</p>

                {isEnrolled && (
                  <div className="mb-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#9c9c94]">
                      <span>Tu progreso</span>
                      <span>{progressByWorkshop.get(workshop.id) ?? 0}%</span>
                    </div>
                    <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-mint transition-all duration-300"
                        style={{ width: `${progressByWorkshop.get(workshop.id) ?? 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Aquí insertamos nuestro nuevo botón inteligente */}
              <EnrollButton workshopId={workshop.id} isEnrolled={isEnrolled} />
            </div>
          );
        })}

        {workshops.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-brand-terminal-border rounded-xl">
            <p className="text-[#9c9c94] font-semibold">No hay talleres disponibles en este momento.</p>
          </div>
        )}

      </div>
    </div>
  );
}