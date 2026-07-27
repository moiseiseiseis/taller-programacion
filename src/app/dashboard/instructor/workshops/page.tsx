import { createClient } from '@/lib/supabase/server';
import { toggleWorkshopStatus, deleteWorkshop } from '../actions';
import Link from 'next/link';

export default async function GestionTalleresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: workshops } = await supabase
    .from('workshops')
    .select('*')
    .eq('created_by', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-beige">Gestión de Talleres</h1>
          <p className="text-[#9c9c94] mt-2">Administra la visibilidad y detalles de tus talleres.</p>
        </div>
        <Link
          href="/dashboard/instructor/crear-taller"
          className="bg-brand-mint text-[#0f1a15] px-5 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all text-center whitespace-nowrap"
        >
          + Nuevo Taller
        </Link>
      </div>

      <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border overflow-hidden">
        {workshops && workshops.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 border-b border-brand-terminal-border text-[#9c9c94]">
                <tr>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Taller</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-terminal-border">
                {workshops.map((taller) => (
                  <tr key={taller.id} className="hover:bg-black/20 transition-colors">
                    <td className="px-6 py-4 min-w-[220px]">
                      <div className="font-bold text-brand-beige">{taller.title}</div>
                      <div className="text-[#9c9c94] text-xs line-clamp-1">{taller.description}</div>
                    </td>

                    <td className="px-6 py-4">
                      <form action={toggleWorkshopStatus}>
                        <input type="hidden" name="workshop_id" value={taller.id} />
                        <input type="hidden" name="current_status" value={taller.is_active?.toString()} />
                        <button type="submit" className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${taller.is_active ? 'bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20' : 'bg-black/30 text-[#9c9c94] hover:bg-black/40'}`}>
                          {taller.is_active ? 'Público' : 'Oculto'}
                        </button>
                      </form>
                    </td>

                    <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                      {/* Acción de Borrar*/}
                      <form action={deleteWorkshop} className="inline-block">
                        <input type="hidden" name="workshop_id" value={taller.id} />
                        <button
                          type="submit"
                          className="text-brand-salmon font-semibold hover:underline"

                        >
                          Eliminar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#9c9c94]">
            No tienes talleres creados.
          </div>
        )}
      </div>
    </div>
  );
}