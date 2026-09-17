import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { notFound } from 'next/navigation';
import {
  FIRST_LESSON_ITEMS,
  FIRST_LESSON_COMMENT_LABEL,
  WORKSHOP_COMPLETE_ITEMS,
  WORKSHOP_COMPLETE_COMMENT_LABEL,
  PATH_COMPLETE_ITEMS,
  PATH_COMPLETE_COMMENT_LABEL,
  type UxSurveyItem,
} from '@/lib/uxSurvey/items';
import { submitUxSurvey } from '../actions';

const MOMENTO_CONFIG = {
  first_lesson: {
    items: FIRST_LESSON_ITEMS,
    commentLabel: FIRST_LESSON_COMMENT_LABEL,
    heading: 'Tu primera lección',
  },
  workshop_complete: {
    items: WORKSHOP_COMPLETE_ITEMS,
    commentLabel: WORKSHOP_COMPLETE_COMMENT_LABEL,
    heading: 'Terminaste un taller',
  },
  path_complete: {
    items: PATH_COMPLETE_ITEMS,
    commentLabel: PATH_COMPLETE_COMMENT_LABEL,
    heading: 'Terminaste la ruta Fundamentales',
  },
} as const;

function LikertRow({ item }: { item: UxSurveyItem }) {
  return (
    <div className="py-4 border-b border-brand-terminal-border last:border-b-0">
      <p className="text-sm text-brand-beige mb-3">{item.text}</p>
      <div className="flex items-center justify-between gap-2 max-w-md">
        <span className="text-xs text-[#6f6f68] w-24 shrink-0">Totalmente en desacuerdo</span>
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="flex flex-col items-center gap-1 cursor-pointer">
              <input type="radio" name={`item_${item.id}`} value={value} required className="accent-brand-mint" />
              <span className="text-xs text-[#6f6f68]">{value}</span>
            </label>
          ))}
        </div>
        <span className="text-xs text-[#6f6f68] w-24 shrink-0 text-right">Totalmente de acuerdo</span>
      </div>
    </div>
  );
}

export default async function UxSurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ momento: string }>;
  searchParams: Promise<{ taller?: string }>;
}) {
  const userId = await requireRole('student');
  const { momento } = await params;
  const { taller: workshopId } = await searchParams;

  if (momento !== 'first_lesson' && momento !== 'workshop_complete' && momento !== 'path_complete') notFound();
  if (momento === 'workshop_complete' && !workshopId) notFound();

  const supabase = await createClient();

  let workshopTitle: string | null = null;
  if (momento === 'workshop_complete' && workshopId) {
    const { data: workshop } = await supabase.from('workshops').select('title').eq('id', workshopId).maybeSingle();
    if (!workshop) notFound();
    workshopTitle = workshop.title;
  }

  let existingQuery = supabase.from('ux_survey_responses').select('id').eq('user_id', userId).eq('momento', momento);
  existingQuery = workshopId ? existingQuery.eq('workshop_id', workshopId) : existingQuery.is('workshop_id', null);
  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    return (
      <div className="max-w-2xl mx-auto p-16 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
        <h1 className="font-mono text-2xl font-bold text-brand-beige mb-2">Gracias</h1>
        <p className="text-[#9c9c94]">Ya respondiste esta encuesta.</p>
      </div>
    );
  }

  const config = MOMENTO_CONFIG[momento];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">
          {workshopTitle ? `¿Cómo fue "${workshopTitle}"?` : config.heading}
        </h1>
      </div>

      <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border space-y-2 text-sm text-[#9c9c94]">
        <p>
          Esta encuesta es parte de un proyecto de investigación educativa de la plataforma. Tu participación es
          completamente voluntaria: puedes rechazarla sin ninguna consecuencia, y tus respuestas no afectan tu
          calificación en ningún taller.
        </p>
        <p>Los datos se usan con fines de investigación y mejora del taller, y se anonimizan para cualquier reporte externo a la institución.</p>
      </div>

      <form action={submitUxSurvey} className="space-y-6">
        <input type="hidden" name="momento" value={momento} />
        {workshopId && <input type="hidden" name="workshop_id" value={workshopId} />}

        <label className="flex items-start gap-3 bg-brand-terminal-panel p-4 rounded-xl border border-brand-terminal-border cursor-pointer">
          <input type="checkbox" required className="accent-brand-mint mt-1" />
          <span className="text-sm text-brand-beige">
            He leído la información anterior y acepto participar voluntariamente.
          </span>
        </label>

        <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
          {config.items.map((item) => (
            <LikertRow key={item.id} item={item} />
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-2">{config.commentLabel}</label>
          <textarea
            name="comment"
            rows={4}
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
        >
          Enviar respuestas
        </button>
      </form>
    </div>
  );
}
