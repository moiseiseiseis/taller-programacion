import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import Link from 'next/link';
import { getOrderedLessons, calculateProgress } from '@/lib/lessonSequence';

export default async function StudentProgressPage() {
  const supabase = await createClient();
  const { user } = await getAuthUser();

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('workshops(id, title, description)')
    .eq('user_id', user?.id);

  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('user_id', user?.id);
  const completedLessonIds = new Set((completions ?? []).map((c: { lesson_id: string }) => c.lesson_id));

  const workshopsProgress = await Promise.all(
    ((enrollments ?? []) as any[]).map(async (enrollment) => {
      const workshop = enrollment.workshops;
      if (!workshop) return null;
      const ordered = await getOrderedLessons(supabase, workshop.id);
      const progress = calculateProgress(ordered, completedLessonIds);
      return { workshop, progress };
    })
  );

  const validWorkshops = workshopsProgress.filter((w): w is NonNullable<typeof w> => w !== null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Mi Progreso</h1>
        <p className="text-[#9c9c94] mt-2">Tu avance en cada taller en el que estás inscrito.</p>
      </div>

      {validWorkshops.length === 0 ? (
        <div className="bg-brand-terminal-panel p-12 rounded-2xl border border-dashed border-brand-terminal-border text-center">
          <p className="text-[#9c9c94] font-semibold">Todavía no estás inscrito en ningún taller.</p>
          <Link
            href="/dashboard/student/workshops"
            className="inline-block mt-4 text-sm font-bold text-brand-mint hover:underline"
          >
            Ver talleres disponibles →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {validWorkshops.map(({ workshop, progress }) => (
            <Link
              key={workshop.id}
              href={`/dashboard/student/taller/${workshop.id}`}
              className="block bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border p-6 hover:border-brand-mint/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-brand-beige">{workshop.title}</h2>
                <span className="text-sm font-bold text-[#9c9c94]">{progress.percent}%</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-brand-mint transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="text-xs text-[#9c9c94]">
                {progress.completedLessons} de {progress.totalLessons} lecciones completadas
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
