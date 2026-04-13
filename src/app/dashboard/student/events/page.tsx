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
      <div className="border-b border-zinc-200 pb-6">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Próximos Eventos</h1>
        <p className="text-zinc-500 mt-2 text-lg">
          Descubre seminarios, tutorías y reuniones de la comunidad.
        </p>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-6">
        {events.length === 0 ? (
          <div className="p-16 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Calendar className="text-zinc-400" size={28} />
            </div>
            <h3 className="text-zinc-900 font-bold text-xl mb-1">Agenda libre</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">
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
                className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-zinc-300 transition-colors shadow-sm"
              >
                
                {/* Cuadro de Fecha (Izquierda) */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-200 rounded-xl w-20 h-24 shadow-inner">
                  <span className="text-xs font-bold text-zinc-400 tracking-widest mb-1">{month}</span>
                  <span className="text-3xl font-black text-zinc-900 leading-none">{day}</span>
                </div>

                {/* Contenido Central */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Etiqueta Online/Presencial */}
                      {event.event_type === 'online' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                          <Video size={12} /> Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider">
                          <MapPin size={12} /> Presencial
                        </span>
                      )}
                      
                      <span className="text-zinc-300">•</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-zinc-500">
                        <Clock size={14} /> {time}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 mb-2 leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-zinc-600 text-sm whitespace-pre-wrap mb-4">
                      {event.description}
                    </p>
                  </div>

                  {/* Metadatos Inferiores */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] text-zinc-700 font-bold">
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
                <div className="flex-shrink-0 flex flex-col justify-center border-t border-zinc-100 pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6 md:w-48">
                  {/* Detalles del Link/Lugar (Solo se muestran a los que asisten) */}
                  {isRegistered ? (
                    <div className="mb-4 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                      <span className="flex items-center gap-1 text-xs font-bold text-zinc-900 mb-1">
                        <Info size={14} className="text-zinc-400" />
                        {event.event_type === 'online' ? 'Enlace de acceso:' : 'Lugar del evento:'}
                      </span>
                      {event.event_type === 'online' ? (
                        <a href={event.location_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">
                          Unirse a la llamada →
                        </a>
                      ) : (
                        <span className="text-sm font-medium text-zinc-700">
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
                          ? 'bg-white border-2 border-zinc-200 text-zinc-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50' 
                          : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm'
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