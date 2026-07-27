import { createWorkshop } from '../actions';
import Link from 'next/link';

export default function CrearTallerPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Crear Nuevo Taller</h1>
        <Link
          href="/dashboard/instructor"
          className="text-sm font-semibold text-[#9c9c94] hover:text-brand-mint transition-colors"
        >
          ← Volver al panel
        </Link>
      </div>

      <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border p-8">
        <form action={createWorkshop} className="space-y-6">

          {/* Campo Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-brand-beige mb-1">
              Título del Taller
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              placeholder="Ej. Introducción a Python para Biomédicos"
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none transition-colors placeholder:text-[#6f6f68]"
            />
          </div>

          {/* Campo Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-brand-beige mb-1">
              Descripción General
            </label>
            <textarea
              name="description"
              id="description"
              required
              rows={5}
              placeholder="Describe qué aprenderán los alumnos en este taller..."
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none transition-colors resize-none placeholder:text-[#6f6f68]"
            />
          </div>

          {/* Botón Guardar */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-terminal focus:ring-brand-mint transition-all"
            >
              Publicar Taller
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}