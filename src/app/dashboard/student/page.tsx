import { createClient } from '@/lib/supabase/server';
import { enrollInWorkshop } from './actions';
import Link from 'next/link';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // OPTIMIZACIÓN
  const [workshopsResponse, enrollmentsResponse] = await Promise.all([
    supabase
      .from('workshops')
      .select('*, users!workshops_created_by_fkey(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('workshop_enrollments')
      .select('workshop_id')
      .eq('user_id', user?.id)
  ]);

  const activeWorkshops = workshopsResponse.data;
  const myEnrollments = enrollmentsResponse.data;

  // Convertimos las inscripciones en un Set para búsqueda rápida
  const enrolledIds = new Set(myEnrollments?.map(e => e.workshop_id) || []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Catálogo de Talleres</h1>
        <p className="text-zinc-500 mt-2">Explora e inscríbete en los talleres disponibles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeWorkshops && activeWorkshops.length > 0 ? (
          activeWorkshops.map((taller) => {
            const isEnrolled = enrolledIds.has(taller.id);

            return (
              <div key={taller.id} className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 line-clamp-2">
                    {taller.title}
                  </h3>
                  <p className="text-sm text-zinc-500 font-semibold mb-3">
                    Instructor: {taller.users?.name || 'CUTLAJO'}
                  </p>
                  <p className="text-zinc-600 text-sm line-clamp-3 mb-6">
                    {taller.description}
                  </p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-zinc-100">
                  {isEnrolled ? (
                    <Link 
                      href={`/dashboard/student/taller/${taller.id}`}
                      className="block w-full text-center py-2.5 px-4 rounded-lg text-sm font-bold text-black bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 transition-colors"
                    >
                      Continuar Aprendiendo →
                    </Link>
                  ) : (
                    <form action={enrollInWorkshop}>
                      <input type="hidden" name="workshop_id" value={taller.id} />
                      <button 
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-black hover:bg-zinc-800 transition-colors shadow-sm"
                      >
                        Inscribirse al Taller
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-zinc-300">
            <p className="text-zinc-500 font-semibold text-lg">No hay talleres activos en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}