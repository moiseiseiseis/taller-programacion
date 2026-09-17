import { createClient } from '@/lib/supabase/server';
import { enrollInWorkshop } from './actions';
import Link from 'next/link';
import { getOrderedLessons, calculateProgress } from '@/lib/lessonSequence';
import { getPendingSurveyMomento } from '@/lib/anxietySurvey/triggers';
import AnxietySurveyBanner from './AnxietySurveyBanner';
import { getPendingUxSurvey } from '@/lib/uxSurvey/triggers';
import UxSurveyBanner from './UxSurveyBanner';
import WelcomeCarousel from '@/components/dashboard/WelcomeCarousel';
import { STUDENT_WELCOME_CARDS } from './welcomeCards';

type LearningPathRow = {
  id: string;
  title: string;
  description: string | null;
  learning_path_workshops: {
    position: number;
    workshops: {
      id: string;
      title: string;
      description: string | null;
      is_active: boolean;
      users?: { name: string | null } | null;
    } | null;
  }[];
};

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const pendingSurveyMomento = await getPendingSurveyMomento(supabase, user!.id);
  const pendingUxSurvey = await getPendingUxSurvey(supabase, user!.id);

  // OPTIMIZACIÓN
  const [workshopsResponse, enrollmentsResponse, completionsResponse, pathResponse] = await Promise.all([
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
    supabase
      .from('learning_paths')
      .select('id, title, description, learning_path_workshops(position, workshops(*, users!workshops_created_by_fkey(name)))')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const activeWorkshops = workshopsResponse.data;
  const myEnrollments = enrollmentsResponse.data;

  const learningPath = pathResponse.data as LearningPathRow | null;
  const pathWorkshops = (learningPath?.learning_path_workshops ?? [])
    .filter((entry) => entry.workshops && entry.workshops.is_active)
    .sort((a, b) => a.position - b.position);
  const pathWorkshopIds = new Set(pathWorkshops.map((entry) => entry.workshops!.id));
  const catalogWorkshops = (activeWorkshops ?? []).filter((taller) => !pathWorkshopIds.has(taller.id));
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
      <WelcomeCarousel
        storageKey="welcome-dismissed-student"
        title="Bienvenido/a a tu panel de alumno"
        subtitle="Un repaso rápido de qué puedes hacer aquí — desliza o usa las flechas."
        cards={STUDENT_WELCOME_CARDS}
      />

      {pendingSurveyMomento && <AnxietySurveyBanner momento={pendingSurveyMomento} />}
      {pendingUxSurvey && <UxSurveyBanner survey={pendingUxSurvey} />}

      {pathWorkshops.length > 0 && (
        <div className="space-y-4">
          <div>
            <h1 className="font-mono text-3xl font-bold text-brand-beige">
              Ruta de aprendizaje: {learningPath!.title}
            </h1>
            {learningPath!.description && (
              <p className="text-[#9c9c94] mt-2">{learningPath!.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pathWorkshops.map((entry) => (
              <WorkshopCard
                key={entry.workshops!.id}
                taller={entry.workshops!}
                isEnrolled={enrolledIds.has(entry.workshops!.id)}
                progress={progressByWorkshop.get(entry.workshops!.id) ?? 0}
                position={entry.position}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h1 className="font-mono text-3xl font-bold text-brand-beige">
            {pathWorkshops.length > 0 ? 'Todos los talleres' : 'Catálogo de Talleres'}
          </h1>
          <p className="text-[#9c9c94] mt-2">Explora e inscríbete en los talleres disponibles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogWorkshops.length > 0 ? (
            catalogWorkshops.map((taller) => (
              <WorkshopCard
                key={taller.id}
                taller={taller}
                isEnrolled={enrolledIds.has(taller.id)}
                progress={progressByWorkshop.get(taller.id) ?? 0}
              />
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-brand-terminal-panel rounded-2xl border border-dashed border-brand-terminal-border">
              <p className="text-[#9c9c94] font-semibold text-lg">No hay talleres activos en este momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkshopCard({
  taller,
  isEnrolled,
  progress,
  position,
}: {
  taller: { id: string; title: string; description: string | null; users?: { name: string | null } | null };
  isEnrolled: boolean;
  progress: number;
  position?: number;
}) {
  return (
    <div className="relative bg-brand-terminal-panel rounded-xl border border-brand-terminal-border p-6 flex flex-col hover:border-brand-mint/40 transition-colors">
      {position != null && (
        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-mint text-[#0f1a15] text-sm font-bold flex items-center justify-center">
          {position}
        </div>
      )}
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
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-mint transition-all duration-300"
                style={{ width: `${progress}%` }}
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
}