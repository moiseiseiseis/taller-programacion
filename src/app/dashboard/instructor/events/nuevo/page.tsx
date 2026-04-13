import { createEvent } from '@/app/dashboard/events/actions';
import Link from 'next/link';
import { Calendar, MapPin, Type, AlignLeft, Link as LinkIcon, Video } from 'lucide-react';

export default function NuevoEventoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      
      {/* Encabezado */}
      <div className="border-b border-zinc-200 pb-6">
        <Link 
          href="/dashboard/instructor/events" 
          className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors mb-4 inline-block"
        >
          ← Volver a Eventos
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Agendar Evento</h1>
        <p className="text-zinc-500 mt-2">
          Crea un nuevo evento presencial o virtual para los estudiantes.
        </p>
      </div>

      {/* Formulario */}
      <form action={createEvent} className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Título */}
        <div className="space-y-2">
          <label htmlFor="title" className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <Type size={16} className="text-zinc-400" />
            Título del Evento
          </label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            required 
            placeholder="Ej. Seminario de Interfaces Cerebro-Computadora"
            className="w-full border border-zinc-300 bg-zinc-50 p-3 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <label htmlFor="description" className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <AlignLeft size={16} className="text-zinc-400" />
            Descripción
          </label>
          <textarea 
            id="description" 
            name="description" 
            required 
            rows={4}
            placeholder="Detalla de qué tratará el evento, qué deben llevar los alumnos, etc."
            className="w-full border border-zinc-300 bg-zinc-50 p-3 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all resize-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Evento */}
          <div className="space-y-2">
            <label htmlFor="event_type" className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <Video size={16} className="text-zinc-400" />
              Modalidad
            </label>
            <select 
              id="event_type" 
              name="event_type" 
              required
              className="w-full border border-zinc-300 bg-zinc-50 p-3 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer"
            >
              <option value="presencial">📍 Presencial</option>
              <option value="online">💻 Online (Virtual)</option>
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-2">
            <label htmlFor="event_date" className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <Calendar size={16} className="text-zinc-400" />
              Fecha y Hora Exacta
            </label>
            <input 
              type="datetime-local" 
              id="event_date" 
              name="event_date" 
              required 
              className="w-full border border-zinc-300 bg-zinc-50 p-3 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
            />
          </div>
        </div>

        {/* Ubicación o Enlace */}
        <div className="space-y-2">
          <label htmlFor="location_url" className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <MapPin size={16} className="text-zinc-400" />
            Ubicación o Enlace
          </label>
          <input 
            type="text" 
            id="location_url" 
            name="location_url" 
            required 
            placeholder="Ej. Auditorio Principal o https://meet.google.com/..."
            className="w-full border border-zinc-300 bg-zinc-50 p-3 rounded-xl focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all"
          />
          <p className="text-xs text-zinc-500 font-medium ml-1">
            Si es online, pega el enlace de la videollamada. Si es presencial, escribe el lugar.
          </p>
        </div>

        {/* Botón de Submit */}
        <div className="pt-4 flex justify-end">
          <button 
            type="submit"
            className="bg-zinc-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-zinc-800 transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <Calendar size={18} />
            Publicar Evento
          </button>
        </div>
        
      </form>
    </div>
  );
}