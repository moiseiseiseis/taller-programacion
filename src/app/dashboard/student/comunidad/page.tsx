import { getPosts } from './actions';
import Link from 'next/link';
import { MessageSquare, Plus, User, Clock, Hash } from 'lucide-react';

export default async function ComunidadHomePage() {
  const posts = await getPosts();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Comunidad TDPPNP</h1>
          <p className="text-zinc-500 mt-2 text-lg">
            Intercambia ideas, dudas y proyectos con la comunidad.
          </p>
        </div>
        <Link 
          href="/dashboard/student/comunidad/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus size={20} />
          <span>Nueva Publicación</span>
        </Link>
      </div>

      {/* Lista de Posts */}
      <div className="grid gap-4">
        {posts.length === 0 ? (
          <div className="p-16 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MessageSquare className="text-zinc-400" size={28} />
            </div>
            <h3 className="text-zinc-900 font-bold text-xl mb-1">Silencio absoluto...</h3>
            <p className="text-zinc-500 max-w-xs mx-auto">
              Nadie ha publicado nada todavía. Sé valiente y rompe el hielo.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <Link 
              href={`/dashboard/student/comunidad/p/${post.id}`} 
              key={post.id} 
              className="group relative bg-white border border-zinc-200 rounded-2xl p-6 hover:border-zinc-900 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
            >
              <div className="flex gap-5">
                {/* Avatar / Inicial del Autor */}
                <div className="hidden sm:flex flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition-colors uppercase font-bold text-xs">
                   
                    {post.user?.name?.charAt(0) || <User size={18} />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Metadatos */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mb-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter border border-blue-100">
                      <Hash size={12} />
                      {post.community?.slug}
                    </span>
                    <span className="text-zinc-300">|</span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                     
                      {post.user?.name || 'Anónimo'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock size={14} />
                      {new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  {/* Título y Extracto */}
                  <h3 className="text-xl font-bold text-zinc-900 mb-2 leading-tight group-hover:underline decoration-zinc-300 underline-offset-4">
                    {post.title}
                  </h3>
                  <p className="text-zinc-600 text-sm line-clamp-2 leading-relaxed mb-4">
                    {post.content}
                  </p>
                  
                  {/* Footer - Interacciones */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">
                      <MessageSquare size={16} />
                      {post.comments?.[0]?.count || 0} 
                      <span className="font-medium">comentarios</span>
                    </div>
                    
                    {/* Indicador de "Leer más" */}
                    <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
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