import { createClient } from '@/lib/supabase/server';
import { getOrderedLessons } from '@/lib/lessonSequence';

type QuizAttempt = { score: number; passed: boolean; created_at: string };
type SubmissionInfo = { status: string };

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente de revisión', color: 'bg-yellow-500/10 text-yellow-400' },
  correct: { label: 'Aprobada', color: 'bg-brand-mint/10 text-brand-mint' },
  incorrect: { label: 'Requiere corrección', color: 'bg-brand-salmon/10 text-brand-salmon' },
};

export default async function StudentGradesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('workshops(id, title)')
    .eq('user_id', user?.id);

  const { data: quizAttempts } = await supabase
    .from('lesson_quiz_attempts')
    .select('lesson_id, score, passed, created_at')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  const { data: submissions } = await supabase
    .from('submissions')
    .select('status, practices(lesson_id)')
    .eq('user_id', user?.id);

  // El primer intento de cada lección en esta lista (ya viene ordenada desc) es el más reciente
  const latestAttemptByLesson = new Map<string, QuizAttempt>();
  for (const attempt of (quizAttempts ?? []) as (QuizAttempt & { lesson_id: string })[]) {
    if (!latestAttemptByLesson.has(attempt.lesson_id)) {
      latestAttemptByLesson.set(attempt.lesson_id, attempt);
    }
  }

  const submissionByLesson = new Map<string, SubmissionInfo>();
  for (const sub of (submissions ?? []) as any[]) {
    const lessonId = Array.isArray(sub.practices) ? sub.practices[0]?.lesson_id : sub.practices?.lesson_id;
    if (lessonId) {
      submissionByLesson.set(lessonId, { status: sub.status });
    }
  }

  const workshopsData = await Promise.all(
    ((enrollments ?? []) as any[]).map(async (enrollment) => {
      const workshop = enrollment.workshops;
      if (!workshop) return null;
      const ordered = await getOrderedLessons(supabase, workshop.id);

      const quizRows = ordered
        .filter((l) => l.quiz)
        .map((l) => ({ lesson: l, attempt: latestAttemptByLesson.get(l.id) || null }));

      const practiceRows = ordered
        .filter((l) => l.type === 'practice' || l.type === 'challenge')
        .map((l) => ({ lesson: l, submission: submissionByLesson.get(l.id) || null }));

      return { workshop, quizRows, practiceRows };
    })
  );

  const validWorkshops = workshopsData.filter(
    (w): w is NonNullable<typeof w> => w !== null && (w.quizRows.length > 0 || w.practiceRows.length > 0)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Mis Calificaciones</h1>
        <p className="text-[#9c9c94] mt-2">Resultados de tus quizzes y prácticas, por taller.</p>
      </div>

      {validWorkshops.length === 0 ? (
        <div className="bg-brand-terminal-panel p-12 rounded-2xl border border-dashed border-brand-terminal-border text-center">
          <p className="text-[#9c9c94] font-semibold">Todavía no tienes quizzes ni prácticas calificadas.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {validWorkshops.map(({ workshop, quizRows, practiceRows }) => (
            <div key={workshop.id} className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border overflow-hidden">
              <div className="bg-black/20 p-6 border-b border-brand-terminal-border">
                <h2 className="text-lg font-bold text-brand-beige">{workshop.title}</h2>
              </div>

              <div className="divide-y divide-brand-terminal-border">
                {quizRows.map(({ lesson, attempt }) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-brand-beige text-sm">{lesson.title}</p>
                      <p className="text-xs text-[#6f6f68]">Quiz</p>
                    </div>
                    {attempt ? (
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-full ${attempt.passed ? 'bg-brand-mint/10 text-brand-mint' : 'bg-brand-salmon/10 text-brand-salmon'}`}
                      >
                        {attempt.score} pts — {attempt.passed ? 'Aprobado' : 'No aprobado'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/30 text-[#9c9c94]">
                        Sin intentos
                      </span>
                    )}
                  </div>
                ))}

                {practiceRows.map(({ lesson, submission }) => {
                  const info = submission ? statusLabel[submission.status] : null;
                  return (
                    <div key={lesson.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold text-brand-beige text-sm">{lesson.title}</p>
                        <p className="text-xs text-[#6f6f68]">Práctica</p>
                      </div>
                      {info ? (
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${info.color}`}>{info.label}</span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/30 text-[#9c9c94]">
                          Sin entregar
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
