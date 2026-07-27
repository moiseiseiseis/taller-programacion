import { createClient } from '@/lib/supabase/server';
import { gradeReflectionSubmission } from '../../../actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const RESPONSE_FIELD_LABELS: Record<string, string> = {
  text: 'Respuesta',
  reflection: 'Reflexión',
  a: 'Primer método',
  b: 'Segundo método',
  solved: 'Resolvió el reto',
  referencedLessonId: 'Lección referenciada',
  items: 'Items',
  topic: 'Tema',
  intervals: 'Calendario',
  answers: 'Respuestas',
  explanation: 'Explicación',
  stuckPoint: 'Dónde se trabó',
  predictedScore: 'Predicción (puntaje)',
  predictedPassed: '¿Predijo que aprobaría?',
  plan: 'Plan de estudio',
  techniquesUsed: 'Técnicas usadas',
};

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '(vacío)';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

export default async function CalificarReflexionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from('metacog_submissions')
    .select(`
      *,
      users ( name, email ),
      metacog_exercises ( title, prompt, kind )
    `)
    .eq('id', id)
    .single();

  if (!submission) notFound();

  const alumno = submission.users as { name: string | null; email: string } | null;
  const exercise = submission.metacog_exercises as { title: string; prompt: string; kind: string } | null;
  const response = (submission.response ?? {}) as Record<string, unknown>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/instructor/revisiones"
          className="text-sm font-semibold text-[#9c9c94] hover:text-brand-mint mb-4 inline-block"
        >
          ← Volver a Bandeja de Entrada
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-beige">Revisión reflexiva</h1>
            <p className="text-[#9c9c94] mt-1">
              Alumno: <span className="font-semibold text-brand-beige">{alumno?.name || 'Estudiante'}</span>
            </p>
          </div>
          <span className="bg-yellow-500/10 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start whitespace-nowrap">
            {submission.rubric_level ? 'Revisado' : 'Pendiente'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
            <h3 className="font-bold text-brand-beige mb-2">{exercise?.title}</h3>
            <p className="text-sm text-[#9c9c94] whitespace-pre-wrap">{exercise?.prompt}</p>
          </div>

          <div className="bg-black/20 rounded-2xl border border-brand-terminal-border p-6 space-y-4">
            {Object.entries(response).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6f6f68] mb-1">
                  {RESPONSE_FIELD_LABELS[key] ?? key}
                </p>
                <pre className="text-sm text-brand-beige whitespace-pre-wrap font-sans">{renderValue(value)}</pre>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <form action={gradeReflectionSubmission} className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border space-y-4">
            <input type="hidden" name="submission_id" value={submission.id} />

            <div>
              <h3 className="font-bold text-brand-beige mb-3">Rúbrica</h3>
              <div className="space-y-2">
                {[
                  { value: 'superficial', label: 'Superficial', desc: 'Cumplió con el mínimo, sin detalle real.' },
                  { value: 'aplicado', label: 'Aplicado', desc: 'Se nota que aplicó la técnica con honestidad.' },
                  { value: 'evidencia_concreta', label: 'Con evidencia concreta', desc: 'Detalle específico y verificable, no solo declarado.' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl border border-brand-terminal-border bg-black/20 cursor-pointer hover:border-brand-mint/40"
                  >
                    <input
                      type="radio"
                      name="rubric_level"
                      value={option.value}
                      defaultChecked={submission.rubric_level === option.value}
                      required
                      className="accent-brand-mint mt-1"
                    />
                    <span>
                      <span className="block font-bold text-brand-beige text-sm">{option.label}</span>
                      <span className="block text-xs text-[#9c9c94]">{option.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-beige mb-1">Comentario para el alumno (opcional)</label>
              <textarea
                name="instructor_feedback"
                defaultValue={submission.instructor_feedback || ''}
                rows={5}
                className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
            >
              Guardar revisión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
