import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function RevisionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Panel de Evaluación</h1>
        <p className="text-zinc-500 mt-2">Revisa el código enviado por tus alumnos y asigna una calificación.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {pendingSubmissions.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Alumno</th>
                <th className="px-6 py-4 font-semibold">Ejercicio</th>
                <th className="px-6 py-4 font-semibold">Taller</th>
                <th className="px-6 py-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {pendingSubmissions.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{sub.users?.name}</div>
                    <div className="text-zinc-500 text-xs">{sub.users?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-black">
                    {sub.practices?.title || sub.practices?.lessons?.title}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 line-clamp-1">
                    {sub.practices?.lessons?.modules?.workshops?.title}
                  </td>
                  
          
                  
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/dashboard/instructor/revisiones/${sub.id}`}
                      className="inline-flex items-center px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      Revisar Código →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-zinc-900 font-bold text-lg">¡Bandeja limpia!</p>
            <p className="text-zinc-500 mt-2">No tienes entregas pendientes por revisar.</p>
          </div>
        )}
      </div>
    </div>
  );
}