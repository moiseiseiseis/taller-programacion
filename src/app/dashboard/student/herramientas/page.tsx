import { createClient } from '@/lib/supabase/server';

const categoryLabels: Record<string, string> = {
  hardware: 'Microcontroladores y Sensores (Hardware)',
  software: 'Entornos de Desarrollo (Software)',
  language: 'Lenguajes de Programación',
};

const categoryColors: Record<string, string> = {
  hardware: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  software: 'bg-brand-steel/10 text-brand-steel border-brand-steel/30',
  language: 'bg-brand-mint/10 text-brand-mint border-brand-mint/30',
};

export default async function StudentToolsDirectory() {
  const supabase = await createClient();

  // Traemos todas las herramientas de la plataforma 
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });

  // Agrupamos las herramientas por su categoría 
  const groupedTools = (tools || []).reduce((acc: any, tool: any) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="bg-brand-terminal-panel border border-brand-terminal-border text-brand-beige p-10 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="font-mono text-4xl font-bold mb-4">Directorio de Hrramientas</h1>
          <p className="text-[#9c9c94] max-w-2xl text-lg">
            Explora todas las herramientas, lenguajes y hardware que aprenderás a dominar a lo largo de nuestros talleres. Haz clic en cualquiera para ir a su documentación oficial.
          </p>
        </div>
        {/* Decoración abstracta de fondo */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-mint/10 rounded-full opacity-50 blur-3xl"></div>
      </div>

      {Object.keys(groupedTools).length === 0 ? (
        <div className="p-12 text-center border border-dashed border-brand-terminal-border rounded-2xl">
          <p className="text-[#9c9c94] font-semibold text-lg">Aún no hay herramientas registradas.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.keys(categoryLabels).map((categoryKey) => {
            const categoryTools = groupedTools[categoryKey];

            // Si no hay herramientas en esta categoría, no la dibujamos
            if (!categoryTools || categoryTools.length === 0) return null;

            return (
              <div key={categoryKey}>
                <h2 className="font-mono text-2xl font-bold text-brand-beige mb-6 flex items-center gap-3">
                  {categoryKey === 'hardware' ? '🔌' : categoryKey === 'software' ? '' : ''}
                  {categoryLabels[categoryKey]}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryTools.map((tool: any) => (
                    <a
                      key={tool.id}
                      href={tool.description_url || '#'}
                      target={tool.description_url ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="group bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border hover:border-brand-mint/50 transition-all flex flex-col justify-between h-full"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${categoryColors[tool.category]}`}>
                            {categoryKey.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-brand-beige group-hover:text-brand-mint transition-colors">
                          {tool.name}
                        </h3>
                      </div>

                      {tool.description_url ? (
                        <div className="mt-6 text-sm font-semibold text-[#9c9c94] group-hover:text-brand-mint flex items-center gap-1 transition-colors">
                          Leer documentación <span>→</span>
                        </div>
                      ) : (
                        <div className="mt-6 text-sm text-[#6f6f68] italic">
                          Documentación pendiente
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}