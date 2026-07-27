'use client';

import { useState } from 'react';
import { saveModuleCover } from '../../actions';
import MediaUploader from '@/components/media/MediaUploader';

export default function ModuleSettings({
  moduleId,
  initialCoverUrl,
}: {
  moduleId: string;
  initialCoverUrl: string | null;
}) {
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append('module_id', moduleId);
      formData.append('cover_url', coverUrl);
      await saveModuleCover(formData);
      setSaved(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar la portada.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border space-y-4">
      <div>
        <h2 className="text-lg font-bold text-brand-beige">Portada del módulo</h2>
        <p className="text-sm text-[#9c9c94]">Se muestra arriba del módulo en la vista del alumno.</p>
      </div>

      <MediaUploader
        value={coverUrl}
        onChange={(url) => {
          setCoverUrl(url);
          setSaved(false);
        }}
        label="Imagen o video de portada (opcional)"
        folder={`modules/${moduleId}`}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="py-2 px-5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {isSaving ? 'Guardando...' : 'Guardar portada'}
        </button>
        {saved && <span className="text-xs font-bold text-brand-mint">Guardado.</span>}
      </div>
    </div>
  );
}
