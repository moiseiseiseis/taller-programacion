import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

export default async function AlumnosInscritosPage() {
  const supabase = await createClient();
  const { user } = await getAuthUser();
  const { data: enrollments, error } = await supabase
    .from('workshop_enrollments')
    .select(`
      workshop_id,
      users ( id, name, email, career ),
      workshops!inner ( id, title )
    `)
    .eq('workshops.created_by', user?.id);

  if (error) {
    console.error("Error cargando alumnos:", error);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Alumnos Inscritos</h1>
        <p className="text-[#9c9c94] mt-2">Lista general de estudiantes tomando tus talleres.</p>
      </div>

      <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border overflow-hidden">
        {enrollments && enrollments.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 border-b border-brand-terminal-border text-[#9c9c94]">
              <tr>
                <th className="px-6 py-4 font-semibold">Alumno</th>
                <th className="px-6 py-4 font-semibold">Carrera</th>
                <th className="px-6 py-4 font-semibold">Taller</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-terminal-border">
              {enrollments.map((enrollment, idx) => {
                // Conversión segura para TypeScript
                const alumno = enrollment.users as any;
                const taller = enrollment.workshops as any;

                return (
                  <tr key={idx} className="hover:bg-black/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-brand-beige">{alumno?.name || 'Sin nombre'}</div>
                      <div className="text-[#9c9c94] text-xs">{alumno?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-[#9c9c94]">{alumno?.career || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-brand-mint">{taller?.title}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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