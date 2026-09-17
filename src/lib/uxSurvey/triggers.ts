import { createClient } from '@/lib/supabase/server';
import { getOrderedLessons, calculateProgress } from '@/lib/lessonSequence';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type PendingUxSurvey =
  | { momento: 'first_lesson' }
  | { momento: 'workshop_complete'; workshopId: string; workshopTitle: string }
  | { momento: 'path_complete' };

// Prioridad: primera lección > taller recién completado > ruta completa,
// igual que T0 antes que T1 en anxietySurvey/triggers.ts. No dispara más de
// un momento a la vez para no saturar al alumno con varias encuestas juntas.
export async function getPendingUxSurvey(
  supabase: SupabaseServerClient,
  userId: string
): Promise<PendingUxSurvey | null> {
  const [{ data: responses }, { data: completions }] = await Promise.all([
    supabase.from('ux_survey_responses').select('momento, workshop_id').eq('user_id', userId),
    supabase.from('lesson_completions').select('lesson_id').eq('user_id', userId),
  ]);

  const completedLessonIds = new Set((completions ?? []).map((c) => c.lesson_id as string));
  if (completedLessonIds.size === 0) return null;

  const answeredFirstLesson = (responses ?? []).some((r) => r.momento === 'first_lesson');
  if (!answeredFirstLesson) return { momento: 'first_lesson' };

  const answeredWorkshopIds = new Set(
    (responses ?? []).filter((r) => r.momento === 'workshop_complete').map((r) => r.workshop_id as string)
  );

  const { data: enrollmentsRaw } = await supabase
    .from('enrollments')
    .select('workshop_id, workshops(title)')
    .eq('user_id', userId);

  const enrollments = (enrollmentsRaw ?? []) as unknown as {
    workshop_id: string;
    workshops: { title: string } | null;
  }[];

  const progressByWorkshop = new Map<string, number>();
  for (const enrollment of enrollments) {
    const workshopId = enrollment.workshop_id;
    const ordered = await getOrderedLessons(supabase, workshopId);
    const progress = calculateProgress(ordered, completedLessonIds);
    progressByWorkshop.set(workshopId, progress.percent);

    if (progress.totalLessons > 0 && progress.percent === 100 && !answeredWorkshopIds.has(workshopId)) {
      const workshopTitle = enrollment.workshops?.title ?? 'Taller';
      return { momento: 'workshop_complete', workshopId, workshopTitle };
    }
  }

  const answeredPathComplete = (responses ?? []).some((r) => r.momento === 'path_complete');
  if (!answeredPathComplete) {
    const { data: path } = await supabase
      .from('learning_paths')
      .select('id, learning_path_workshops(workshop_id)')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    const pathWorkshopIds = ((path?.learning_path_workshops ?? []) as { workshop_id: string }[]).map(
      (entry) => entry.workshop_id
    );

    if (pathWorkshopIds.length > 0) {
      const allComplete = pathWorkshopIds.every((id) => progressByWorkshop.get(id) === 100);
      if (allComplete) return { momento: 'path_complete' };
    }
  }

  return null;
}
