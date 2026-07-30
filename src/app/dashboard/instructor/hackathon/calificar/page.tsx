import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import Link from 'next/link';
import { computeSubmissionTotal } from '@/lib/hackathon/rubricScoring';

export default async function CalificarPage() {
  const judgeId = await requireRole('instructor');
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

  const { data: registration } = await supabase
    .from('hackathon_registrations')
    .select('level_id, hackathon_levels(name)')
    .match({ event_id: event.id, user_id: judgeId, role: 'judge' })
    .maybeSingle();

  if (!registration?.level_id) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl space-y-4">
        <p className="text-[#9c9c94]">Todavía no te registraste como jurado de ningún nivel.</p>
        <Link
          href="/dashboard/instructor/hackathon/juez"
          className="inline-block py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
        >
          Registrarme como jurado →
        </Link>
      </div>
    );
  }

  const levelName = (registration.hackathon_levels as unknown as { name: string } | null)?.name;

  const [{ data: teams }, { data: criteria }] = await Promise.all([
    supabase
      .from('hackathon_teams')
      .select('id, name, hackathon_submissions(id, link, submitted_at)')
      .eq('event_id', event.id)
      .eq('level_id', registration.level_id)
      .order('name', { ascending: true }),
    supabase.from('hackathon_rubric_criteria').select('id, weight').eq('level_id', registration.level_id),
  ]);

  type SubmissionRow = { id: string; link: string; submitted_at: string | null } | null;
  type TeamRow = { id: string; name: string; hackathon_submissions: SubmissionRow[] | SubmissionRow };

  const rubricCriteria = (criteria ?? []).map((c) => ({ id: c.id, weight: c.weight }));

  let scoresByTeam: Record<string, { criterion_id: string; judge_id: string; score: number }[]> = {};
  if (rubricCriteria.length > 0 && teams && teams.length > 0) {
    const submissionIds = (teams as unknown as TeamRow[])
      .map((t) => (Array.isArray(t.hackathon_submissions) ? t.hackathon_submissions[0] : t.hackathon_submissions))
      .filter((s): s is { id: string; link: string; submitted_at: string | null } => !!s)
      .map((s) => s.id);

    if (submissionIds.length > 0) {
      const { data: scores } = await supabase
        .from('hackathon_scores')
        .select('submission_id, criterion_id, judge_id, score')
        .in('submission_id', submissionIds);

      scoresByTeam = {};
      for (const row of scores ?? []) {
        const team = (teams as unknown as TeamRow[]).find((t) => {
          const sub = Array.isArray(t.hackathon_submissions) ? t.hackathon_submissions[0] : t.hackathon_submissions;
          return sub?.id === row.submission_id;
        });
        if (!team) continue;
        scoresByTeam[team.id] = scoresByTeam[team.id] ?? [];
        scoresByTeam[team.id].push({ criterion_id: row.criterion_id, judge_id: row.judge_id, score: row.score });
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Calificar — {event.name}</h1>
        <p className="text-[#9c9c94] mt-2">
          Nivel: <span className="text-brand-mint font-semibold">{levelName}</span>
        </p>
      </div>

      <div className="space-y-4">
        {(!teams || teams.length === 0) && (
          <div className="p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
            <p className="text-[#9c9c94]">Todavía no hay equipos en este nivel.</p>
          </div>
        )}

        {(teams as unknown as TeamRow[] | null)?.map((team) => {
          const submission = Array.isArray(team.hackathon_submissions)
            ? team.hackathon_submissions[0]
            : team.hackathon_submissions;
          const teamScores = scoresByTeam[team.id] ?? [];
          const { total, perCriterion } = computeSubmissionTotal(rubricCriteria, teamScores);
          const myScored = new Set(teamScores.filter((s) => s.judge_id === judgeId).map((s) => s.criterion_id)).size;

          return (
            <div key={team.id} className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-brand-beige">{team.name}</h2>
                  {submission ? (
                    <p className="text-sm text-[#9c9c94] mt-1">
                      Entregado{submission.submitted_at ? ` — ${new Date(submission.submitted_at).toLocaleDateString('es-MX')}` : ''}
                      {rubricCriteria.length > 0 && (
                        <>
                          {' · '}
                          {myScored}/{rubricCriteria.length} criterios calificados por ti · total actual: {total.toFixed(1)}/100
                        </>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-[#6f6f68] mt-1">Sin entrega todavía</p>
                  )}
                </div>
                {submission && (
                  <Link
                    href={`/dashboard/instructor/hackathon/calificar/${team.id}`}
                    className="py-2 px-5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
                  >
                    Calificar
                  </Link>
                )}
              </div>
              {submission && Object.keys(perCriterion).length === 0 && rubricCriteria.length === 0 && (
                <p className="text-xs text-[#6f6f68] mt-3">Este nivel todavía no tiene criterios de rúbrica cargados.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
