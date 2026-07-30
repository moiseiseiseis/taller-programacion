import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import HackathonEventForm from './HackathonEventForm';
import HackathonLevelsEditor from './HackathonLevelsEditor';
import HackathonQuizEditor from './HackathonQuizEditor';
import HackathonRubricEditor from './HackathonRubricEditor';

export default async function HackathonConfiguracionPage() {
  await requireRole('instructor');
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('hackathon_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const [{ data: levels }, { data: questions }, { data: criteria }] = event
    ? await Promise.all([
        supabase.from('hackathon_levels').select('*').eq('event_id', event.id).order('order_index', { ascending: true }),
        supabase
          .from('hackathon_level_quiz_questions')
          .select('*')
          .eq('event_id', event.id)
          .order('order_index', { ascending: true }),
        supabase
          .from('hackathon_rubric_criteria')
          .select('*, hackathon_levels!inner(event_id)')
          .eq('hackathon_levels.event_id', event.id),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Configuración del Hackathon</h1>
        <p className="text-[#9c9c94] mt-2">Datos del evento, niveles y preguntas del test de nivel.</p>
      </div>

      <HackathonEventForm event={event ?? null} />

      {event ? (
        <>
          <HackathonLevelsEditor eventId={event.id} levels={levels ?? []} />
          <HackathonQuizEditor
            eventId={event.id}
            questions={questions ?? []}
            levels={(levels ?? []).map((l) => ({ id: l.id, name: l.name }))}
          />
          <HackathonRubricEditor
            levels={(levels ?? []).map((l) => ({ id: l.id, name: l.name }))}
            criteria={criteria ?? []}
          />
        </>
      ) : (
        <div className="p-8 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-2xl">
          <p className="text-[#9c9c94]">Crea el evento primero para poder cargar niveles y preguntas.</p>
        </div>
      )}
    </div>
  );
}
