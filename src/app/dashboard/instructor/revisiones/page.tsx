import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import Link from 'next/link';

export default async function RevisionesPage() {
  const supabase = await createClient();
  const { user } = await getAuthUser();

  
  const { data: rawSubmissions } = await supabase
    .from('submissions')
    .select(`
      id, status,
      users ( name, email ),
      practices (
        title,
        lessons (
          title,
          modules (
            workshops ( title, created_by )
          )
        )
      )
    `)
    .eq('status', 'pending');

  const pendingSubmissions = (rawSubmissions || []).filter((sub: any) =>
    sub.practices?.lessons?.modules?.workshops?.created_by === user?.id
  );

  const { data: rawReflections } = await supabase
    .from('metacog_submissions')
    .select(`
      id,
      users ( name, email ),
      metacog_exercises (
        title,
        lessons (
          title,
          modules (
            workshops ( title, created_by )
          )
        )
      )
    `)
    .is('rubric_level', null);

  type ReflectionRow = {
    id: string;
    users: { name: string | null; email: string } | null;
    metacog_exercises: {
      title: string;
      lessons: { title: string; modules: { workshops: { title: string; created_by: string } | null } | null } | null;
    } | null;
  };

  const pendingReflections = ((rawReflections as unknown as ReflectionRow[]) || []).filter(
    (sub) => sub.metacog_exercises?.lessons?.modules?.workshops?.created_by === user?.id
  );

  const totalPending = pendingSubmissions.length + pendingReflections.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-beige">Panel de Evaluación</h1>
        <p className="text-[#9c9c94] mt-2">Revisa el código enviado por tus alumnos y asigna una calificación.</p>
      </div>

      <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border overflow-hidden">
        {totalPending > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 border-b border-brand-terminal-border text-[#9c9c94]">
                <tr>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Alumno</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Ejercicio</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Taller</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Tipo</th>
                  <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-terminal-border">
                {pendingSubmissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-black/20 transition-colors">
                    <td className="px-6 py-4 min-w-[180px]">
                      <div className="font-bold text-brand-beige">{sub.users?.name}</div>
                      <div className="text-[#9c9c94] text-xs">{sub.users?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-brand-mint min-w-[160px]">
                      {sub.practices?.title || sub.practices?.lessons?.title}
                    </td>
                    <td className="px-6 py-4 text-[#9c9c94] line-clamp-1 min-w-[160px]">
                      {sub.practices?.lessons?.modules?.workshops?.title}
                    </td>
                    <td className="px-6 py-4 text-[#9c9c94] text-xs whitespace-nowrap">Código</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/instructor/revisiones/${sub.id}`}
                        className="inline-flex items-center px-4 py-2 bg-brand-mint text-[#0f1a15] text-xs font-bold rounded-lg hover:brightness-110 transition-all"
                      >
                        Revisar código →
                      </Link>
                    </td>
                  </tr>
                ))}
                {pendingReflections.map((sub) => (
                  <tr key={sub.id} className="hover:bg-black/20 transition-colors">
                    <td className="px-6 py-4 min-w-[180px]">
                      <div className="font-bold text-brand-beige">{sub.users?.name}</div>
                      <div className="text-[#9c9c94] text-xs">{sub.users?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-brand-mint min-w-[160px]">
                      {sub.metacog_exercises?.title || sub.metacog_exercises?.lessons?.title}
                    </td>
                    <td className="px-6 py-4 text-[#9c9c94] line-clamp-1 min-w-[160px]">
                      {sub.metacog_exercises?.lessons?.modules?.workshops?.title}
                    </td>
                    <td className="px-6 py-4 text-[#9c9c94] text-xs whitespace-nowrap">Reflexión</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/instructor/revisiones/reflexion/${sub.id}`}
                        className="inline-flex items-center px-4 py-2 bg-brand-mint text-[#0f1a15] text-xs font-bold rounded-lg hover:brightness-110 transition-all"
                      >
                        Revisar reflexión →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-brand-beige font-bold text-lg">Bandeja limpia.</p>
            <p className="text-[#9c9c94] mt-2">No tienes entregas pendientes por revisar.</p>
          </div>
        )}
      </div>
    </div>
  );
}