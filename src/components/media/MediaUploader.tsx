'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { urlKind } from '@/lib/media';

const MAX_SIZE_BYTES = 200 * 1024 * 1024;

export default function MediaUploader({
  value,
  onChange,
  label,
  folder,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  folder: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > MAX_SIZE_BYTES) {
      setError('El archivo pesa más de 200MB.');
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'bin';
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('media').upload(path, file, {
        contentType: file.type,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('media').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hubo un error al subir el archivo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const kind = urlKind(value);

  return (
    <div>
      <label className="block text-sm font-bold text-brand-beige mb-2">{label}</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pega un link (YouTube o URL directa)..."
          className="flex-1 w-full px-4 py-2 border border-brand-terminal-border bg-black/30 text-brand-beige rounded-lg focus:ring-2 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68] text-sm"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="shrink-0 bg-black/30 text-brand-beige border border-brand-terminal-border px-4 py-2 rounded-lg text-sm font-bold hover:bg-black/40 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {isUploading ? 'Subiendo...' : 'Subir archivo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="text-xs text-brand-salmon mt-2">{error}</p>}

      {value && kind !== 'unknown' && (
        <div className="mt-3 rounded-lg overflow-hidden border border-brand-terminal-border bg-black/20 max-w-xs">
          {kind === 'image' && <img src={value} alt="" className="w-full h-auto max-h-48 object-cover" />}
          {kind === 'video' && <video src={value} controls className="w-full max-h-48" />}
          {kind === 'youtube' && (
            <p className="text-xs text-[#9c9c94] p-3">Link de YouTube detectado — se va a mostrar embebido.</p>
          )}
        </div>
      )}
    </div>
  );
}
