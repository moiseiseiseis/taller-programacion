import { createClient } from '@/lib/supabase/server';
import { createModule } from '../../actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function GestionarTallerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  const supabase = await createClient();

  // Traemos la información del Taller
  const { data: workshop } = await supabase
    .from('workshops')
    .select('*')
    .eq('id', id)
    .single();

  if (!workshop) {
    notFound(); // Muestra pantalla de 404 si el taller no existe
  }

  // Traemos los Módulos de este taller, ordenados por su índice
  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('workshop_id', id)
    .order('order_index', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <Link href="/dashboard/instructor" className="text-sm font-semibold text-zinc-500 hover:text-black mb-4 inline-block">
          ← Volver a mis talleres
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900">{workshop.title}</h1>
        <p className="text-zinc-500 mt-2">{workshop.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Lista de Módulos */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-zinc-900">Módulos del Taller</h2>
          
          {modules && modules.length > 0 ? (
            <div className="space-y-3">
              {modules.map((mod) => (
                <div key={mod.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="bg-zinc-100 text-zinc-500 font-bold px-3 py-1 rounded-lg text-sm">
                      Módulo {mod.order_index}
                    </span>
                    <h3 className="font-semibold text-zinc-900">{mod.title}</h3>
                  </div>
                  <Link 
                    href={`/dashboard/instructor/modulo/${mod.id}`}
                    className="text-sm font-semibold text-black hover:underline"
                    >
                    Ver lecciones →
                </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-zinc-200 rounded-xl text-center">
              <p className="text-zinc-500">Aún no hay módulos. ¡Agrega el primero!</p>
            </div>
          )}
        </div>

        {/* Columna Derecha: Formulario para Agregar Módulo */}
        <div>
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold text-zinc-900 mb-4">Agregar Módulo</h2>
            <form action={createModule} className="space-y-4">
              {/* Input oculto para pasar el ID del taller a la Server Action */}
              <input type="hidden" name="workshop_id" value={workshop.id} />
              
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-zinc-900 mb-1">
                  Título del módulo
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  placeholder="Ej. Conceptos Básicos"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-black focus:ring-1 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-black hover:bg-zinc-800 transition-colors"
              >
                + Guardar Módulo
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}