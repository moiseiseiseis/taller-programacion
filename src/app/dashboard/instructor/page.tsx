import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function InstructorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Obtenemos solo los talleres creados por este instructor específico
  const { data: workshops } = await supabase
    .from('workshops')
    .select('*')
    .eq('created_by', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Mis Talleres</h1>
          <p className="text-sm sm:text-base text-zinc-500 mt-1">Gestiona tu contenido académico.</p>
        </div>
        <Link 
          href="/dashboard/instructor/crear-taller"
          className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors text-center w-full sm:w-auto"
        >
          + Nuevo Taller
        </Link>
      </div>

      {workshops && workshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {workshops.map((taller) => (
            <div key={taller.id} className="bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full ${taller.is_active ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-600'}`}>
                    {taller.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-[10px] sm:text-xs text-zinc-400">
                    {new Date(taller.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-2 line-clamp-2">
                  {taller.title}
                </h3>
                <p className="text-zinc-500 text-xs sm:text-sm line-clamp-3">
                  {taller.description}
                </p>
              </div>
              
              <div className="mt-5 sm:mt-6 pt-4 border-t border-zinc-100 flex justify-end">
                <Link 
                  href={`/dashboard/instructor/taller/${taller.id}`}
                  className="text-sm font-semibold text-black hover:underline"
                >
                  Gestionar módulos →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-20 px-4 bg-white rounded-2xl border border-dashed border-zinc-300">
          <p className="text-sm sm:text-base text-zinc-500 mb-4">Aún no has creado ningún taller.</p>
          <Link 
            href="/dashboard/instructor/crear-taller"
            className="text-black font-bold hover:underline text-sm sm:text-base"
          >
            Crear mi primer taller
          </Link>
        </div>
      )}
    </div>
  );
}