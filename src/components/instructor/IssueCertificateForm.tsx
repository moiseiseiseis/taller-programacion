'use client';

import { useState } from 'react';
import SubmitButton from '@/components/ui/SubmitButton';

export default function IssueCertificateForm({
  workshopId,
  studentId,
  action,
}: {
  workshopId: string;
  studentId: string;
  action: (workshopId: string, studentId: string, formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold px-3 py-1.5 rounded-md bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20 border border-brand-mint/30"
      >
        Emitir certificado
      </button>
    );
  }

  return (
    <form
      action={action.bind(null, workshopId, studentId)}
      className="flex flex-col gap-2 text-left bg-black/20 border border-brand-terminal-border rounded-lg p-3 w-64 ml-auto"
    >
      <div>
        <label className="block text-[10px] font-bold text-[#9c9c94] mb-1">Fecha de realización</label>
        <input
          type="date"
          name="realized_at"
          required
          className="w-full text-xs bg-black/30 border border-brand-terminal-border rounded px-2 py-1.5 text-brand-beige"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-[#9c9c94] mb-1">Lugar</label>
        <input
          type="text"
          name="location"
          required
          placeholder="Laboratorio de Desarrollo Tecnológico"
          className="w-full text-xs bg-black/30 border border-brand-terminal-border rounded px-2 py-1.5 text-brand-beige placeholder:text-[#6f6f68]"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-[#9c9c94] mb-1">Duración (horas)</label>
        <input
          type="number"
          name="duration_hours"
          required
          min="0"
          step="0.5"
          placeholder="4"
          className="w-full text-xs bg-black/30 border border-brand-terminal-border rounded px-2 py-1.5 text-brand-beige placeholder:text-[#6f6f68]"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 text-xs font-bold px-3 py-1.5 rounded-md bg-black/30 text-[#9c9c94] hover:bg-black/40 transition-colors"
        >
          Cancelar
        </button>
        <SubmitButton
          pendingText="Emitiendo"
          className="flex-1 text-xs font-bold px-3 py-1.5 rounded-md bg-brand-mint text-[#0f1a15] hover:brightness-110"
        >
          Emitir
        </SubmitButton>
      </div>
    </form>
  );
}
