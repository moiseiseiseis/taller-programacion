import { getPosts } from '../../actions';
import Link from 'next/link';

// 1. Le decimos a TypeScript que params es un Promise
export default async function CommunitySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  
  // 2. Extraemos el slug usando await
  const { slug } = await params;
  
  // 3. Ahora usamos nuestra variable limpia 'slug'
  const posts = await getPosts(slug);

  return (
    <div className="space-y-6">
      
      {/* Encabezado del Sub */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-brand-terminal-panel border border-brand-terminal-border p-6 rounded-xl gap-4 border-l-4 border-l-brand-salmon">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-beige">
            {/* 4. Usamos 'slug' en lugar de params.slug */}
            c/{slug}
          </h1>
          <p className="text-[#9c9c94] font-sans text-sm mt-1">
            Espacio de discusión para estudiantes de esta área.
          </p>
        </div>
        <Link
          href="/dashboard/student/comunidad/nuevo"
          className="bg-brand-mint text-[#0f1a15] font-sans font-bold px-5 py-2.5 rounded-lg hover:brightness-110 transition-all shrink-0"
        >
          + Nueva Publicación
        </Link>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="p-12 text-center bg-brand-terminal-panel border border-dashed border-brand-terminal-border rounded-xl">
            {/* 5. También aquí cambiamos params.slug por slug */}
            <p className="text-[#9c9c94] font-sans font-medium mb-2">Aún no hay publicaciones en c/{slug}.</p>
            <p className="text-sm text-brand-steel font-sans">¡Rompe el hielo y sé el primero!</p>
          </div>
        ) : (
          posts.map((post) => (
            <Link
              href={`/dashboard/student/comunidad/p/${post.id}`}
              key={post.id}
              className="block bg-brand-terminal-panel border border-brand-terminal-border rounded-xl p-6 hover:border-brand-mint/50 transition-all cursor-pointer group"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs text-[#9c9c94] font-medium">
                  Por {post.user?.name || 'Usuario Anónimo'}
                </span>
                <span className="text-xs text-brand-steel">•</span>
                <span className="text-xs text-brand-steel">
                  {new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <h3 className="text-xl font-bold font-serif text-brand-beige mb-2 group-hover:text-brand-mint transition-colors">
                {post.title}
              </h3>
              <p className="text-[#9c9c94] font-sans text-sm line-clamp-2">
                {post.content}
              </p>

              <div className="mt-5 flex items-center gap-4 text-sm font-bold text-brand-steel">
                <div className="flex items-center gap-1.5 group-hover:text-brand-salmon transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  {post.comments?.[0]?.count || 0} Comentarios
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}