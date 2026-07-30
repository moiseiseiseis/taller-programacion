import { createClient } from '@/lib/supabase/server';
import { getOrderedLessons, calculateProgress } from '@/lib/lessonSequence';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// T0: primer inicio de sesión, sin importar el taller elegido (sección 7).
// T1: primera vez que el alumno completa al 100% un taller marcado como
// is_code_workshop. T2 no se evalúa aquí todavía — su disparador (fecha de
// cierre del MVP) no está definido en el documento fuente.
export async function getPendingSurveyMomento(
  supabase: SupabaseServerClient,
  userId: string
): Promise<'T0' | 'T1' | null> {
  const { data: responses } = await supabase.from('anxiety_survey_responses').select('momento').eq('user_id', userId);
  const answered = new Set((responses ?? []).map((r) => r.momento));

  if (!answered.has('T0')) return 'T0';
  if (answered.has('T1')) return null;

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('workshop_id, workshops!inner(is_code_workshop)')
    .eq('user_id', userId)
    .eq('workshops.is_code_workshop', true);

  if (!enrollments || enrollments.length === 0) return null;

  const { data: completions } = await supabase.from('lesson_completions').select('lesson_id').eq('user_id', userId);
  const completedLessonIds = new Set((completions ?? []).map((c) => c.lesson_id as string));

  for (const enrollment of enrollments) {
    const ordered = await getOrderedLessons(supabase, enrollment.workshop_id as string);
    const progress = calculateProgress(ordered, completedLessonIds);
    if (progress.totalLessons > 0 && progress.percent === 100) return 'T1';
  }

  return null;
}
