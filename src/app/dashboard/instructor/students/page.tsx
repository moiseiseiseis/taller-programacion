import { createClient } from '@/lib/supabase/server';

export default async function AlumnosInscritosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
        <h1 className="text-3xl font-bold text-zinc-900">Alumnos Inscritos</h1>
        <p className="text-zinc-500 mt-2">Lista general de estudiantes tomando tus talleres.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {enrollments && enrollments.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Alumno</th>
                <th className="px-6 py-4 font-semibold">Carrera</th>
                <th className="px-6 py-4 font-semibold">Taller</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {enrollments.map((enrollment, idx) => {
                // Conversión segura para TypeScript
                const alumno = enrollment.users as any;
                const taller = enrollment.workshops as any;

                return (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">{alumno?.name || 'Sin nombre'}</div>
                      <div className="text-zinc-500 text-xs">{alumno?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">{alumno?.career || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-black">{taller?.title}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-zinc-500 font-semibold text-lg">Aún no tienes alumnos inscritos.</p>
            <p className="text-zinc-400 mt-2">Cuando los alumnos se inscriban, aparecerán aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
}