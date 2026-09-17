import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Download } from 'lucide-react';

function countByMomento(rows: { momento: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.momento] = (counts[row.momento] ?? 0) + 1;
  return counts;
}

function ExportCard({
  title,
  description,
  href,
  total,
  counts,
  momentoLabels,
}: {
  title: string;
  description: string;
  href: string;
  total: number;
  counts: Record<string, number>;
  momentoLabels: Record<string, string>;
}) {
  return (
    <div className="bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-brand-beige">{title}</h2>
        <p className="text-sm text-[#9c9c94] mt-1">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(momentoLabels).map(([momento, label]) => (
          <span
            key={momento}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/30 border border-brand-terminal-border text-[#9c9c94]"
          >
            {label}: {counts[momento] ?? 0}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-brand-terminal-border">
        <span className="text-sm text-[#6f6f68]">{total} respuestas en total</span>
        <a
          href={href}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all"
        >
          <Download size={16} />
          Descargar CSV
        </a>
      </div>
    </div>
  );
}

export default async function InstructorDataPage() {
  await requireRole('instructor');
  const supabase = await createClient();

  const [{ data: anxietyRows }, { data: uxRows }] = await Promise.all([
    supabase.from('anxiety_survey_responses').select('momento'),
    supabase.from('ux_survey_responses').select('momento'),
  ]);

  const anxietyCounts = countByMomento(anxietyRows ?? []);
  const uxCounts = countByMomento(uxRows ?? []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Datos de investigación</h1>
        <p className="text-[#9c9c94] mt-2">
          Exporta las respuestas de las encuestas en CSV, listas para análisis de datos (Excel, R, Python, SPSS).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExportCard
          title="Encuesta de ansiedad tecnológica"
          description="Instrumento de ansiedad tecnológica/de programación, momentos T0 y T1."
          href="/dashboard/instructor/datos/export/ansiedad"
          total={(anxietyRows ?? []).length}
          counts={anxietyCounts}
          momentoLabels={{ T0: 'T0', T1: 'T1' }}
        />

        <ExportCard
          title="Encuesta de experiencia de usuario (UX)"
          description="Fricción y claridad percibida por taller: primera lección, cada taller completado y la ruta completa."
          href="/dashboard/instructor/datos/export/ux"
          total={(uxRows ?? []).length}
          counts={uxCounts}
          momentoLabels={{
            first_lesson: 'Primera lección',
            workshop_complete: 'Taller completado',
            path_complete: 'Ruta completa',
          }}
        />
      </div>
    </div>
  );
}
