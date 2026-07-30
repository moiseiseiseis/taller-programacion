'use client';

import { useState } from 'react';
import { saveHackathonEvent } from '../actions';

type EventRow = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  has_levels: boolean;
  start_date: string | null;
  end_date: string | null;
  status: string;
};

export default function HackathonEventForm({ event }: { event: EventRow | null }) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await saveHackathonEvent(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar el evento.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
      <h2 className="text-lg font-bold text-brand-beige mb-4">Datos del evento</h2>
      <form action={handleSubmit} className="space-y-4">
        {event && <input type="hidden" name="event_id" value={event.id} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Nombre</label>
            <input
              type="text"
              name="name"
              defaultValue={event?.name || ''}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              defaultValue={event?.slug || ''}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Tipo</label>
            <select
              name="kind"
              defaultValue={event?.kind || 'team'}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            >
              <option value="team">Por equipos</option>
              <option value="individual">Individual</option>
              <option value="both">Ambos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Estado</label>
            <select
              name="status"
              defaultValue={event?.status || 'draft'}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            >
              <option value="draft">Borrador</option>
              <option value="open">Inscripciones abiertas</option>
              <option value="in_progress">En curso</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-beige">
              <input type="checkbox" name="has_levels" defaultChecked={event?.has_levels ?? true} className="accent-brand-mint" />
              Tiene niveles
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Fecha de inicio</label>
            <input
              type="datetime-local"
              name="start_date"
              defaultValue={event?.start_date?.slice(0, 16) || ''}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Fecha de cierre</label>
            <input
              type="datetime-local"
              name="end_date"
              defaultValue={event?.end_date?.slice(0, 16) || ''}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isSaving ? 'Guardando...' : event ? 'Actualizar evento' : 'Crear evento'}
          </button>
        </div>
      </form>
    </div>
  );
}
