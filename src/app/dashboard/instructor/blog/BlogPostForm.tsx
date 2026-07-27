'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBlogPost, updateBlogPost } from './actions';
import MediaUploader from '@/components/media/MediaUploader';
import InsertImageButton from '@/components/media/InsertImageButton';

type BlogPost = {
  id: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  content_markdown: string;
  is_published: boolean;
  quiz: unknown | null;
  cover_url: string | null;
};

const QUIZ_PLACEHOLDER = `{
  "questions": [
    {
      "text": "¿Tu trabajo se puede resumir en \\"copiar, pegar y ajustar un poco\\"?",
      "options": [
        { "label": "Nunca, cada tarea es única", "score": 0 },
        { "label": "A veces", "score": 1 },
        { "label": "Casi siempre", "score": 2 }
      ]
    }
  ],
  "results": [
    { "max": 1, "title": "Tranquilo/a", "text": "Tu trabajo está a salvo, por ahora." },
    { "max": 2, "title": "Ojo", "text": "Empieza a usar la IA a tu favor." }
  ]
}`;

export default function BlogPostForm({ post }: { post?: BlogPost }) {
  const [title, setTitle] = useState(post?.title || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [category, setCategory] = useState(post?.category || '');
  const [content, setContent] = useState(post?.content_markdown || '');
  const [isPublished, setIsPublished] = useState(post?.is_published || false);
  const [quizJson, setQuizJson] = useState(post?.quiz ? JSON.stringify(post.quiz, null, 2) : '');
  const [coverUrl, setCoverUrl] = useState(post?.cover_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (quizJson.trim()) {
      try {
        JSON.parse(quizJson);
      } catch {
        alert('El JSON del quiz no es válido. Revisa el formato antes de guardar.');
        return;
      }
    }

    setIsSaving(true);

    const formData = new FormData();
    if (post) formData.append('id', post.id);
    formData.append('title', title);
    formData.append('excerpt', excerpt);
    formData.append('category', category);
    formData.append('content_markdown', content);
    formData.append('is_published', String(isPublished));
    formData.append('quiz_json', quizJson);
    formData.append('cover_url', coverUrl);

    try {
      if (post) {
        await updateBlogPost(formData);
      } else {
        await createBlogPost(formData);
      }
      router.push('/dashboard/instructor/blog');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar el post.');
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border p-6 space-y-6">
      <div>
        <label className="block text-sm font-bold text-brand-beige mb-2">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-brand-terminal-border bg-black/30 text-brand-beige rounded-lg focus:ring-2 focus:ring-brand-mint outline-none"
          required
        />
      </div>

      <MediaUploader
        value={coverUrl}
        onChange={setCoverUrl}
        label="Portada del post (imagen o video, opcional)"
        folder="blog/covers"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-brand-beige mb-2">Categoría</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej. IA y Sociedad"
            className="w-full px-4 py-2 border border-brand-terminal-border bg-black/30 text-brand-beige rounded-lg focus:ring-2 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 font-bold text-sm text-brand-beige pb-2.5">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-brand-mint"
            />
            Publicado (visible en /blog)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-brand-beige mb-2">Resumen</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          placeholder="Uno o dos renglones para la tarjeta del listado."
          className="w-full px-4 py-2 border border-brand-terminal-border bg-black/30 text-brand-beige rounded-lg focus:ring-2 focus:ring-brand-mint outline-none text-sm placeholder:text-[#6f6f68]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-brand-beige">Contenido (Markdown)</label>
          <InsertImageButton textareaRef={contentRef} value={content} onChange={setContent} folder="blog/content" />
        </div>
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="w-full px-4 py-3 border border-brand-terminal-border bg-black/30 text-brand-beige rounded-lg focus:ring-2 focus:ring-brand-mint outline-none font-mono text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-brand-beige mb-2">Quiz interactivo (JSON, opcional)</label>
        <textarea
          value={quizJson}
          onChange={(e) => setQuizJson(e.target.value)}
          rows={10}
          placeholder={QUIZ_PLACEHOLDER}
          className="w-full px-4 py-3 border border-brand-terminal-border bg-black/30 text-brand-beige rounded-lg focus:ring-2 focus:ring-brand-mint outline-none font-mono text-xs placeholder:text-[#6f6f68]"
        />
        <p className="text-xs text-[#6f6f68] mt-1">Déjalo vacío si el post no tiene test. Formato: preguntas con opciones puntuadas y rangos de resultado.</p>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-brand-mint text-[#0f1a15] px-6 py-2.5 rounded-lg font-bold hover:brightness-110 disabled:bg-black/30 disabled:text-[#6f6f68] transition-all"
        >
          {isSaving ? 'Guardando...' : post ? 'Guardar cambios' : 'Guardar post'}
        </button>
      </div>
    </form>
  );
}
