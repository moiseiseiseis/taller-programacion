import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Calendar, Plus, Users, MapPin, Video, ArrowRight } from 'lucide-react';

export default async function InstructorEventsDashboard() {
  const supabase = await createClient();
  
  // Traemos todos los eventos, ordenados por los más recientes
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      participants:event_participants(count)
    `)
    .order('event_date', { ascending: false });

  if (error) console.error("Error cargando eventos:", error);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header del Panel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Gestión de Eventos</h1>
          <p className="text-zinc-500 mt-2 text-lg">
            Administra tus seminarios, clases en vivo y revisa la asistencia.
          </p>
        </div>
        <Link 
          href="/dashboard/instructor/events/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} />
          <span>Agendar Evento</span>
        </Link>
      </div>

      {/* Lista de eventos */}
      <div className="grid gap-4">
        {!events || events.length === 0 ? (
          <div className="p-16 text-center bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl">
            <Calendar className="mx-auto text-zinc-300 mb-4" size={40} />
            <h3 className="text-zinc-900 font-bold text-xl mb-1">No has creado eventos</h3>
            <p className="text-zinc-500">Haz clic en "Agendar Evento" para empezar.</p>
          </div>
        ) : (
          events.map((event) => {
            const isOnline = event.event_type === 'online';
            const participantCount = event.participants?.[0]?.count || 0;
            
            return (
              <div key={event.id} className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                        <Video size={12} /> Virtual
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider">
                        <MapPin size={12} /> Presencial
                      </span>
                    )}
                    <span className="text-sm font-bold text-zinc-400">
                      {new Date(event.event_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-zinc-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-1">{event.location_url}</p>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-center px-4 md:border-r md:border-zinc-200">
                    <span className="block text-2xl font-black text-zinc-900">{participantCount}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Users size={12} /> Registros
                    </span>
                  </div>
                  
                  
                  <Link 
                    href={`/dashboard/instructor/events/${event.id}`}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  >
                    Ver detalles <ArrowRight size={16} />
                  </Link>
                </div>

              </div>
            )
          })
        )}
      </div>

    </div>
  );
}