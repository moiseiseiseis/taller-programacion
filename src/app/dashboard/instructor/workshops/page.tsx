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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Gestión de Talleres</h1>
          <p className="text-zinc-500 mt-2">Administra la visibilidad y detalles de tus talleres.</p>
        </div>
        <Link 
          href="/dashboard/instructor/crear-taller"
          className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors"
        >
          + Nuevo Taller
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {workshops && workshops.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Taller</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {workshops.map((taller) => (
                <tr key={taller.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900">{taller.title}</div>
                    <div className="text-zinc-500 text-xs line-clamp-1">{taller.description}</div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <form action={toggleWorkshopStatus}>
                      <input type="hidden" name="workshop_id" value={taller.id} />
                      <input type="hidden" name="current_status" value={taller.is_active?.toString()} />
                      <button type="submit" className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${taller.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                        {taller.is_active ? 'Público' : 'Oculto'}
                      </button>
                    </form>
                  </td>

                  <td className="px-6 py-4 text-right space-x-4">
                    {/* Acción de Borrar*/}
                    <form action={deleteWorkshop} className="inline-block">
                      <input type="hidden" name="workshop_id" value={taller.id} />
                      <button 
                        type="submit" 
                        className="text-red-600 font-semibold hover:underline"
                       
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-zinc-500">
            No tienes talleres creados.
          </div>
        )}
      </div>
    </div>
  );
}