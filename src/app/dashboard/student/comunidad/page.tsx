import { getPosts } from './actions';
import Link from 'next/link';
import { MessageSquare, Plus, User, Clock, Hash } from 'lucide-react';

export default async function ComunidadHomePage() {
  const posts = await getPosts();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-terminal-border pb-8">
        <div>
          <h1 className="font-mono text-3xl font-bold text-brand-beige tracking-tight">Comunidad TDPPNP</h1>
          <p className="text-[#9c9c94] mt-2 text-lg">
            Intercambia ideas, dudas y proyectos con la comunidad.
          </p>
        </div>
        <Link
          href="/dashboard/student/comunidad/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-brand-mint text-[#0f1a15] px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Nueva Publicación</span>
        </Link>
      </div>

      {/* Lista de Posts */}
      <div className="grid gap-4">
        {posts.length === 0 ? (
          <div className="p-16 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
            <div className="bg-black/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-[#6f6f68]" size={28} />
            </div>
            <h3 className="text-brand-beige font-bold text-xl mb-1">Silencio absoluto...</h3>
            <p className="text-[#9c9c94] max-w-xs mx-auto">
              Nadie ha publicado nada todavía. Sé valiente y rompe el hielo.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <Link
              href={`/dashboard/student/comunidad/p/${post.id}`}
              key={post.id}
              className="group relative bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 hover:border-brand-mint/50 transition-all duration-300"
            >
              <div className="flex gap-5">
                {/* Avatar / Inicial del Autor */}
                <div className="hidden sm:flex flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center border border-brand-terminal-border text-[#9c9c94] group-hover:bg-brand-mint group-hover:text-[#0f1a15] transition-colors uppercase font-bold text-xs">

                    {post.user?.name?.charAt(0) || <User size={18} />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Metadatos */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mb-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-brand-steel bg-brand-steel/10 px-2 py-0.5 rounded uppercase tracking-tighter border border-brand-steel/30">
                      <Hash size={12} />
                      {post.community?.slug}
                    </span>
                    <span className="text-[#4a4a44]">|</span>
                    <span className="flex items-center gap-1 text-xs text-[#9c9c94] font-medium">

                      {post.user?.name || 'Anónimo'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#6f6f68]">
                      <Clock size={14} />
                      {new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Título y Extracto */}
                  <h3 className="text-xl font-bold text-brand-beige mb-2 leading-tight group-hover:underline decoration-brand-terminal-border underline-offset-4">
                    {post.title}
                  </h3>
                  <p className="text-[#9c9c94] text-sm line-clamp-2 leading-relaxed mb-4">
                    {post.content}
                  </p>

                  {/* Footer - Interacciones */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#6f6f68] group-hover:text-brand-mint transition-colors">
                      <MessageSquare size={16} />
                      {post.comments?.[0]?.count || 0}
                      <span className="font-medium">comentarios</span>
                    </div>

                    {/* Indicador de "Leer más" */}
                    <span className="text-xs font-bold text-brand-mint opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                      Leer discusión →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}