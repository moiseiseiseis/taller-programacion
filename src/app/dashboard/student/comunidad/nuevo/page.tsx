import { getCommunities, createPost } from '../actions';
import Link from 'next/link';

export default async function NuevoPostPage() {
  // Necesitamos traer las comunidades para llenar el "Select" (menú desplegable)
  const communities = await getCommunities();

  return (
    <div className="max-w-3xl mx-auto bg-brand-terminal-panel border border-brand-terminal-border rounded-xl p-6">
      <div className="border-b border-brand-terminal-border pb-4 mb-6">
        <h1 className="text-2xl font-serif font-bold text-brand-beige">Crear nueva publicación</h1>
        <p className="text-[#9c9c94] font-sans text-sm mt-1">Comparte tus dudas, proyectos o recursos con la comunidad.</p>
      </div>

      <form action={createPost} className="space-y-6">

        {/* Selector de Comunidad */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="community_id" className="text-sm font-sans font-bold text-brand-beige">
            ¿En qué comunidad quieres publicar?
          </label>
          <select
            id="community_id"
            name="community_id"
            required
            className="border border-brand-terminal-border bg-black/30 p-3 rounded-lg font-sans focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all text-brand-beige"
          >
            <option value="">Selecciona una carrera o foro...</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                c/{c.slug} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-sans font-bold text-brand-beige">
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={100}
            className="border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-lg font-sans focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all placeholder:text-[#6f6f68]"
            placeholder="Ej. ¿Alguien tiene experiencia conectando un ESP32 a un sensor EEG para BCIs?"
          />
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="content" className="text-sm font-sans font-bold text-brand-beige">
            Contenido
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={8}
            className="border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-lg font-sans focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all resize-none placeholder:text-[#6f6f68]"
            placeholder="Estoy armando un proyecto de interfaces cerebro-computadora y tengo un problema con..."
          ></textarea>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-brand-terminal-border">
          <Link
            href="/dashboard/student/comunidad"
            className="px-5 py-2.5 text-[#9c9c94] font-sans font-bold hover:bg-black/30 rounded-lg transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="bg-brand-mint text-[#0f1a15] font-sans font-bold px-6 py-2.5 rounded-lg hover:brightness-110 transition-all"
          >
            Publicar
          </button>
        </div>

      </form>
    </div>
  );
}