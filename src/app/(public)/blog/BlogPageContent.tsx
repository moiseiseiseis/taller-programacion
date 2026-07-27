'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { urlKind } from '@/lib/media';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  created_at: string;
  cover_url: string | null;
};

export default function BlogPageContent({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="max-w-5xl mx-auto relative z-10">

      {/* Encabezado del Blog */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 border-b border-brand-terminal-border pb-8 text-center md:text-left"
      >
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4 text-brand-beige">
          Blog & Notas
        </h1>
        <p className="text-[#9c9c94] text-lg font-serif italic">
          Investigaciones, tutoriales y reflexiones sobre tecnología y sus interacciones con la sociedad.
        </p>
      </motion.div>

      {/* Cuadrícula de Tarjetas */}
      {posts.length === 0 ? (
        <div className="text-center py-24 text-[#9c9c94]/70 font-serif italic text-lg">
          Todavía no hay publicaciones. Vuelve pronto.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.1, 0.5), duration: 0.5 }}
              className="group relative bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl overflow-hidden hover:border-brand-mint/50 hover:shadow-xl hover:shadow-brand-mint/5 transition-all flex flex-col h-full"
            >
              {post.cover_url && (
                <div className="w-full h-40 bg-black/30 overflow-hidden">
                  {urlKind(post.cover_url) === 'video' ? (
                    <video src={post.cover_url} muted loop autoPlay playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={post.cover_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              <div className="p-8 flex flex-col flex-grow">
                {/* Etiquetas */}
                <div className="flex items-center justify-between mb-6">
                  {post.category ? (
                    <span className="text-xs font-sans font-bold text-brand-salmon bg-brand-salmon/10 px-3 py-1 rounded-full uppercase tracking-wider border border-brand-salmon/20">
                      {post.category}
                    </span>
                  ) : <span />}
                  <span className="text-xs font-sans font-semibold text-brand-steel">
                    {new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Título del artículo*/}
                <h2 className="text-2xl font-serif font-bold mb-4 text-brand-beige group-hover:text-brand-mint transition-colors leading-tight">
                  {post.title}
                </h2>

                {/* Resumen*/}
                <p className="text-sm font-sans text-[#9c9c94] mb-8 flex-grow line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Botón de lectura */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-auto flex items-center text-sm font-sans font-bold text-brand-mint group-hover:gap-2 transition-all"
                >
                  Leer más
                  <span className="opacity-0 -translate-x-2 text-brand-salmon group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-1">
                    →
                  </span>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
