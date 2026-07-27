import { createClient } from '@/lib/supabase/server';
import { evaluateSubmission } from '../../actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CalificarEntregaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from('submissions')
    .select(`
      *,
      users ( name, email ),
      practices ( title, instructions, language, expected_output )
    `)
    .eq('id', id)
    .single();

  if (!submission) notFound();

  // Variables para acortar el código (usamos 'as any' por el cruce de tablas)
  const alumno = submission.users as any;
  const practica = submission.practices as any;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/instructor/revisiones"
          className="text-sm font-semibold text-[#9c9c94] hover:text-brand-mint mb-4 inline-block"
        >
          ← Volver a Bandeja de Entrada
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-brand-beige">Revisión de Código</h1>
            <p className="text-[#9c9c94] mt-1">Alumno: <span className="font-semibold text-brand-beige">{alumno?.name || 'Estudiante'}</span></p>
          </div>
          <span className="bg-yellow-500/10 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start whitespace-nowrap">
            Pendiente
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: El código del Alumno */}
        <div className="flex flex-col rounded-2xl border border-brand-terminal-border overflow-hidden h-[600px]">
          <div className="bg-black/20 px-6 py-4 border-b border-brand-terminal-border">
            <h2 className="font-bold text-brand-beige">Código Enviado</h2>
            <p className="text-xs text-[#9c9c94] mt-1">Lenguaje: {practica.language}</p>
          </div>
          <div className="flex-1 bg-black p-6 overflow-y-auto">
            <pre className="text-brand-mint font-mono text-sm whitespace-pre-wrap">
              {submission.code}
            </pre>
          </div>
        </div>

        {/* Columna Derecha: Criterios y Calificación */}
        <div className="flex flex-col gap-6">
          <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
            <h3 className="font-bold text-brand-beige mb-2">Instrucciones del Ejercicio</h3>
            <p className="text-sm text-[#9c9c94] whitespace-pre-wrap">{practica.instructions}</p>
          </div>

          <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border flex-1">
            <h3 className="font-bold text-brand-beige mb-2">Resultado Esperado (Output)</h3>
            <pre className="bg-black/30 p-4 rounded-lg border border-brand-terminal-border font-mono text-sm text-[#c8c8c0] whitespace-pre-wrap">
              {practica.expected_output}
            </pre>
          </div>

          {/* Panel de Botones de Calificación */}
          <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border">
            <h3 className="font-bold text-brand-beige mb-4 text-center">Decisión del Instructor</h3>
            <div className="grid grid-cols-2 gap-4">
              <form action={evaluateSubmission}>
                <input type="hidden" name="submission_id" value={submission.id} />
                <input type="hidden" name="status" value="incorrect" />
                <button type="submit" className="w-full py-3 px-4 rounded-lg font-bold text-brand-salmon bg-brand-salmon/10 hover:bg-brand-salmon/20 border border-brand-salmon/30 transition-colors">
                  Rechazar
                </button>
              </form>

              <form action={evaluateSubmission}>
                <input type="hidden" name="submission_id" value={submission.id} />
                <input type="hidden" name="status" value="correct" />
                <button type="submit" className="w-full py-3 px-4 rounded-lg font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all">
                  Aprobar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}