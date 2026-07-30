import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { BLOCK_A, BLOCK_B, EXPERIENCE_ITEM, type SurveyItem } from '@/lib/anxietySurvey/items';
import { submitAnxietySurvey } from '../actions';

function LikertRow({ item, minLabel, maxLabel }: { item: SurveyItem; minLabel: string; maxLabel: string }) {
  return (
    <div className="py-4 border-b border-brand-terminal-border last:border-b-0">
      <p className="text-sm text-brand-beige mb-3">{item.text}</p>
      <div className="flex items-center justify-between gap-2 max-w-md">
        <span className="text-xs text-[#6f6f68] w-24 shrink-0">{minLabel}</span>
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="flex flex-col items-center gap-1 cursor-pointer">
              <input type="radio" name={`item_${item.id}`} value={value} required className="accent-brand-mint" />
              <span className="text-xs text-[#6f6f68]">{value}</span>
            </label>
          ))}
        </div>
        <span className="text-xs text-[#6f6f68] w-24 shrink-0 text-right">{maxLabel}</span>
      </div>
    </div>
  );
}

export default async function AnxietySurveyPage({ params }: { params: Promise<{ momento: string }> }) {
  const userId = await requireRole('student');
  const { momento } = await params;

  if (momento !== 'T0' && momento !== 'T1') notFound();

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('anxiety_survey_responses')
    .select('id')
    .match({ user_id: userId, momento })
    .maybeSingle();

  if (existing) {
    return (
      <div className="max-w-2xl mx-auto p-16 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
        <h1 className="font-mono text-2xl font-bold text-brand-beige mb-2">Gracias</h1>
        <p className="text-[#9c9c94]">Ya respondiste esta encuesta.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Encuesta corta de investigación educativa</h1>
      </div>

      <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border space-y-2 text-sm text-[#9c9c94]">
        <p>
          Esta encuesta es parte de un proyecto de investigación educativa de la plataforma. Tu participación es
          completamente voluntaria: puedes rechazarla sin ninguna consecuencia, y tus respuestas no afectan tu
          calificación en ningún taller.
        </p>
        <p>Los datos se usan con fines de investigación y mejora del taller, y se anonimizan para cualquier reporte externo a la institución.</p>
      </div>

      <form action={submitAnxietySurvey} className="space-y-6">
        <input type="hidden" name="momento" value={momento} />

        <label className="flex items-start gap-3 bg-brand-terminal-panel p-4 rounded-xl border border-brand-terminal-border cursor-pointer">
          <input type="checkbox" required className="accent-brand-mint mt-1" />
          <span className="text-sm text-brand-beige">
            He leído la información anterior y acepto participar voluntariamente.
          </span>
        </label>

        <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
          {BLOCK_A.map((item) => (
            <LikertRow key={item.id} item={item} minLabel="Totalmente en desacuerdo" maxLabel="Totalmente de acuerdo" />
          ))}
          {momento === 'T0' && (
            <LikertRow item={EXPERIENCE_ITEM} minLabel="Ninguna" maxLabel="Mucha" />
          )}
          {momento === 'T1' &&
            BLOCK_B.map((item) => (
              <LikertRow key={item.id} item={item} minLabel="Totalmente en desacuerdo" maxLabel="Totalmente de acuerdo" />
            ))}
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
