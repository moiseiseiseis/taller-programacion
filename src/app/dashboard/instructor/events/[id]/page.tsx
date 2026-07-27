import { getEventByIdForInstructor, updateEvent, deleteEventAndRedirect } from '@/app/dashboard/events/actions';
import Link from 'next/link';
import { Calendar, MapPin, Video, Users, User, Clock, FileText, Settings2, Trash2, Edit3, Type, AlignLeft } from 'lucide-react';

export default async function EventDetailsInstructorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventByIdForInstructor(id);

  if (!event) {
    return <div className="p-8 text-center text-[#9c9c94] font-bold">Evento no encontrado o acceso denegado.</div>;
  }

  // Formateo de fecha para lectura
  const eventDate = new Date(event.event_date);
  const fullDate = eventDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time = eventDate.toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' });


  const tzOffset = eventDate.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(eventDate.getTime() - tzOffset)).toISOString().slice(0, 16);

  const sortedParticipants = event.participants?.sort((a: any, b: any) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Botón de regreso */}
      <Link href="/dashboard/instructor/events" className="text-sm font-bold text-[#6f6f68] hover:text-brand-mint transition-colors inline-block">
        ← Volver a todos los eventos
      </Link>

      {/* --- crud del evento--- */}
      <details className="group bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex items-center justify-between p-6 cursor-pointer bg-black/20 hover:bg-black/30 transition-colors">
          <div className="flex items-center gap-2 font-bold text-brand-beige">
            <Settings2 size={20} className="text-[#9c9c94]" />
            Administrar y Editar Evento
          </div>
          <span className="text-[#6f6f68] group-open:rotate-180 transition-transform duration-300">▼</span>
        </summary>

        <div className="p-6 md:p-8 border-t border-brand-terminal-border bg-brand-terminal-panel space-y-8">
          {/* Formulario de Edición */}
          <form action={updateEvent} className="space-y-6">
            <input type="hidden" name="id" value={event.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-brand-beige">
                  <Type size={16} className="text-[#6f6f68]" /> Título del Evento
                </label>
                <input type="text" name="title" defaultValue={event.title} required className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-xl focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint" />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-brand-beige">
                  <Video size={16} className="text-[#6f6f68]" /> Modalidad
                </label>
                <select name="event_type" defaultValue={event.event_type} required className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-xl focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint">
                  <option value="presencial">📍 Presencial</option>
                  <option value="online">💻 Online (Virtual)</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-brand-beige">
                  <AlignLeft size={16} className="text-[#6f6f68]" /> Descripción
                </label>
                <textarea name="description" defaultValue={event.description} required rows={3} className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-xl focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint resize-none"></textarea>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-brand-beige">
                  <MapPin size={16} className="text-[#6f6f68]" /> Ubicación o Enlace
                </label>
                <input type="text" name="location_url" defaultValue={event.location_url} required className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-xl focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint" />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-brand-beige">
                  <Calendar size={16} className="text-[#6f6f68]" /> Fecha y Hora
                </label>
                <input type="datetime-local" name="event_date" defaultValue={localISOTime} required className="w-full border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-xl focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-brand-mint text-[#0f1a15] font-bold px-6 py-2.5 rounded-xl hover:brightness-110 transition-all flex items-center gap-2">
                <Edit3 size={18} /> Guardar Cambios
              </button>
            </div>
          </form>

          {/* Borrar Evento */}
          <div className="border-t border-brand-salmon/20 pt-6 mt-6">
            <h3 className="text-brand-salmon font-bold mb-2 flex items-center gap-2">
              <Trash2 size={18} /> Eliminar evento
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-salmon/10 p-4 rounded-xl border border-brand-salmon/20">
              <p className="text-sm text-brand-salmon font-medium">Borrar este evento eliminará a todos los participantes registrados. Esta acción no se puede deshacer.</p>
              <form action={deleteEventAndRedirect.bind(null, event.id)}>
                <button className="bg-brand-salmon text-white font-bold px-5 py-2 rounded-lg hover:brightness-110 transition-all whitespace-nowrap">
                  Eliminar Evento Definitivamente
                </button>
              </form>
            </div>
          </div>
        </div>
      </details>

      {/* --- TARJETA RESUMEN DEL EVENTO --- */}
      <div className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 flex gap-2">
          {event.event_type === 'online' ? (
            <span className="inline-flex items-center gap-1 text-xs font-black text-brand-steel bg-brand-steel/10 px-3 py-1.5 rounded-lg uppercase tracking-wider"><Video size={14} /> Virtual</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-black text-brand-mint bg-brand-mint/10 px-3 py-1.5 rounded-lg uppercase tracking-wider"><MapPin size={14} /> Presencial</span>
          )}
        </div>

        <h1 className="font-mono text-3xl font-bold text-brand-beige pr-32 mb-4">{event.title}</h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-[#9c9c94] mb-6 font-medium">
          <span className="flex items-center gap-2"><Calendar size={18} className="text-[#6f6f68]" /><span className="capitalize">{fullDate}</span></span>
          <span className="flex items-center gap-2"><Clock size={18} className="text-[#6f6f68]" />{time} hrs</span>
          <span className="flex items-center gap-2"><Users size={18} className="text-[#6f6f68]" />{sortedParticipants.length} Registrados</span>
        </div>

        <p className="text-[#9c9c94] mb-6 whitespace-pre-wrap text-sm">{event.description}</p>

        <div className="bg-black/30 p-4 rounded-xl border border-brand-terminal-border text-sm text-[#9c9c94]">
          <span className="font-bold text-brand-beige block mb-1">Ubicación / Enlace:</span>
          {event.location_url}
        </div>
      </div>

      {/* --- SECCIÓN DE ASISTENTES --- */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-beige flex items-center gap-2">
              <FileText size={20} className="text-[#6f6f68]" />
              Lista de Asistencia
            </h2>
          </div>
        </div>

        <div className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl overflow-hidden">
          {sortedParticipants.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={32} className="mx-auto text-[#6f6f68] mb-3" />
              <p className="text-[#9c9c94] font-medium">Aún no hay alumnos registrados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/20 border-b border-brand-terminal-border text-[#9c9c94] uppercase tracking-wider font-black text-[10px]">
                  <tr>
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Estudiante</th>
                    <th className="px-6 py-4 text-right">Fecha de registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-terminal-border">
                  {sortedParticipants.map((participant: any, index: number) => (
                    <tr key={participant.id} className="hover:bg-black/20 transition-colors">
                      <td className="px-6 py-4 text-[#6f6f68] font-bold">{index + 1}</td>
                      <td className="px-6 py-4 font-bold text-brand-beige flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-[#9c9c94] uppercase text-xs border border-brand-terminal-border">
                          {participant.user?.name?.charAt(0) || <User size={14} />}
                        </div>
                        {participant.user?.name || 'Estudiante Sin Nombre'}
                      </td>
                      <td className="px-6 py-4 text-right text-[#9c9c94] tabular-nums">
                        {new Date(participant.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}