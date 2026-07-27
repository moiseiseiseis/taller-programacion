'use client';

import { useRef, useState, type RefObject } from 'react';
import { createClient } from '@/lib/supabase/client';

const MAX_SIZE_BYTES = 200 * 1024 * 1024;

export default function InsertImageButton({
  textareaRef,
  value,
  onChange,
  folder,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
  folder: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      alert('El archivo pesa más de 200MB.');
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

      const textarea = textareaRef.current;
      const start = textarea?.selectionStart ?? value.length;
      const end = textarea?.selectionEnd ?? value.length;
      const snippet = `![](${data.publicUrl})`;
      const next = value.slice(0, start) + snippet + value.slice(end);
      onChange(next);

      requestAnimationFrame(() => {
        textarea?.focus();
        const cursor = start + snippet.length;
        textarea?.setSelectionRange(cursor, cursor);
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Hubo un error al subir la imagen.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="text-xs font-bold text-brand-mint hover:brightness-110 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {isUploading ? 'Subiendo imagen...' : '+ Insertar imagen'}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </>
  );
}
