import { createClient } from '@/lib/supabase/server';
import { createLesson } from '../../actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ModuleSettings from './ModuleSettings';

export default async function GestionarModuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Traemos el Módulo actual y cruzamos datos con el Taller para poder regresar
  const { data: moduleData } = await supabase
    .from('modules')
    .select('*, workshops(id, title)')
    .eq('id', id)
    .single();

  if (!moduleData) notFound();

  // Traemos las lecciones de este módulo
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', id)
    .order('order_index', { ascending: true });

  // Diccionario visual para los tipos de lección
  const typeLabels: Record<string, { label: string, color: string }> = {
    theory: { label: 'Teoría', color: 'bg-brand-steel/10 text-brand-steel' },
    practice: { label: 'Práctica', color: 'bg-brand-mint/10 text-brand-mint' },
    challenge: { label: 'Desafío', color: 'bg-purple-500/10 text-purple-300' },
    terminal: { label: 'Terminal', color: 'bg-black/30 text-brand-beige' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Encabezado con navegación  */}
      <div>
        <Link
          href={`/dashboard/instructor/taller/${moduleData.workshop_id}`}
          className="text-sm font-semibold text-[#9c9c94] hover:text-brand-mint mb-4 inline-block"
        >
          ← Volver a: {moduleData.workshops?.title}
        </Link>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">
          Módulo {moduleData.order_index}: {moduleData.title}
        </h1>
      </div>

      <ModuleSettings moduleId={moduleData.id} initialCoverUrl={moduleData.cover_url} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda: Lista de Lecciones */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-brand-beige">Lecciones del Módulo</h2>

          {lessons && lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="bg-brand-terminal-panel p-4 rounded-xl border border-brand-terminal-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[#6f6f68] font-bold w-6">
                      {lesson.order_index}.
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${typeLabels[lesson.type]?.color || 'bg-black/30 text-[#9c9c94]'}`}>
                      {typeLabels[lesson.type]?.label || lesson.type}
                    </span>
                    <h3 className="font-semibold text-brand-beige">{lesson.title}</h3>
                  </div>
                  <Link
                    href={`/dashboard/instructor/leccion/${lesson.id}`}
                    className="text-sm font-semibold text-brand-mint hover:underline"
                    >
                    Editar contenido →
                    </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-brand-terminal-border rounded-xl text-center">
              <p className="text-[#9c9c94]">Este módulo está vacío. Agrega una lección.</p>
            </div>
          )}
        </div>

        {/* Columna Derecha: Formulario para Agregar Lección */}
        <div>
          <div className="bg-brand-terminal-panel p-6 rounded-xl border border-brand-terminal-border sticky top-8">
            <h2 className="text-lg font-bold text-brand-beige mb-4">Nueva Lección</h2>
            <form action={createLesson} className="space-y-4">
              <input type="hidden" name="module_id" value={moduleData.id} />

              <div>
                <label className="block text-sm font-semibold text-brand-beige mb-1">
                  Título de la lección
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Ej. Variables en Python"
                  className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-3 py-2 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-beige mb-1">
                  Tipo de lección
                </label>
                <select
                  name="type"
                  required
                  className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-3 py-2 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
                >
                  <option value="theory">Teoría</option>
                  <option value="practice">Práctica</option>
                  <option value="challenge">Desafío</option>
                  <option value="terminal">Minijuego de terminal</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
              >
                + Crear Lección
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}