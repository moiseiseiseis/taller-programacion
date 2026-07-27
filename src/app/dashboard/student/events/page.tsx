import { getUpcomingEvents, toggleEventRegistration } from '@/app/dashboard/events/actions'; 
import { createClient } from '@/lib/supabase/server';
import { Calendar, MapPin, Video, Users, Clock, Info } from 'lucide-react';

export default async function StudentEventsPage() {
  const events = await getUpcomingEvents();
  
  // Obtenemos al usuario actual para saber a qué eventos ya confirmó asistencia
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Encabezado */}
      <div className="border-b border-brand-terminal-border pb-6">
        <h1 className="font-mono text-3xl font-bold text-brand-beige tracking-tight">Próximos Eventos</h1>
        <p className="text-[#9c9c94] mt-2 text-lg">
          Descubre seminarios, tutorías y reuniones de la comunidad.
        </p>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-6">
        {events.length === 0 ? (
          <div className="p-16 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
            <div className="bg-black/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-[#6f6f68]" size={28} />
            </div>
            <h3 className="text-brand-beige font-bold text-xl mb-1">Agenda libre</h3>
            <p className="text-[#9c9c94] max-w-sm mx-auto">
              No hay eventos programados en este momento. Vuelve a revisar más tarde.
            </p>
          </div>
        ) : (
          events.map((event) => {
            // 1. Damos formato a la fecha
            const eventDate = new Date(event.event_date);
            const month = eventDate.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase();
            const day = eventDate.toLocaleDateString('es-MX', { day: '2-digit' });
            const time = eventDate.toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' });

            // 2. Verificamos si el usuario actual ya le dio a "Asistiré"
            const isRegistered = event.participants?.some((p: any) => p.user_id === user?.id) || false;
            const participantCount = event.participants?.length || 0;

            return (
              <div
                key={event.id}
                className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-brand-mint/40 transition-colors"
              >

                {/* Cuadro de Fecha (Izquierda) */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center bg-black/30 border border-brand-terminal-border rounded-xl w-20 h-24">
                  <span className="text-xs font-bold text-[#6f6f68] tracking-widest mb-1">{month}</span>
                  <span className="text-3xl font-black text-brand-beige leading-none">{day}</span>
                </div>

                {/* Contenido Central */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Etiqueta Online/Presencial */}
                      {event.event_type === 'online' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-brand-steel bg-brand-steel/10 px-2 py-1 rounded uppercase tracking-wider">
                          <Video size={12} /> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-brand-mint bg-brand-mint/10 px-2 py-1 rounded uppercase tracking-wider">
                          <MapPin size={12} /> Presencial
                        </span>
                      )}

                      <span className="text-[#4a4a44]">•</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-[#9c9c94]">
                        <Clock size={14} /> {time}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-brand-beige mb-2 leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-[#9c9c94] text-sm whitespace-pre-wrap mb-4">
                      {event.description}
                    </p>
                  </div>

                  {/* Metadatos Inferiores */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#9c9c94]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-black/30 border border-brand-terminal-border flex items-center justify-center text-[10px] text-[#9c9c94] font-bold">
                        {event.instructor?.name?.charAt(0) || 'P'}
                      </span>
                      Por {event.instructor?.name || 'Profesor'}
                    </span>

                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {participantCount} {participantCount === 1 ? 'asistente' : 'asistentes'}
                    </span>
                  </div>
                </div>

                {/* Área de Acción (Derecha) */}
                <div className="flex-shrink-0 flex flex-col justify-center border-t border-brand-terminal-border pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6 md:w-48">
                  {/* Detalles del Link/Lugar (Solo se muestran a los que asisten) */}
                  {isRegistered ? (
                    <div className="mb-4 bg-black/30 p-3 rounded-lg border border-brand-terminal-border">
                      <span className="flex items-center gap-1 text-xs font-bold text-brand-beige mb-1">
                        <Info size={14} className="text-[#6f6f68]" />
                        {event.event_type === 'online' ? 'Enlace de acceso:' : 'Lugar del evento:'}
                      </span>
                      {event.event_type === 'online' ? (
                        <a href={event.location_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-mint hover:underline break-all">
                          Unirse a la llamada →
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-[#9c9c94]">
                          {event.location_url}
                        </span>
                      )}
                    </div>
                  ) : null}

                  {/* Botón de RSVP con Server Actions */}
                  <form action={toggleEventRegistration.bind(null, event.id, isRegistered)}>
                    <button
                      type="submit"
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        isRegistered
                          ? 'bg-black/30 border-2 border-brand-terminal-border text-[#9c9c94] hover:border-brand-salmon/40 hover:text-brand-salmon hover:bg-brand-salmon/10'
                          : 'bg-brand-mint text-[#0f1a15] hover:brightness-110'
                      }`}
                    >
                      {isRegistered ? 'Cancelar asistencia' : 'Asistiré'}
                    </button>
                  </form>

                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}