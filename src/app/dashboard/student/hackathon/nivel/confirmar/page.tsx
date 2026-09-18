import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { chooseLevel } from '../../actions';

export default async function ConfirmarNivelPage({
  searchParams,
}: {
  searchParams: Promise<{ event_id?: string }>;
}) {
  const { event_id } = await searchParams;
  if (!event_id) notFound();

  const supabase = await createClient();
  const { user } = await getAuthUser();

  const [{ data: levels }, { data: response }] = await Promise.all([
    supabase.from('hackathon_levels').select('*').eq('event_id', event_id).order('order_index', { ascending: true }),
    supabase
      .from('hackathon_level_quiz_responses')
      .select('suggested_level_id')
      .match({ event_id, user_id: user!.id })
      .maybeSingle(),
  ]);

  const suggestedId = response?.suggested_level_id ?? null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Tu nivel sugerido</h1>
        <p className="text-[#9c9c94] mt-2">
          Esto es una sugerencia, no un veredicto — puedes elegir otro nivel si no estás de acuerdo.
        </p>
      </div>

      <form action={chooseLevel} className="space-y-3">
        <input type="hidden" name="event_id" value={event_id} />
        {(levels ?? []).map((level) => (
          <label
            key={level.id}
            className="flex items-start gap-3 px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20 cursor-pointer hover:border-brand-mint/40 transition-colors"
          >
            <input
              type="radio"
              name="level_id"
              value={level.id}
              defaultChecked={level.id === suggestedId}
              required
              className="accent-brand-mint mt-1"
            />
            <span>
              <span className="font-semibold text-brand-beige">{level.name}</span>
              {level.id === suggestedId && (
                <span className="ml-2 text-xs font-bold text-brand-mint uppercase tracking-wider">Sugerido</span>
              )}
              {level.description && <p className="text-sm text-[#9c9c94] mt-1">{level.description}</p>}
            </span>
          </label>
        ))}
        <button
          type="submit"
          className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
        >
          Confirmar nivel
        </button>
      </form>
    </div>
  );
}
