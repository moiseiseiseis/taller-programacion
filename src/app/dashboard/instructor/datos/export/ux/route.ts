import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { toCsv, csvResponse } from '@/lib/csv';
import { FIRST_LESSON_ITEMS, WORKSHOP_COMPLETE_ITEMS, PATH_COMPLETE_ITEMS } from '@/lib/uxSurvey/items';

const ITEM_IDS = Array.from(
  new Set([...FIRST_LESSON_ITEMS, ...WORKSHOP_COMPLETE_ITEMS, ...PATH_COMPLETE_ITEMS].map((item) => item.id))
);
const COLUMNS = ['id', 'user_id', 'momento', 'workshop_id', 'workshop_title', 'created_at', ...ITEM_IDS, 'comment'];

export async function GET() {
  await requireRole('instructor');
  const supabase = await createClient();

  const [{ data, error }, { data: workshops }] = await Promise.all([
    supabase
      .from('ux_survey_responses')
      .select('id, user_id, momento, workshop_id, responses, comment, created_at')
      .order('created_at', { ascending: true }),
    supabase.from('workshops').select('id, title'),
  ]);

  if (error) throw new Error(error.message);

  const workshopTitleById = new Map((workshops ?? []).map((w) => [w.id as string, w.title as string]));

  const rows = (data ?? []).map((row) => {
    const responses = (row.responses ?? {}) as Record<string, number>;
    const flat: Record<string, string | number | null> = {
      id: row.id,
      user_id: row.user_id,
      momento: row.momento,
      workshop_id: row.workshop_id,
      workshop_title: row.workshop_id ? workshopTitleById.get(row.workshop_id as string) ?? '' : '',
      created_at: row.created_at,
      comment: row.comment,
    };
    for (const id of ITEM_IDS) flat[id] = responses[id] ?? '';
    return flat;
  });

  const csv = toCsv(rows, COLUMNS);
  const fecha = new Date().toISOString().slice(0, 10);
  return csvResponse(csv, `encuesta_ux_${fecha}.csv`);
}
