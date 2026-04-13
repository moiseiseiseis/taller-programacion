import { createWorkshop } from '../actions';
import Link from 'next/link';

export default function CrearTallerPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Crear Nuevo Taller</h1>
        <Link 
          href="/dashboard/instructor" 
          className="text-sm font-semibold text-zinc-500 hover:text-black transition-colors"
        >
          ← Volver al panel
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <form action={createWorkshop} className="space-y-6">
          
          {/* Campo Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-zinc-900 mb-1">
              Título del Taller
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              placeholder="Ej. Introducción a Python para Biomédicos"
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
            />
          </div>

          {/* Campo Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-zinc-900 mb-1">
              Descripción General
            </label>
            <textarea
              name="description"
              id="description"
              required
              rows={5}
              placeholder="Describe qué aprenderán los alumnos en este taller..."
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors resize-none"
            />
          </div>

          {/* Botón Guardar */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all"
            >
              Publicar Taller
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}