import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BlogQuiz, { QuizData } from '@/components/blog/BlogQuiz';
import { urlKind } from '@/lib/media';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto relative z-10">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-sans font-bold text-brand-mint hover:text-brand-salmon transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Volver al blog
      </Link>

      {post.cover_url && (
        <div className="w-full rounded-2xl overflow-hidden mb-8 bg-black/30 border border-brand-terminal-border">
          {urlKind(post.cover_url) === 'video' ? (
            <video src={post.cover_url} controls className="w-full max-h-[420px] object-cover" />
          ) : (
            <img src={post.cover_url} alt="" className="w-full max-h-[420px] object-cover" />
          )}
        </div>
      )}

      <div className="mb-10 border-b border-brand-terminal-border pb-8">
        {post.category && (
          <span className="inline-block text-xs font-sans font-bold text-brand-salmon bg-brand-salmon/10 px-3 py-1 rounded-full uppercase tracking-wider border border-brand-salmon/20 mb-4">
            {post.category}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-brand-beige mb-4">
          {post.title}
        </h1>
        <span className="text-sm font-sans font-semibold text-brand-steel">
          {new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div
        className="font-sans text-[#c8c8c0] leading-relaxed
          [&>*]:mb-4
          [&_h1]:text-3xl [&_h1]:font-serif [&_h1]:font-bold [&_h1]:text-brand-beige
          [&_h2]:text-2xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-brand-beige
          [&_h3]:text-xl [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-brand-beige
          [&_a]:text-brand-mint [&_a]:underline
          [&_ul]:list-disc [&_ul]:pl-6
          [&_ol]:list-decimal [&_ol]:pl-6
          [&_img]:rounded-xl [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto
          [&_code]:bg-black/30 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
          [&_pre]:bg-black/40 [&_pre]:text-[#c8c8c0] [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-brand-terminal-border
          [&_blockquote]:border-l-4 [&_blockquote]:border-brand-terminal-border [&_blockquote]:pl-4 [&_blockquote]:italic"
      >
        <ReactMarkdown>{post.content_markdown}</ReactMarkdown>
      </div>

      {post.quiz && <BlogQuiz quiz={post.quiz as QuizData} />}
    </article>
  );
}
