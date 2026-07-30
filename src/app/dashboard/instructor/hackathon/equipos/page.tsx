import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import Link from 'next/link';

export default async function EquiposPage({
  searchParams,
}: {
  searchParams: Promise<{ level_id?: string }>;
}) {
  await requireRole('instructor');
  const { level_id } = await searchParams;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('hackathon_events')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
        <p className="text-[#9c9c94]">Todavía no hay un evento configurado.</p>
      </div>
    );
  }

  const { data: levels } = await supabase
    .from('hackathon_levels')
    .select('id, name')
    .eq('event_id', event.id)
    .order('order_index', { ascending: true });

  let teamsQuery = supabase
    .from('hackathon_teams')
    .select('id, name, level_id, hackathon_levels(name), hackathon_team_members(id, role, users(name, email))')
    .eq('event_id', event.id);

  if (level_id) teamsQuery = teamsQuery.eq('level_id', level_id);

  const { data: teams } = await teamsQuery.order('name', { ascending: true });

  type MemberRow = { id: string; role: string; users: { name: string | null; email: string } | null };
  type TeamRow = {
    id: string;
    name: string;
    level_id: string;
    hackathon_levels: { name: string } | null;
    hackathon_team_members: MemberRow[];
  };
  const rows = (teams ?? []) as unknown as TeamRow[];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Equipos — {event.name}</h1>
        <p className="text-[#9c9c94] mt-2">Entregas — próximamente (todavía no hay dashboard de calificación).</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/instructor/hackathon/equipos"
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
            !level_id ? 'bg-brand-mint text-[#0f1a15]' : 'bg-black/30 text-[#9c9c94] border border-brand-terminal-border'
          }`}
        >
          Todos
        </Link>
        {(levels ?? []).map((level) => (
          <Link
            key={level.id}
            href={`/dashboard/instructor/hackathon/equipos?level_id=${level.id}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              level_id === level.id ? 'bg-brand-mint text-[#0f1a15]' : 'bg-black/30 text-[#9c9c94] border border-brand-terminal-border'
            }`}
          >
            {level.name}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
            <p className="text-[#9c9c94]">Todavía no hay equipos {level_id ? 'en este nivel' : 'registrados'}.</p>
          </div>
        ) : (
          rows.map((team) => (
            <div key={team.id} className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-brand-beige">{team.name}</h2>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6f6f68]">{team.hackathon_levels?.name}</span>
              </div>
              <ul className="space-y-1">
                {team.hackathon_team_members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between text-sm text-[#9c9c94]">
                    <span>{m.users?.name || m.users?.email}</span>
                    <span className="text-xs uppercase tracking-wider text-[#6f6f68]">{m.role === 'leader' ? 'Líder' : 'Miembro'}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
