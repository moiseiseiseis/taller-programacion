import { createClient } from '@/lib/supabase/server';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type SequencedLesson = {
  id: string;
  title: string;
  type: string;
  quiz: unknown | null;
};

// Trae todas las lecciones de un taller, en el orden en que un alumno las
// recorre: por módulo (order_index) y luego por lección dentro del módulo.
export async function getOrderedLessons(
  supabase: SupabaseServerClient,
  workshopId: string
): Promise<SequencedLesson[]> {
  const { data: modules } = await supabase
    .from('modules')
    .select('id, order_index, lessons(id, title, type, order_index, quiz)')
    .eq('workshop_id', workshopId)
    .order('order_index', { ascending: true });

  type RawLesson = { id: string; title: string; type: string; order_index: number; quiz: unknown };
  type RawModule = { lessons: RawLesson[] | null };

  const ordered: SequencedLesson[] = [];
  for (const mod of (modules ?? []) as RawModule[]) {
    const lessons = (mod.lessons ?? []).slice().sort((a, b) => a.order_index - b.order_index);
    for (const lesson of lessons) {
      ordered.push({ id: lesson.id, title: lesson.title, type: lesson.type, quiz: lesson.quiz });
    }
  }
  return ordered;
}

export function getNextLessonId(ordered: SequencedLesson[], currentLessonId: string): string | null {
  const index = ordered.findIndex((l) => l.id === currentLessonId);
  if (index === -1 || index === ordered.length - 1) return null;
  return ordered[index + 1].id;
}

// Recorre el taller en orden y devuelve el id de la primera lección con quiz
// sin aprobar que aparece ANTES de currentLessonId. Si no hay ninguna
// pendiente, devuelve null: currentLessonId es accesible para este alumno.
export function getFirstLockedLessonId(
  ordered: SequencedLesson[],
  currentLessonId: string,
  passedLessonIds: Set<string>
): string | null {
  for (const lesson of ordered) {
    if (lesson.id === currentLessonId) return null;
    if (lesson.quiz && !passedLessonIds.has(lesson.id)) {
      return lesson.id;
    }
  }
  return null;
}

// Para mostrar candados en el temario: todas las lecciones que quedan
// bloqueadas por algún quiz sin aprobar más atrás en el taller. La lección
// que tiene el quiz pendiente NO se marca como bloqueada (a esa sí se puede
// entrar, es la que hay que resolver).
export function getLockedLessonIds(
  ordered: SequencedLesson[],
  passedLessonIds: Set<string>
): Set<string> {
  const locked = new Set<string>();
  let blocked = false;
  for (const lesson of ordered) {
    if (blocked) locked.add(lesson.id);
    if (lesson.quiz && !passedLessonIds.has(lesson.id)) blocked = true;
  }
  return locked;
}

export type WorkshopProgress = {
  totalLessons: number;
  completedLessons: number;
  percent: number;
};

export function calculateProgress(
  ordered: SequencedLesson[],
  completedLessonIds: Set<string>
): WorkshopProgress {
  const totalLessons = ordered.length;
  const completedLessons = ordered.filter((l) => completedLessonIds.has(l.id)).length;
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  return { totalLessons, completedLessons, percent };
}
