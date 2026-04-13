import { createWorkshop } from '@/lib/workshops/actions'

export default function CreateWorkshopForm() {
  return (
    <form action={createWorkshop} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow-sm border border-brand-steel/20">
      <div>
        <label className="block text-sm font-bold font-sans text-brand-dark mb-1">Título del Taller</label>
        <input name="title" type="text" required className="w-full border border-brand-steel/30 p-2 rounded focus:ring-2 focus:ring-brand-ieee outline-none" />
      </div>
      <div>
        <label className="block text-sm font-bold font-sans text-brand-dark mb-1">Descripción</label>
        <textarea name="description" rows={4} className="w-full border border-brand-steel/30 p-2 rounded focus:ring-2 focus:ring-brand-ieee outline-none" />
      </div>
      <button type="submit" className="bg-brand-salmon text-white font-sans font-bold py-2 px-6 rounded hover:opacity-90 transition-opacity">
        Crear Taller
      </button>
    </form>
  )
}