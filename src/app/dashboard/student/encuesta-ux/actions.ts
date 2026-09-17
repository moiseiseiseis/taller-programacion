'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { FIRST_LESSON_ITEMS, WORKSHOP_COMPLETE_ITEMS, PATH_COMPLETE_ITEMS } from '@/lib/uxSurvey/items';

const ITEMS_BY_MOMENTO = {
  first_lesson: FIRST_LESSON_ITEMS,
  workshop_complete: WORKSHOP_COMPLETE_ITEMS,
  path_complete: PATH_COMPLETE_ITEMS,
} as const;

export async function submitUxSurvey(formData: FormData) {
  const userId = await requireRole('student');
  const supabase = await createClient();

  const momento = formData.get('momento') as string;
  if (momento !== 'first_lesson' && momento !== 'workshop_complete' && momento !== 'path_complete') {
    throw new Error('Momento de encuesta inválido.');
  }
  const items = ITEMS_BY_MOMENTO[momento];

  const workshopIdRaw = formData.get('workshop_id');
  const workshopId = typeof workshopIdRaw === 'string' && workshopIdRaw.length > 0 ? workshopIdRaw : null;
  if (momento === 'workshop_complete' && !workshopId) throw new Error('Falta el taller de esta encuesta.');

  const responses: Record<string, number> = {};
  for (const item of items) {
    const raw = formData.get(`item_${item.id}`);
    if (raw === null) throw new Error('Falta responder algún ítem.');
    responses[item.id] = Number(raw);
  }

  const commentRaw = formData.get('comment');
  const comment = typeof commentRaw === 'string' && commentRaw.trim() ? commentRaw.trim() : null;

  const { error } = await supabase.from('ux_survey_responses').insert({
    user_id: userId,
    momento,
    workshop_id: workshopId,
    responses,
    comment,
  });

  if (error) throw new Error(`No se pudo guardar tu respuesta: ${error.message}`);

  redirect('/dashboard/student');
}
