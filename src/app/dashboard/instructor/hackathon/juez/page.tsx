import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { registerAsJudge } from '../actions';

export default async function RegistrarJuezPage() {
  const userId = await requireRole('instructor');
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('hackathon_events')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
        <p className="text-[#9c9c94]">Todavía no hay un evento configurado.</p>
      </div>
    );
  }

  const [{ data: levels }, { data: registration }] = await Promise.all([
    supabase.from('hackathon_levels').select('*').eq('event_id', event.id).order('order_index', { ascending: true }),
    supabase.from('hackathon_registrations').select('*').match({ event_id: event.id, user_id: userId }).maybeSingle(),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Registrarme en {event.name}</h1>
        <p className="text-[#9c9c94] mt-2">Elegí el nivel que vas a evaluar o mentorear.</p>
      </div>

      {registration && (
        <div className="p-4 rounded-xl border border-brand-mint/30 bg-brand-mint/10 text-sm text-brand-beige">
          Ya estás registrado con rol <strong>{registration.role}</strong>
          {registration.level_id && ' para un nivel'}. Guardar de nuevo actualiza tu registro.
        </div>
      )}

      <form action={registerAsJudge} className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border space-y-4">
        <input type="hidden" name="event_id" value={event.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Rol</label>
            <select
              name="role"
              defaultValue={registration?.role || 'judge'}
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            >
              <option value="judge">Jurado</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Nivel</label>
            <select
              name="level_id"
              defaultValue={registration?.level_id || ''}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            >
              <option value="" disabled>
                Elegí un nivel
              </option>
              {(levels ?? []).map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
          >
            Guardar registro
          </button>
        </div>
      </form>
    </div>
  );
}
