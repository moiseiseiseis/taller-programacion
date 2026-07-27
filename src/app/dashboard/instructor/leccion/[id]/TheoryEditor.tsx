'use client';

import { useRef, useState } from 'react';
import { saveTheoryContent, uploadLessonResource } from '../../actions';
import { useRouter } from 'next/navigation';
import MediaUploader from '@/components/media/MediaUploader';
import InsertImageButton from '@/components/media/InsertImageButton';

export default function TheoryEditor({ lesson, theory }: { lesson: any, theory: any }) {
  const [content, setContent] = useState(theory?.content_markdown || '');
  const [videoUrl, setVideoUrl] = useState(theory?.video_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.append('lesson_id', lesson.id);
    formData.append('content_markdown', content);
    formData.append('video_url', videoUrl);

    try {
      await saveTheoryContent(formData);
      alert('¡Contenido teórico guardado exitosamente!');
      router.refresh();
    } catch (error) {
      alert('Hubo un error al guardar.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFileUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('lesson_id', lesson.id);

    try {
      await uploadLessonResource(formData);
      alert('Archivo adjuntado correctamente');
      (e.target as HTMLFormElement).reset(); // Limpiamos el formulario
      router.refresh(); // Refrescamos para ver el nuevo archivo 
    } catch (error) {
      alert('Error al subir el archivo. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* editor de teroría*/}
      <form onSubmit={handleSave} className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border p-6 space-y-6">
        <div className="border-b border-brand-terminal-border pb-4 mb-4">
          <h2 className="text-xl font-bold text-brand-beige">Contenido Teórico: {lesson.title}</h2>
          <p className="text-sm text-[#9c9c94]">Redacta la clase usando formato Markdown.</p>
        </div>

        <MediaUploader
          value={videoUrl}
          onChange={setVideoUrl}
          label="Video de la lección (link de YouTube o archivo subido, opcional)"
          folder={`theory/${lesson.id}`}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-brand-beige">Texto de la Lección (Markdown)</label>
            <InsertImageButton
              textareaRef={contentRef}
              value={content}
              onChange={setContent}
              folder={`theory/${lesson.id}`}
            />
          </div>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-4 py-3 border border-brand-terminal-border bg-black/30 text-brand-beige rounded-lg focus:ring-2 focus:ring-brand-mint outline-none font-mono text-sm"
            required
          />
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSaving} className="bg-brand-mint text-[#0f1a15] px-6 py-2.5 rounded-lg font-bold hover:brightness-110 disabled:bg-black/30 disabled:text-[#6f6f68] transition-all">
            {isSaving ? 'Guardando...' : 'Guardar Teoría'}
          </button>
        </div>
      </form>

      {/* gestionar recursos adjuntos */}
      <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border p-6">
        <div className="border-b border-brand-terminal-border pb-4 mb-4">
          <h2 className="text-xl font-bold text-brand-beige">Recursos Adjuntos</h2>
          <p className="text-sm text-[#9c9c94]">Sube PDFs, presentaciones o archivos complementarios.</p>
        </div>

        <form onSubmit={handleFileUpload} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-brand-beige mb-2">Título del Archivo</label>
            <input type="text" name="title" placeholder="Ej: Diapositivas de la clase" className="w-full px-4 py-2 border border-brand-terminal-border bg-black/30 text-brand-beige rounded-lg outline-none focus:ring-2 focus:ring-brand-mint placeholder:text-[#6f6f68]" required />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-brand-beige mb-2">Seleccionar Archivo</label>
            <input type="file" name="file" className="w-full px-4 py-1.5 border border-brand-terminal-border bg-black/30 text-brand-beige rounded-lg text-sm" required />
          </div>
          <button type="submit" disabled={isUploading} className="bg-black/30 text-brand-beige border border-brand-terminal-border px-6 py-2 rounded-lg font-bold hover:bg-black/40 disabled:opacity-50 transition-colors h-[42px]">
            {isUploading ? 'Subiendo...' : 'Adjuntar'}
          </button>
        </form>
      </div>
    </div>
  );
}