import { createClient } from '@/lib/supabase/server';
import { addTool, deleteTool } from './actions';

export default async function HerramientasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Traemos todas las herramientas creadas por este instructor
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('created_by', user?.id)
    .order('created_at', { ascending: false });

  // Diccionario visual para las categorías
  const categoryStyles: Record<string, { label: string, color: string }> = {
    hardware: { label: 'Hardware', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    software: { label: 'Software', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    language: { label: 'Lenguaje', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Inventario de Herramientas</h1>
        <p className="text-zinc-500 mt-2">Gestiona el software, hardware y lenguajes que usarás en tus clases.</p>
      </div>

      {/* Formulario para añadir nueva herramienta */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Añadir Nueva Herramienta</h2>
        <form action={addTool} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-zinc-900 mb-2">Nombre</label>
            <input type="text" name="name" placeholder="Ej. ESP32, Arduino IDE, Python..." className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-black" required />
          </div>
          
          <div className="w-full md:w-48">
            <label className="block text-sm font-bold text-zinc-900 mb-2">Categoría</label>
            <select name="category" className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-black" required>
              <option value="software">Software / IDE</option>
              <option value="hardware">Hardware / Sensor</option>
              <option value="language">Lenguaje de Prog.</option>
            </select>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-zinc-900 mb-2">Enlace (Opcional)</label>
            <input type="url" name="description_url" placeholder="https://..." className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-black" />
          </div>

          <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-zinc-800 transition-colors h-[42px]">
            + Guardar
          </button>
        </form>
      </div>

      {/* Cuadrícula de Herramientas Existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools && tools.length > 0 ? (
          tools.map((tool) => (
            <div key={tool.id} className="bg-white rounded-xl border border-zinc-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${categoryStyles[tool.category]?.color}`}>
                    {categoryStyles[tool.category]?.label}
                  </span>
                  {/* Botón para eliminar */}
                  <form action={deleteTool}>
                    <input type="hidden" name="id" value={tool.id} />
                    <button type="submit" className="text-zinc-400 hover:text-red-600 transition-colors" title="Eliminar">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </form>
                </div>
                <h3 className="text-xl font-bold text-zinc-900">{tool.name}</h3>
                {tool.description_url && (
                  <a href={tool.description_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                    Ver documentación / enlace ↗
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-300">
            <p className="text-zinc-500 font-semibold">Tu inventario está vacío.</p>
            <p className="text-sm text-zinc-400 mt-1">Añade tu primera herramienta usando el formulario de arriba.</p>
          </div>
        )}
      </div>
    </div>
  );
}