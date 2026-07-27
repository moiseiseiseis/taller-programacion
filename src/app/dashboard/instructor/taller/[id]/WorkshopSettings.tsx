'use client';

import { updateWorkshopDescription } from '../../actions';

export default function WorkshopSettings({
  workshopId,
  initialDescription,
}: {
  workshopId: string;
  initialDescription: string | null;
}) {
  return (
    <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-brand-beige">Abstract del taller</h2>
        <p className="text-sm text-[#9c9c94]">Se muestra debajo del título, tanto en este panel como en la vista del alumno.</p>
      </div>
      <form action={updateWorkshopDescription} className="space-y-4">
        <input type="hidden" name="workshop_id" value={workshopId} />
        <textarea
          name="description"
          defaultValue={initialDescription || ''}
          rows={3}
          placeholder="Resumen corto del taller."
          className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="py-2 px-5 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border"
          >
            Guardar abstract
          </button>
        </div>
      </form>
    </div>
  );
}
