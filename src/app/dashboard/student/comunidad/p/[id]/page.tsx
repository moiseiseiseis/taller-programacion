import { getAuthUser } from '@/lib/auth';
import Link from 'next/link';
import {
  getPostById, 
  createComment, 
  toggleLockPost, 
  togglePinPost, 
  toggleEndorseComment, 
  deletePostAsAdmin,
  deleteCommentAsAdmin
} from '../../actions';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return <div className="p-8 text-center text-[#9c9c94]">Publicación no encontrada.</div>;
  }

  // 1. Verificamos si el usuario actual es instructor
  const { role } = await getAuthUser();
  const isInstructor = role === 'instructor';

  // 2. Ordenamos los comentarios (Las respuestas avaladas van primero, luego por fecha)
  const sortedComments = post.comments?.sort((a: any, b: any) => {
    if (a.is_endorsed && !b.is_endorsed) return -1;
    if (!a.is_endorsed && b.is_endorsed) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  }) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      <Link href={`/dashboard/student/comunidad/c/${post.community?.slug}`} className="inline-flex items-center gap-2 text-sm font-sans font-bold text-brand-steel hover:text-brand-mint transition-colors mb-2">
        <span>←</span> Volver a c/{post.community?.slug}
      </Link>

      {/* moderación (solo instructores) */}
      {isInstructor && (
        <div className="bg-black/30 border border-brand-terminal-border rounded-lg p-3 flex flex-wrap gap-3 items-center justify-between">
          <span className="text-xs font-bold text-brand-beige uppercase tracking-widest ml-2 flex items-center gap-2">
            Moderador
          </span>
          <div className="flex gap-2">
            <form action={togglePinPost.bind(null, post.id, post.is_pinned, post.community?.slug)}>
              <button className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${post.is_pinned ? 'bg-brand-mint text-[#0f1a15]' : 'bg-black/30 text-brand-mint border border-brand-mint/30 hover:bg-brand-mint/10'}`}>
                {post.is_pinned ? 'Quitar Fijado' : 'Fijar Post'}
              </button>
            </form>
            <form action={toggleLockPost.bind(null, post.id, post.is_locked)}>
              <button className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${post.is_locked ? 'bg-brand-salmon text-white' : 'bg-black/30 text-brand-salmon border border-brand-salmon/30 hover:bg-brand-salmon/10'}`}>
                {post.is_locked ? 'Abrir Hilo' : 'Cerrar Hilo'}
              </button>
            </form>
            <form action={deletePostAsAdmin.bind(null, post.id)}>
              <button className="text-xs font-bold px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-colors border border-red-500/30">
                Borrar Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* publicacion original*/}
      <article className={`bg-brand-terminal-panel border rounded-xl p-6 md:p-8 relative overflow-hidden ${post.is_pinned ? 'border-brand-mint' : 'border-brand-terminal-border'}`}>

        {/* Etiquetas de estado */}
        <div className="absolute top-0 right-0 flex gap-2 p-6">
          {post.is_pinned && <span className="bg-brand-mint text-[#0f1a15] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Fijado</span>}
          {post.is_locked && <span className="bg-brand-salmon text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Cerrado</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-[#9c9c94] font-medium">Por {post.user?.name || 'Usuario Anónimo'}</span>
          <span className="text-xs text-brand-steel">•</span>
          <span className="text-sm text-brand-steel">
            {new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-serif font-bold text-brand-beige mb-6 leading-tight pr-20">
          {post.title}
        </h1>

        <div className="text-[#c8c8c0] text-base md:text-lg leading-relaxed font-sans whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      {/* comentarios */}
      <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-6 md:p-8">
        <h3 className="text-xl font-serif font-bold text-brand-beige mb-6 border-b border-brand-terminal-border pb-4">
          Comentarios ({sortedComments.length})
        </h3>

        <div className="space-y-6 mb-8">
          {sortedComments.length === 0 ? (
            <p className="text-brand-steel font-sans text-sm italic">Nadie ha comentado aún.</p>
          ) : (
            sortedComments.map((comment: any) => (
              <div
                key={comment.id}
                className={`relative p-5 rounded-lg border transition-all ${comment.is_endorsed ? 'bg-brand-mint/10 border-brand-mint/50 ring-1 ring-brand-mint/20' : 'bg-black/20 border-brand-terminal-border'}`}
              >
                {/* Etiqueta de Avalado */}
                {comment.is_endorsed && (
                  <div className="absolute -top-3 -left-2 bg-brand-mint text-[#0f1a15] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    ✨ Respuesta Avalada por Instructor
                  </div>
                )}

                <div className="flex items-center justify-between mb-3 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-sans text-brand-beige">{comment.user?.name || 'Usuario'}</span>
                    <span className="text-xs text-brand-steel">•</span>
                    <span className="text-xs text-brand-steel">
                      {new Date(comment.created_at).toLocaleDateString('es-MX', { hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>

                  {/* Botón de avalar para instructores */}
                  {isInstructor && (
                    <div className="flex gap-2">
                    <form action={toggleEndorseComment.bind(null, comment.id, post.id, comment.is_endorsed)}>
                      <button className={`text-xs font-bold px-3 py-1 rounded transition-colors border ${comment.is_endorsed ? 'bg-brand-mint text-[#0f1a15] border-brand-mint hover:brightness-110' : 'bg-black/30 text-brand-mint border-brand-mint hover:bg-brand-mint hover:text-[#0f1a15]'}`}>
                        {comment.is_endorsed ? 'Quitar Aval' : 'Avalar'}
                      </button>
                    </form>

                    <form action={deleteCommentAsAdmin.bind(null, comment.id, post.id)}>
                        <button className="text-xs font-bold px-3 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-colors">
                          🗑️ Borrar
                        </button>
                      </form>
                      </div>
                  )}
                </div>

                <p className={`font-sans text-sm whitespace-pre-wrap ${comment.is_endorsed ? 'text-brand-beige font-medium' : 'text-[#9c9c94]'}`}>
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* --- FORMULARIO PARA COMENTAR --- */}
        {post.is_locked ? (
          <div className="bg-black/30 border border-brand-terminal-border rounded-lg p-6 text-center">
            <span className="text-2xl mb-2 block"></span>
            <p className="text-brand-beige font-bold font-sans">Este hilo ha sido cerrado por un moderador.</p>
            <p className="text-[#9c9c94] font-sans text-sm mt-1">Ya no se admiten nuevas respuestas en esta publicación.</p>
          </div>
        ) : (
          <form action={createComment} className="mt-6 flex flex-col gap-3">
            <input type="hidden" name="post_id" value={post.id} />
            <textarea
              name="content"
              required
              rows={3}
              placeholder="Escribe tu respuesta o aporte..."
              className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-4 rounded-lg font-sans focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all resize-none placeholder:text-[#6f6f68]"
            ></textarea>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-brand-mint text-[#0f1a15] font-sans font-bold px-6 py-2.5 rounded-lg hover:brightness-110 transition-all"
              >
                Comentar
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}