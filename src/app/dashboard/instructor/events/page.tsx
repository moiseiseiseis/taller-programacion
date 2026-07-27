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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-terminal-border pb-8">
        <div>
          <h1 className="font-mono text-3xl font-bold text-brand-beige tracking-tight">Gestión de Eventos</h1>
          <p className="text-[#9c9c94] mt-2 text-lg">
            Administra tus seminarios, clases en vivo y revisa la asistencia.
          </p>
        </div>
        <Link
          href="/dashboard/instructor/events/nuevo"
          className="inline-flex items-center justify-center gap-2 bg-brand-mint text-[#0f1a15] px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Agendar Evento</span>
        </Link>
      </div>

      {/* Lista de eventos */}
      <div className="grid gap-4">
        {!events || events.length === 0 ? (
          <div className="p-16 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
            <Calendar className="mx-auto text-[#6f6f68] mb-4" size={40} />
            <h3 className="text-brand-beige font-bold text-xl mb-1">No has creado eventos</h3>
            <p className="text-[#9c9c94]">Haz clic en "Agendar Evento" para empezar.</p>
          </div>
        ) : (
          events.map((event) => {
            const isOnline = event.event_type === 'online';
            const participantCount = event.participants?.[0]?.count || 0;

            return (
              <div key={event.id} className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-brand-mint/40 transition-colors">

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-brand-steel bg-brand-steel/10 px-2 py-1 rounded uppercase tracking-wider">
                        <Video size={12} /> Virtual
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-brand-mint bg-brand-mint/10 px-2 py-1 rounded uppercase tracking-wider">
                        <MapPin size={12} /> Presencial
                      </span>
                    )}
                    <span className="text-sm font-bold text-[#6f6f68]">
                      {new Date(event.event_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-beige mb-1">{event.title}</h3>
                  <p className="text-sm text-[#9c9c94] line-clamp-1">{event.location_url}</p>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-brand-terminal-border">
                  <div className="text-center px-4 md:border-r md:border-brand-terminal-border">
                    <span className="block text-2xl font-black text-brand-beige">{participantCount}</span>
                    <span className="text-[10px] font-bold text-[#6f6f68] uppercase tracking-wider flex items-center gap-1">
                      <Users size={12} /> Registros
                    </span>
                  </div>


                  <Link
                    href={`/dashboard/instructor/events/${event.id}`}
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-black/30 hover:bg-black/40 text-brand-beige px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
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