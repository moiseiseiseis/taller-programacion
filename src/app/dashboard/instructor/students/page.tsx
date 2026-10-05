import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { getOrderedLessons, calculateProgress, type SequencedLesson } from '@/lib/lessonSequence';
import { issueCertificate } from '../actions';
import SubmitButton from '@/components/ui/SubmitButton';

type EnrollmentRow = {
  workshop_id: string;
  users: { id: string; name: string | null; email: string; career: string | null } | null;
  workshops: { id: string; title: string } | null;
};

export default async function AlumnosInscritosPage() {
  const supabase = await createClient();
  const { user } = await getAuthUser();
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      workshop_id,
      users ( id, name, email, career ),
      workshops!inner ( id, title )
    `)
    .eq('workshops.created_by', user?.id);

  if (error) {
    console.error("Error cargando alumnos:", error);
  }

  const rows = (enrollments ?? []) as unknown as EnrollmentRow[];

  // Lecciones ordenadas por taller (una sola consulta por taller distinto,
  // aunque haya muchos alumnos inscritos en el mismo).
  const workshopIds = Array.from(new Set(rows.map((r) => r.workshop_id)));
  const orderedByWorkshop = new Map<string, SequencedLesson[]>(
    await Promise.all(
      workshopIds.map(async (id) => [id, await getOrderedLessons(supabase, id)] as const)
    )
  );

  // Completions de todos los alumnos inscritos, en una sola consulta.
  const studentIds = Array.from(new Set(rows.map((r) => r.users?.id).filter((id): id is string => !!id)));
  const { data: allCompletions } = studentIds.length
    ? await supabase.from('lesson_completions').select('user_id, lesson_id').in('user_id', studentIds)
    : { data: [] as { user_id: string; lesson_id: string }[] };

  const completedByStudent = new Map<string, Set<string>>();
  for (const c of allCompletions ?? []) {
    if (!completedByStudent.has(c.user_id)) completedByStudent.set(c.user_id, new Set());
    completedByStudent.get(c.user_id)!.add(c.lesson_id);
  }

  // Certificados ya emitidos (RLS ya los limita a los talleres de este instructor).
  const { data: certificates } = await supabase
    .from('certificates')
    .select('user_id, workshop_id, issued_at');
  const certByKey = new Map(
    (certificates ?? []).map((c) => [`${c.user_id}:${c.workshop_id}`, c.issued_at as string])
  );

  const withProgress = rows.map((enrollment) => {
    const alumno = enrollment.users;
    const taller = enrollment.workshops;
    const ordered = orderedByWorkshop.get(enrollment.workshop_id) ?? [];
    const completed = (alumno && completedByStudent.get(alumno.id)) || new Set<string>();
    const progress = calculateProgress(ordered, completed);
    const issuedAt = alumno ? certByKey.get(`${alumno.id}:${enrollment.workshop_id}`) : undefined;
    return { enrollment, alumno, taller, progress, issuedAt };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Alumnos Inscritos</h1>
        <p className="text-[#9c9c94] mt-2">Lista general de estudiantes tomando tus talleres.</p>
      </div>

      <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border overflow-hidden">
        {withProgress.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 border-b border-brand-terminal-border text-[#9c9c94]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Alumno</th>
                  <th className="px-6 py-4 font-semibold">Carrera</th>
                  <th className="px-6 py-4 font-semibold">Taller</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Progreso</th>
                  <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Certificado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-terminal-border">
                {withProgress.map(({ enrollment, alumno, taller, progress, issuedAt }, idx) => (
                  <tr key={idx} className="hover:bg-black/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-brand-beige">{alumno?.name || 'Sin nombre'}</div>
                      <div className="text-[#9c9c94] text-xs">{alumno?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-[#9c9c94]">{alumno?.career || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-brand-mint">{taller?.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="h-1.5 flex-1 bg-black/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-mint transition-all duration-300"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#9c9c94] w-10 text-right">{progress.percent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {issuedAt ? (
                        <span className="text-xs font-bold text-brand-mint">
                          Emitido {new Date(issuedAt).toLocaleDateString('es-MX')}
                        </span>
                      ) : progress.percent === 100 && alumno ? (
                        <form action={issueCertificate.bind(null, enrollment.workshop_id, alumno.id)}>
                          <SubmitButton
                            pendingText="Emitiendo"
                            className="text-xs font-bold px-3 py-1.5 rounded-md bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20 border border-brand-mint/30"
                          >
                            Emitir certificado
                          </SubmitButton>
                        </form>
                      ) : (
                        <span className="text-xs text-[#6f6f68]">Taller en curso</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-[#9c9c94] font-semibold text-lg">Aún no tienes alumnos inscritos.</p>
            <p className="text-[#6f6f68] mt-2">Cuando los alumnos se inscriban, aparecerán aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
}
