import { getCommunities } from './actions';
import Link from 'next/link';

export default async function ComunidadLayout({ children }: { children: React.ReactNode }) {
  // Traemos todas las carreras/subs de la base de datos
  const communities = await getCommunities();

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto items-start">
      
      {/* barra lateral con subforos */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-brand-terminal-panel border border-brand-terminal-border rounded-xl p-4 sticky top-6">
          <h2 className="font-mono font-bold text-brand-beige mb-4 text-lg border-b border-brand-terminal-border pb-2">
            Comunidades
          </h2>

          <ul className="space-y-1 h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <li>
              <Link
                href="/dashboard/student/comunidad"
                className="block px-3 py-2 text-sm font-sans font-bold text-brand-mint bg-brand-mint/10 hover:bg-brand-mint/20 rounded-md transition-colors mb-2"
              >
                Feed Global
              </Link>
            </li>

            {communities.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/student/comunidad/c/${c.slug}`}
                  className="block px-3 py-2 text-sm font-sans font-medium text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint rounded-md transition-colors"
                >
                  c/{c.slug}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* feed */}
      <main className="flex-1 w-full">
        {children}
      </main>
      
    </div>
  );
}