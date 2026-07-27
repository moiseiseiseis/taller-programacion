import { createClient } from '@/lib/supabase/server';
import { togglePublishBlogPost, deleteBlogPost } from './actions';
import Link from 'next/link';

export default async function GestionBlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-beige">Gestión del Blog</h1>
          <p className="text-[#9c9c94] mt-2">Crea y publica entradas para el blog público del sitio.</p>
        </div>
        <Link
          href="/dashboard/instructor/blog/nuevo"
          className="bg-brand-mint text-[#0f1a15] px-5 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 transition-all text-center whitespace-nowrap"
        >
          + Nuevo Post
        </Link>
      </div>

      <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border overflow-hidden">
        {posts && posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 border-b border-brand-terminal-border text-[#9c9c94]">
                <tr>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Post</th>
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-terminal-border">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-black/20 transition-colors">
                    <td className="px-6 py-4 min-w-[220px]">
                      <div className="font-bold text-brand-beige">{post.title}</div>
                      <div className="text-[#9c9c94] text-xs line-clamp-1">{post.excerpt}</div>
                    </td>

                    <td className="px-6 py-4">
                      <form action={togglePublishBlogPost}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="current_status" value={post.is_published?.toString()} />
                        <button type="submit" className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${post.is_published ? 'bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20' : 'bg-black/30 text-[#9c9c94] hover:bg-black/40'}`}>
                          {post.is_published ? 'Publicado' : 'Borrador'}
                        </button>
                      </form>
                    </td>

                    <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                      <Link href={`/dashboard/instructor/blog/${post.id}`} className="text-[#9c9c94] font-semibold hover:underline">
                        Editar
                      </Link>
                      <form action={deleteBlogPost} className="inline-block">
                        <input type="hidden" name="id" value={post.id} />
                        <button type="submit" className="text-brand-salmon font-semibold hover:underline">
                          Eliminar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#9c9c94]">
            Todavía no hay posts. Crea el primero con el botón de arriba.
          </div>
        )}
      </div>
    </div>
  );
}
