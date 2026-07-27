import { createEvent } from '@/app/dashboard/events/actions';
import Link from 'next/link';
import { Calendar, MapPin, Type, AlignLeft, Link as LinkIcon, Video } from 'lucide-react';

export default function NuevoEventoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      
      {/* Encabezado */}
      <div className="border-b border-brand-terminal-border pb-6">
        <Link
          href="/dashboard/instructor/events"
          className="text-sm font-bold text-[#6f6f68] hover:text-brand-mint transition-colors mb-4 inline-block"
        >
          ← Volver a Eventos
        </Link>
        <h1 className="font-mono text-3xl font-bold text-brand-beige tracking-tight">Agendar Evento</h1>
        <p className="text-[#9c9c94] mt-2">
          Crea un nuevo evento presencial o virtual para los estudiantes.
        </p>
      </div>

      {/* Formulario */}
      <form action={createEvent} className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 md:p-8 space-y-6">

        {/* Título */}
        <div className="space-y-2">
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-bold text-brand-beige">
            <Type size={16} className="text-[#6f6f68]" />
            Título del Evento
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="Ej. Seminario de Interfaces Cerebro-Computadora"
            className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-xl focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all placeholder:text-[#6f6f68]"
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <label htmlFor="description" className="flex items-center gap-2 text-sm font-bold text-brand-beige">
            <AlignLeft size={16} className="text-[#6f6f68]" />
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Detalla de qué tratará el evento, qué deben llevar los alumnos, etc."
            className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-xl focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all resize-none placeholder:text-[#6f6f68]"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Evento */}
          <div className="space-y-2">
            <label htmlFor="event_type" className="flex items-center gap-2 text-sm font-bold text-brand-beige">
              <Video size={16} className="text-[#6f6f68]" />
              Modalidad
            </label>
            <select
              id="event_type"
              name="event_type"
              required
              className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-xl focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all cursor-pointer"
            >
              <option value="presencial">📍 Presencial</option>
              <option value="online">💻 Online (Virtual)</option>
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-2">
            <label htmlFor="event_date" className="flex items-center gap-2 text-sm font-bold text-brand-beige">
              <Calendar size={16} className="text-[#6f6f68]" />
              Fecha y Hora Exacta
            </label>
            <input
              type="datetime-local"
              id="event_date"
              name="event_date"
              required
              className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-xl focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all"
            />
          </div>
        </div>

        {/* Ubicación o Enlace */}
        <div className="space-y-2">
          <label htmlFor="location_url" className="flex items-center gap-2 text-sm font-bold text-brand-beige">
            <MapPin size={16} className="text-[#6f6f68]" />
            Ubicación o Enlace
          </label>
          <input
            type="text"
            id="location_url"
            name="location_url"
            required
            placeholder="Ej. Auditorio Principal o https://meet.google.com/..."
            className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-xl focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all placeholder:text-[#6f6f68]"
          />
          <p className="text-xs text-[#9c9c94] font-medium ml-1">
            Si es online, pega el enlace de la videollamada. Si es presencial, escribe el lugar.
          </p>
        </div>

        {/* Botón de Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-brand-mint text-[#0f1a15] font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 flex items-center gap-2"
          >
            <Calendar size={18} />
            Publicar Evento
          </button>
        </div>

      </form>
    </div>
  );
}