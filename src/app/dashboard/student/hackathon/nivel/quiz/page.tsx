import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { submitLevelQuiz } from '../../actions';

type QuizOption = { label: string; scores: Record<string, number> };
type QuizQuestion = { id: string; text: string; options: QuizOption[] };

export default async function NivelQuizPage() {
  const supabase = await createClient();
  const { data: event } = await supabase
    .from('hackathon_events')
    .select('id')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!event) notFound();

  const { data: questions } = await supabase
    .from('hackathon_level_quiz_questions')
    .select('id, text, options')
    .eq('event_id', event.id)
    .order('order_index', { ascending: true });

  const list = (questions ?? []) as QuizQuestion[];

  if (list.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center bg-black/20 border-2 border-dashed border-brand-terminal-border rounded-3xl">
        <p className="text-[#9c9c94]">El test de nivel todavía no está configurado. Elige tu nivel desde el menú.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Test de nivel</h1>
        <p className="text-[#9c9c94] mt-2">
          Responde lo más honesto posible — el resultado es una sugerencia que después vas a poder cambiar.
        </p>
      </div>

      <form action={submitLevelQuiz} className="space-y-6">
        <input type="hidden" name="event_id" value={event.id} />
        {list.map((question, i) => (
          <div key={question.id} className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
            <h2 className="font-semibold text-brand-beige mb-4">
              {i + 1}. {question.text}
            </h2>
            <div className="space-y-2">
              {question.options.map((option, oi) => (
                <label
                  key={oi}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-brand-terminal-border bg-black/20 cursor-pointer hover:border-brand-mint/40 transition-colors"
                >
                  <input type="radio" name={`q_${question.id}`} value={oi} required className="accent-brand-mint" />
                  <span className="text-sm text-brand-beige">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="submit"
          className="w-full py-3 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
        >
          Ver mi sugerencia de nivel
        </button>
      </form>
    </div>
  );
}
