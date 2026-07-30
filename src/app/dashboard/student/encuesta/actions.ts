'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { BLOCK_A, BLOCK_B, EXPERIENCE_ITEM } from '@/lib/anxietySurvey/items';

export async function submitAnxietySurvey(formData: FormData) {
  const userId = await requireRole('student');
  const supabase = await createClient();

  const momento = formData.get('momento') as string;
  if (momento !== 'T0' && momento !== 'T1') throw new Error('Momento de encuesta inválido.');

  const items = momento === 'T0' ? [...BLOCK_A, EXPERIENCE_ITEM] : [...BLOCK_A, ...BLOCK_B];

  const responses: Record<string, number> = {};
  for (const item of items) {
    const raw = formData.get(`item_${item.id}`);
    if (raw === null) throw new Error('Falta responder algún ítem.');
    responses[item.id] = Number(raw);
  }

  const { data: profile } = await supabase.from('users').select('career').eq('id', userId).single();

  const { error } = await supabase.from('anxiety_survey_responses').insert({
    user_id: userId,
    momento,
    career: profile?.career ?? null,
    responses,
  });

  if (error) throw new Error(`No se pudo guardar tu respuesta: ${error.message}`);

  redirect('/dashboard/student');
}
