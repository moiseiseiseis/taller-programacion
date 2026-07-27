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
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-beige">Mis Talleres</h1>
          <p className="text-sm sm:text-base text-[#9c9c94] mt-1">Gestiona tu contenido académico.</p>
        </div>
        <Link
          href="/dashboard/instructor/crear-taller"
          className="bg-brand-mint text-[#0f1a15] px-5 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all text-center w-full sm:w-auto"
        >
          + Nuevo Taller
        </Link>
      </div>

      {workshops && workshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {workshops.map((taller) => (
            <div key={taller.id} className="bg-brand-terminal-panel rounded-xl border border-brand-terminal-border p-5 sm:p-6 hover:border-brand-mint/40 transition-colors flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full ${taller.is_active ? 'bg-brand-mint/10 text-brand-mint' : 'bg-black/30 text-[#9c9c94]'}`}>
                    {taller.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#6f6f68]">
                    {new Date(taller.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-brand-beige mb-2 line-clamp-2">
                  {taller.title}
                </h3>
                <p className="text-[#9c9c94] text-xs sm:text-sm line-clamp-3">
                  {taller.description}
                </p>
              </div>

              <div className="mt-5 sm:mt-6 pt-4 border-t border-brand-terminal-border flex justify-end">
                <Link
                  href={`/dashboard/instructor/taller/${taller.id}`}
                  className="text-sm font-semibold text-brand-mint hover:underline"
                >
                  Gestionar módulos →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-20 px-4 bg-brand-terminal-panel rounded-2xl border border-dashed border-brand-terminal-border">
          <p className="text-sm sm:text-base text-[#9c9c94] mb-4">Aún no has creado ningún taller.</p>
          <Link
            href="/dashboard/instructor/crear-taller"
            className="text-brand-mint font-bold hover:underline text-sm sm:text-base"
          >
            Crear mi primer taller
          </Link>
        </div>
      )}
    </div>
  );
}