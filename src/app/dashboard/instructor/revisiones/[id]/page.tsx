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
          className="text-sm font-semibold text-zinc-500 hover:text-black mb-4 inline-block"
        >
          ← Volver a Bandeja de Entrada
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Revisión de Código</h1>
            <p className="text-zinc-500 mt-1">Alumno: <span className="font-semibold text-black">{alumno?.name || 'Estudiante'}</span></p>
          </div>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Pendiente
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: El código del Alumno */}
        <div className="flex flex-col rounded-2xl border border-zinc-200 shadow-sm overflow-hidden h-[600px]">
          <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200">
            <h2 className="font-bold text-zinc-900">Código Enviado</h2>
            <p className="text-xs text-zinc-500 mt-1">Lenguaje: {practica.language}</p>
          </div>
          <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto">
            <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap">
              {submission.code}
            </pre>
          </div>
        </div>

        {/* Columna Derecha: Criterios y Calificación */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-2">Instrucciones del Ejercicio</h3>
            <p className="text-sm text-zinc-600 whitespace-pre-wrap">{practica.instructions}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex-1">
            <h3 className="font-bold text-zinc-900 mb-2">Resultado Esperado (Output)</h3>
            <pre className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 font-mono text-sm text-zinc-800 whitespace-pre-wrap">
              {practica.expected_output}
            </pre>
          </div>

          {/* Panel de Botones de Calificación */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-4 text-center">Decisión del Instructor</h3>
            <div className="grid grid-cols-2 gap-4">
              <form action={evaluateSubmission}>
                <input type="hidden" name="submission_id" value={submission.id} />
                <input type="hidden" name="status" value="incorrect" />
                <button type="submit" className="w-full py-3 px-4 rounded-lg font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
                  Rechazar
                </button>
              </form>
              
              <form action={evaluateSubmission}>
                <input type="hidden" name="submission_id" value={submission.id} />
                <input type="hidden" name="status" value="correct" />
                <button type="submit" className="w-full py-3 px-4 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors">
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