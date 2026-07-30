import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { chooseLevel } from '../actions';

export default async function ElegirNivelPage() {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from('hackathon_events')
    .select('id, name')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!event) notFound();

  const { data: levels } = await supabase
    .from('hackathon_levels')
    .select('*')
    .eq('event_id', event.id)
    .order('order_index', { ascending: true });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Elige tu nivel</h1>
        <p className="text-[#9c9c94] mt-2">
          Lee la descripción de cada nivel y elige el que mejor te acomode, o{' '}
          <Link href="/dashboard/student/hackathon/nivel/quiz" className="text-brand-mint font-bold hover:underline">
            haz el test de 15 preguntas
          </Link>{' '}
          para recibir una sugerencia.
        </p>
      </div>

      <div className="space-y-4">
        {(levels ?? []).map((level) => (
          <div key={level.id} className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
            <h2 className="text-lg font-bold text-brand-beige mb-2">{level.name}</h2>
            {level.description && (
              <p className="text-[#9c9c94] text-sm mb-4 whitespace-pre-wrap">{level.description}</p>
            )}
            <form action={chooseLevel}>
              <input type="hidden" name="event_id" value={event.id} />
              <input type="hidden" name="level_id" value={level.id} />
              <button
                type="submit"
                className="py-2 px-5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
              >
                Elegir este nivel
              </button>
            </form>
          </div>
        ))}
        {(levels ?? []).length === 0 && (
          <div className="p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
            <p className="text-[#9c9c94]">Todavía no hay niveles configurados para este hackathon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
