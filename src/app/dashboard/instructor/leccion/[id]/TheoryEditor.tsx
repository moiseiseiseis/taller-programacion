'use client';

import { useState } from 'react';
import { saveTheoryContent, uploadLessonResource } from '../../actions'; 
import { useRouter } from 'next/navigation';

export default function TheoryEditor({ lesson, theory }: { lesson: any, theory: any }) {
  const [content, setContent] = useState(theory?.content_markdown || '');
  const [videoUrl, setVideoUrl] = useState(theory?.video_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
        <div className="border-b border-zinc-200 pb-4 mb-4">
          <h2 className="text-xl font-bold text-zinc-900">Contenido Teórico: {lesson.title}</h2>
          <p className="text-sm text-zinc-500">Redacta la clase usando formato Markdown.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-900 mb-2">Enlace del Video (Opcional)</label>
          <input 
            type="url" 
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-900 mb-2">Texto de la Lección (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black outline-none font-mono text-sm"
            required
          />
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSaving} className="bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors">
            {isSaving ? 'Guardando...' : 'Guardar Teoría'}
          </button>
        </div>
      </form>

      {/* gestionar recursos adjuntos */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
        <div className="border-b border-zinc-200 pb-4 mb-4">
          <h2 className="text-xl font-bold text-zinc-900">Recursos Adjuntos</h2>
          <p className="text-sm text-zinc-500">Sube PDFs, presentaciones o archivos complementarios.</p>
        </div>

        <form onSubmit={handleFileUpload} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-zinc-900 mb-2">Título del Archivo</label>
            <input type="text" name="title" placeholder="Ej: Diapositivas de la clase" className="w-full px-4 py-2 border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-black" required />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-zinc-900 mb-2">Seleccionar Archivo</label>
            <input type="file" name="file" className="w-full px-4 py-1.5 border border-zinc-300 rounded-lg text-sm" required />
          </div>
          <button type="submit" disabled={isUploading} className="bg-zinc-100 text-black border border-zinc-200 px-6 py-2 rounded-lg font-bold hover:bg-zinc-200 disabled:opacity-50 transition-colors h-[42px]">
            {isUploading ? 'Subiendo...' : 'Adjuntar'}
          </button>
        </form>
      </div>
    </div>
  );
}