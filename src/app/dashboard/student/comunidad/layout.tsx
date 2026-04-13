import { getCommunities } from './actions';
import Link from 'next/link';

export default async function ComunidadLayout({ children }: { children: React.ReactNode }) {
  // Traemos todas las carreras/subs de la base de datos
  const communities = await getCommunities();

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto items-start">
      
      {/* barra lateral con subforos */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white border border-brand-steel/20 rounded-xl p-4 sticky top-6 shadow-sm">
          <h2 className="font-serif font-bold text-brand-dark mb-4 text-lg border-b border-brand-steel/20 pb-2">
            Comunidades
          </h2>
          
          <ul className="space-y-1 h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <li>
              <Link 
                href="/dashboard/student/comunidad" 
                className="block px-3 py-2 text-sm font-sans font-bold text-brand-ieee bg-brand-ieee/5 hover:bg-brand-ieee/10 rounded-md transition-colors mb-2"
              >
                Feed Global
              </Link>
            </li>
            
            {communities.map((c) => (
              <li key={c.id}>
                <Link 
                  href={`/dashboard/student/comunidad/c/${c.slug}`} 
                  className="block px-3 py-2 text-sm font-sans font-medium text-brand-brown hover:bg-brand-mint/20 hover:text-brand-ieee rounded-md transition-colors"
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