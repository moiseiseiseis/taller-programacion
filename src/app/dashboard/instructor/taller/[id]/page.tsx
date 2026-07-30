import { createClient } from '@/lib/supabase/server';
import { createModule } from '../../actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import WorkshopSettings from './WorkshopSettings';

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
        <Link href="/dashboard/instructor" className="text-sm font-semibold text-[#9c9c94] hover:text-brand-mint mb-4 inline-block">
          ← Volver a mis talleres
        </Link>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">{workshop.title}</h1>
        <p className="text-[#9c9c94] mt-2">{workshop.description}</p>
      </div>

      <WorkshopSettings
        workshopId={workshop.id}
        initialDescription={workshop.description}
        initialIsCodeWorkshop={workshop.is_code_workshop ?? false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda: Lista de Módulos */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-brand-beige">Módulos del Taller</h2>

          {modules && modules.length > 0 ? (
            <div className="space-y-3">
              {modules.map((mod) => (
                <div key={mod.id} className="bg-brand-terminal-panel p-4 rounded-xl border border-brand-terminal-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="bg-black/30 text-[#9c9c94] font-bold px-3 py-1 rounded-lg text-sm">
                      Módulo {mod.order_index}
                    </span>
                    <h3 className="font-semibold text-brand-beige">{mod.title}</h3>
                  </div>
                  <Link
                    href={`/dashboard/instructor/modulo/${mod.id}`}
                    className="text-sm font-semibold text-brand-mint hover:underline"
                    >
                    Ver lecciones →
                </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-brand-terminal-border rounded-xl text-center">
              <p className="text-[#9c9c94]">Aún no hay módulos. ¡Agrega el primero!</p>
            </div>
          )}
        </div>

        {/* Columna Derecha: Formulario para Agregar Módulo */}
        <div>
          <div className="bg-brand-terminal-panel p-6 rounded-xl border border-brand-terminal-border sticky top-8">
            <h2 className="text-lg font-bold text-brand-beige mb-4">Agregar Módulo</h2>
            <form action={createModule} className="space-y-4">
              {/* Input oculto para pasar el ID del taller a la Server Action */}
              <input type="hidden" name="workshop_id" value={workshop.id} />

              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-brand-beige mb-1">
                  Título del módulo
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  placeholder="Ej. Conceptos Básicos"
                  className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-3 py-2 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
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