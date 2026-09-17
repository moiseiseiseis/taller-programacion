import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { toCsv, csvResponse } from '@/lib/csv';
import { BLOCK_A, BLOCK_B, EXPERIENCE_ITEM } from '@/lib/anxietySurvey/items';

const ITEM_IDS = [...BLOCK_A, ...BLOCK_B, EXPERIENCE_ITEM].map((item) => item.id);
const COLUMNS = ['id', 'user_id', 'momento', 'career', 'created_at', ...ITEM_IDS];

export async function GET() {
  await requireRole('instructor');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('anxiety_survey_responses')
    .select('id, user_id, momento, career, responses, created_at')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []).map((row) => {
    const responses = (row.responses ?? {}) as Record<string, number>;
    const flat: Record<string, string | number | null> = {
      id: row.id,
      user_id: row.user_id,
      momento: row.momento,
      career: row.career,
      created_at: row.created_at,
    };
    for (const id of ITEM_IDS) flat[id] = responses[id] ?? '';
    return flat;
  });

  const csv = toCsv(rows, COLUMNS);
  const fecha = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `encuesta_ansiedad_${fecha}.csv`);
}
