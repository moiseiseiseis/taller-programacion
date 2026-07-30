import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import Link from 'next/link';
import { rankTeams } from '@/lib/hackathon/rubricScoring';

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ level_id?: string }>;
}) {
  await requireRole('instructor');
  const { level_id: requestedLevelId } = await searchParams;
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

  const levelId = requestedLevelId || levels?.[0]?.id;

  if (!levelId) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
        <p className="text-[#9c9c94]">Todavía no hay niveles configurados.</p>
      </div>
    );
  }

  const [{ data: criteria }, { data: teams }] = await Promise.all([
    supabase.from('hackathon_rubric_criteria').select('id, weight').eq('level_id', levelId),
    supabase
      .from('hackathon_teams')
      .select('id, name, hackathon_submissions(id)')
      .eq('event_id', event.id)
      .eq('level_id', levelId),
  ]);

  type SubmissionRow = { id: string } | null;
  type TeamRow = { id: string; name: string; hackathon_submissions: SubmissionRow[] | SubmissionRow };
  const teamRows = (teams ?? []) as unknown as TeamRow[];

  const teamsWithSubmission = teamRows
    .map((t) => ({
      id: t.id,
      name: t.name,
      submission: Array.isArray(t.hackathon_submissions) ? t.hackathon_submissions[0] : t.hackathon_submissions,
    }))
    .filter((t) => t.submission);

  const teamsWithoutSubmission = teamRows.filter((t) => {
    const submission = Array.isArray(t.hackathon_submissions) ? t.hackathon_submissions[0] : t.hackathon_submissions;
    return !submission;
  });

  let ranked: ReturnType<typeof rankTeams> = [];
  if (teamsWithSubmission.length > 0) {
    const submissionIds = teamsWithSubmission.map((t) => t.submission!.id);
    const { data: scores } = await supabase
      .from('hackathon_scores')
      .select('submission_id, criterion_id, judge_id, score')
      .in('submission_id', submissionIds);

    const scoresByTeam = teamsWithSubmission.map((t) => ({
      teamId: t.id,
      scores: (scores ?? []).filter((s) => s.submission_id === t.submission!.id),
    }));

    ranked = rankTeams((criteria ?? []).map((c) => ({ id: c.id, weight: c.weight })), scoresByTeam);
  }

  const teamById = new Map(teamRows.map((t) => [t.id, t.name]));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Resultados — {event.name}</h1>
        <p className="text-[#9c9c94] mt-2">Ranking por nivel, con desempate en cascada según la sección 6 del documento.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(levels ?? []).map((level) => (
          <Link
            key={level.id}
            href={`/dashboard/instructor/hackathon/resultados?level_id=${level.id}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              levelId === level.id ? 'bg-brand-mint text-[#0f1a15]' : 'bg-black/30 text-[#9c9c94] border border-brand-terminal-border'
            }`}
          >
            {level.name}
          </Link>
        ))}
      </div>

      {(criteria ?? []).length === 0 ? (
        <div className="p-8 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-2xl">
          <p className="text-[#9c9c94]">Este nivel todavía no tiene criterios de rúbrica cargados.</p>
        </div>
      ) : ranked.length === 0 ? (
        <div className="p-8 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-2xl">
          <p className="text-[#9c9c94]">Todavía no hay entregas calificables en este nivel.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranked.map((team, i) => (
            <div
              key={team.teamId}
              className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-brand-terminal-border bg-brand-terminal-panel"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-[#6f6f68] w-8 text-center">{i + 1}</span>
                <span className="font-bold text-brand-beige">{teamById.get(team.teamId)}</span>
                {team.isTied && (
                  <span className="text-[11px] font-black uppercase tracking-widest text-brand-salmon bg-brand-salmon/10 px-2 py-1 rounded">
                    Empate — decisión del jurado
                  </span>
                )}
              </div>
              <span className="text-brand-mint font-bold">{team.total.toFixed(1)}/100</span>
            </div>
          ))}
        </div>
      )}

      {teamsWithoutSubmission.length > 0 && (
        <p className="text-xs text-[#6f6f68]">
          Sin entrega todavía: {teamsWithoutSubmission.map((t) => t.name).join(', ')}
        </p>
      )}
    </div>
  );
}
