import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { computeSubmissionTotal } from '@/lib/hackathon/rubricScoring';
import { saveScores } from '../../actions';

const ANCHOR_BANDS = ['1-2', '3-4', '5-6', '7-8', '9-10'] as const;

export default async function CalificarEquipoPage({ params }: { params: Promise<{ teamId: string }> }) {
  const judgeId = await requireRole('instructor');
  const { teamId } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase.from('hackathon_teams').select('id, name, level_id').eq('id', teamId).single();
  if (!team) notFound();

  const { data: submission } = await supabase
    .from('hackathon_submissions')
    .select('id, link, submitted_at')
    .eq('team_id', teamId)
    .maybeSingle();

  if (!submission) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
        <p className="text-[#9c9c94]">Este equipo todavía no entregó nada para calificar.</p>
      </div>
    );
  }

  const { data: criteria } = await supabase
    .from('hackathon_rubric_criteria')
    .select('*')
    .eq('level_id', team.level_id)
    .order('order_index', { ascending: true });

  const { data: scores } = await supabase
    .from('hackathon_scores')
    .select('criterion_id, judge_id, score')
    .eq('submission_id', submission.id);

  const myScores = new Map((scores ?? []).filter((s) => s.judge_id === judgeId).map((s) => [s.criterion_id, s.score]));

  const { total, perCriterion } = computeSubmissionTotal(
    (criteria ?? []).map((c) => ({ id: c.id, weight: c.weight })),
    scores ?? []
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/instructor/hackathon/calificar" className="text-sm font-semibold text-[#9c9c94] hover:text-brand-mint mb-4 inline-block">
          ← Volver a la lista
        </Link>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">{team.name}</h1>
        <a href={submission.link} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-mint hover:underline break-all">
          {submission.link}
        </a>
      </div>

      <div className="p-4 rounded-xl border border-brand-terminal-border bg-black/20 text-sm text-brand-beige">
        Total agregado entre todos los jueces: <strong className="text-brand-mint">{total.toFixed(1)}/100</strong>
      </div>

      {(criteria ?? []).length === 0 ? (
        <div className="p-8 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-2xl">
          <p className="text-[#9c9c94]">Este nivel todavía no tiene criterios de rúbrica cargados.</p>
        </div>
      ) : (
        <form action={saveScores} className="space-y-4">
          <input type="hidden" name="team_id" value={teamId} />

          {(criteria ?? []).map((criterion) => {
            const anchors = (criterion.anchor_descriptors ?? {}) as Record<string, string>;
            const info = perCriterion[criterion.id];
            return (
              <div key={criterion.id} className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-bold text-brand-beige">
                    {criterion.name} <span className="text-xs font-normal text-[#6f6f68]">({criterion.weight}%)</span>
                  </h2>
                  {info && info.judgeCount > 0 && (
                    <span className="text-xs text-[#9c9c94] whitespace-nowrap">
                      promedio: {info.average.toFixed(1)}/10 ({info.judgeCount} jurado{info.judgeCount === 1 ? '' : 's'})
                    </span>
                  )}
                </div>

                {Object.keys(anchors).length > 0 && (
                  <ul className="text-xs text-[#9c9c94] space-y-1">
                    {ANCHOR_BANDS.filter((band) => anchors[band]).map((band) => (
                      <li key={band}>
                        <span className="font-bold text-[#6f6f68]">{band}:</span> {anchors[band]}
                      </li>
                    ))}
                  </ul>
                )}

                <div>
                  <label className="block text-sm font-semibold text-brand-beige mb-1">Tu puntaje (1-10)</label>
                  <input
                    type="number"
                    name={`score_${criterion.id}`}
                    min={1}
                    max={10}
                    defaultValue={myScores.get(criterion.id) ?? ''}
                    required
                    className="w-24 rounded-lg border border-brand-terminal-border bg-black/30 px-3 py-2 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
                  />
                </div>
              </div>
            );
          })}

          <div className="flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
            >
              Guardar calificación
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
