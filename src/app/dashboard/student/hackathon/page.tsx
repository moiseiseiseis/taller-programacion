import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import TeamPicker from './TeamPicker';
import { leaveTeam, saveSubmission, requestLevelChange } from './actions';
import { computeSubmissionTotal } from '@/lib/hackathon/rubricScoring';

export default async function StudentHackathonPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No se filtra por status='open' aquí: un alumno que ya tiene registro/equipo
  // tiene que poder seguir viendo su hub (entrega, resultado) aunque el
  // evento haya pasado a in_progress/closed. El filtro por 'open' sigue
  // aplicando donde corresponde: para arrancar un registro nuevo (nivel/).
  const { data: event } = await supabase
    .from('hackathon_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="p-16 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
          <h1 className="font-mono text-2xl font-bold text-brand-beige mb-2">No hay un hackathon abierto</h1>
          <p className="text-[#9c9c94]">Todavía no hay inscripciones abiertas. Vuelve a revisar más adelante.</p>
        </div>
      </div>
    );
  }

  const { data: registration } = await supabase
    .from('hackathon_registrations')
    .select('*, hackathon_levels(id, name, description, max_team_size)')
    .match({ event_id: event.id, user_id: user!.id })
    .maybeSingle();

  if (!registration) {
    if (event.status !== 'open') {
      return (
        <div className="max-w-3xl mx-auto">
          <div className="p-16 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
            <h1 className="font-mono text-2xl font-bold text-brand-beige mb-2">No hay un hackathon abierto</h1>
            <p className="text-[#9c9c94]">Todavía no hay inscripciones abiertas. Vuelve a revisar más adelante.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-mono text-3xl font-bold text-brand-beige">{event.name}</h1>
          <p className="text-[#9c9c94] mt-2">Todavía no elegiste tu nivel para este hackathon.</p>
        </div>
        <Link
          href="/dashboard/student/hackathon/nivel"
          className="inline-block py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
        >
          Elegir mi nivel →
        </Link>
      </div>
    );
  }

  const level = registration.hackathon_levels as { id: string; name: string; description: string | null; max_team_size: number } | null;

  if (!registration.team_id) {
    const { data: teams } = await supabase
      .from('hackathon_teams')
      .select('id, name, hackathon_team_members(id)')
      .eq('event_id', event.id)
      .eq('level_id', registration.level_id);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-mono text-3xl font-bold text-brand-beige">{event.name}</h1>
          <p className="text-[#9c9c94] mt-2">
            Nivel: <span className="text-brand-mint font-semibold">{level?.name}</span>. Ahora arma o únete a un equipo.
          </p>
        </div>
        <TeamPicker
          eventId={event.id}
          levelId={registration.level_id}
          teams={teams ?? []}
          maxTeamSize={level?.max_team_size ?? 6}
        />
      </div>
    );
  }

  const { data: team } = await supabase
    .from('hackathon_teams')
    .select('id, name, hackathon_team_members(id, role, users(name, email))')
    .eq('id', registration.team_id)
    .single();

  type MemberRow = { id: string; role: string; users: { name: string | null; email: string } | null };
  const members = (team?.hackathon_team_members ?? []) as unknown as MemberRow[];

  const [{ data: submission }, { data: levels }, { data: lastRequest }] = await Promise.all([
    supabase.from('hackathon_submissions').select('link, submitted_at').eq('team_id', registration.team_id).maybeSingle(),
    supabase.from('hackathon_levels').select('id, name').eq('event_id', event.id).order('order_index', { ascending: true }),
    supabase
      .from('hackathon_level_change_requests')
      .select('id, status, requested_level_id, hackathon_levels!requested_level_id(name)')
      .match({ event_id: event.id, user_id: user!.id })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const otherLevels = (levels ?? []).filter((l) => l.id !== registration.level_id);
  const requestedLevelName = (lastRequest?.hackathon_levels as unknown as { name: string } | null)?.name;

  let resultCard: { total: number; rows: { name: string; weight: number; average: number }[] } | null = null;
  if (event.status === 'closed') {
    const { data: submissionRow } = await supabase
      .from('hackathon_submissions')
      .select('id')
      .eq('team_id', registration.team_id)
      .maybeSingle();

    if (submissionRow) {
      const [{ data: criteria }, { data: scores }] = await Promise.all([
        supabase
          .from('hackathon_rubric_criteria')
          .select('id, name, weight')
          .eq('level_id', registration.level_id)
          .order('order_index', { ascending: true }),
        supabase.from('hackathon_scores').select('criterion_id, judge_id, score').eq('submission_id', submissionRow.id),
      ]);

      if (criteria && criteria.length > 0) {
        const { total, perCriterion } = computeSubmissionTotal(
          criteria.map((c) => ({ id: c.id, weight: c.weight })),
          scores ?? []
        );
        resultCard = {
          total,
          rows: criteria.map((c) => ({ name: c.name, weight: c.weight, average: perCriterion[c.id]?.average ?? 0 })),
        };
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">{event.name}</h1>
        <p className="text-[#9c9c94] mt-2">
          Nivel: <span className="text-brand-mint font-semibold">{level?.name}</span>
        </p>
      </div>

      <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
        <h2 className="text-lg font-bold text-brand-beige mb-4">Mi equipo: {team?.name}</h2>
        <ul className="space-y-2 mb-6">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between text-sm">
              <span className="text-brand-beige">{m.users?.name || m.users?.email}</span>
              <span className="text-xs uppercase tracking-wider text-[#6f6f68]">
                {m.role === 'leader' ? 'Líder' : 'Miembro'}
              </span>
            </li>
          ))}
        </ul>
        <form action={leaveTeam}>
          <input type="hidden" name="event_id" value={event.id} />
          <input type="hidden" name="team_id" value={registration.team_id} />
          <button type="submit" className="text-sm font-bold text-brand-salmon hover:brightness-110">
            Salir del equipo
          </button>
        </form>
      </div>

      <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
        <h2 className="text-lg font-bold text-brand-beige mb-1">Entrega</h2>
        <p className="text-sm text-[#9c9c94] mb-4">
          {submission?.link
            ? `Entregado — ${submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('es-MX') : ''}`
            : 'No entregado'}
        </p>
        <form action={saveSubmission} className="flex flex-col sm:flex-row gap-3">
          <input type="hidden" name="team_id" value={registration.team_id} />
          <input
            type="url"
            name="link"
            required
            defaultValue={submission?.link || ''}
            placeholder="https://github.com/tu-equipo/proyecto"
            className="flex-1 rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
          />
          <button
            type="submit"
            className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
          >
            {submission?.link ? 'Actualizar entrega' : 'Guardar entrega'}
          </button>
        </form>
      </div>

      {resultCard && (
        <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
          <h2 className="text-lg font-bold text-brand-beige mb-4">Tu resultado</h2>
          <ul className="space-y-2 mb-4">
            {resultCard.rows.map((row) => (
              <li key={row.name} className="flex items-center justify-between text-sm">
                <span className="text-brand-beige">
                  {row.name} <span className="text-xs text-[#6f6f68]">({row.weight}%)</span>
                </span>
                <span className="text-[#9c9c94]">{row.average.toFixed(1)}/10</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-brand-terminal-border pt-4">
            <span className="font-bold text-brand-beige">Total</span>
            <span className="text-brand-mint font-bold text-lg">{resultCard.total.toFixed(1)}/100</span>
          </div>
        </div>
      )}

      <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
        <h2 className="text-lg font-bold text-brand-beige mb-3">Cambio de nivel</h2>
        {lastRequest?.status === 'pending' ? (
          <p className="text-sm text-[#9c9c94]">
            Tu solicitud a <span className="text-brand-mint font-semibold">{requestedLevelName}</span> está en revisión.
          </p>
        ) : (
          <>
            {lastRequest?.status === 'rejected' && (
              <p className="text-sm text-brand-salmon mb-3">
                Tu última solicitud (a {requestedLevelName}) fue rechazada. Puedes volver a pedirlo.
              </p>
            )}
            {otherLevels.length > 0 && (
              <form action={requestLevelChange} className="space-y-3">
                <input type="hidden" name="event_id" value={event.id} />
                <input type="hidden" name="current_level_id" value={registration.level_id} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    name="requested_level_id"
                    required
                    className="rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
                  >
                    <option value="" disabled selected>
                      Nivel al que quieres pasar
                    </option>
                    {otherLevels.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="reason"
                    placeholder="Motivo (opcional)"
                    className="flex-1 rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-2.5 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border"
                >
                  Solicitar cambio de nivel
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
