'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { parseOptionalJson } from '@/lib/parseOptionalJson';

export async function saveHackathonEvent(formData: FormData) {
  const instructorId = await requireRole('instructor');
  const supabase = await createClient();

  const event_id = formData.get('event_id') as string | null;
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const kind = formData.get('kind') as string;
  const has_levels = formData.get('has_levels') === 'on';
  const start_date = (formData.get('start_date') as string) || null;
  const end_date = (formData.get('end_date') as string) || null;
  const status = formData.get('status') as string;

  const payload = { name, slug, kind, has_levels, start_date, end_date, status };

  const { error } = event_id
    ? await supabase.from('hackathon_events').update(payload).eq('id', event_id)
    : await supabase.from('hackathon_events').insert({ ...payload, created_by: instructorId });

  if (error) throw new Error(`No se pudo guardar el evento: ${error.message}`);

  revalidatePath('/dashboard/instructor/hackathon/configuracion');
  return { success: true };
}

export async function saveHackathonLevel(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const level_id = formData.get('level_id') as string | null;
  const event_id = formData.get('event_id') as string;
  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || null;
  const order_index = Number(formData.get('order_index'));
  const max_team_size = Number(formData.get('max_team_size'));

  const payload = { event_id, name, description, order_index, max_team_size };

  const { error } = level_id
    ? await supabase.from('hackathon_levels').update(payload).eq('id', level_id)
    : await supabase.from('hackathon_levels').insert(payload);

  if (error) throw new Error(`No se pudo guardar el nivel: ${error.message}`);

  revalidatePath('/dashboard/instructor/hackathon/configuracion');
  return { success: true };
}

export async function deleteHackathonLevel(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const level_id = formData.get('level_id') as string;

  const { error } = await supabase.from('hackathon_levels').delete().eq('id', level_id);
  if (error) throw new Error(`No se pudo eliminar el nivel: ${error.message}`);

  revalidatePath('/dashboard/instructor/hackathon/configuracion');
  return { success: true };
}

export async function saveQuizQuestion(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const question_id = formData.get('question_id') as string | null;
  const event_id = formData.get('event_id') as string;
  const order_index = Number(formData.get('order_index'));
  const text = formData.get('text') as string;

  const options = parseOptionalJson(
    formData.get('options_json') as string,
    'El JSON de las opciones no es válido. Revisa el formato.'
  );
  if (!options) throw new Error('Las opciones son obligatorias.');

  const payload = { event_id, order_index, text, options };

  const { error } = question_id
    ? await supabase.from('hackathon_level_quiz_questions').update(payload).eq('id', question_id)
    : await supabase.from('hackathon_level_quiz_questions').insert(payload);

  if (error) throw new Error(`No se pudo guardar la pregunta: ${error.message}`);

  revalidatePath('/dashboard/instructor/hackathon/configuracion');
  return { success: true };
}

export async function deleteQuizQuestion(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const question_id = formData.get('question_id') as string;

  const { error } = await supabase.from('hackathon_level_quiz_questions').delete().eq('id', question_id);
  if (error) throw new Error(`No se pudo eliminar la pregunta: ${error.message}`);

  revalidatePath('/dashboard/instructor/hackathon/configuracion');
  return { success: true };
}

const ANCHOR_BANDS = ['1-2', '3-4', '5-6', '7-8', '9-10'] as const;

export async function saveRubricCriterion(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const criterion_id = formData.get('criterion_id') as string | null;
  const level_id = formData.get('level_id') as string;
  const name = formData.get('name') as string;
  const weight = Number(formData.get('weight'));
  const order_index = Number(formData.get('order_index'));

  const anchor_descriptors: Record<string, string> = {};
  for (const band of ANCHOR_BANDS) {
    const value = (formData.get(`anchor_${band}`) as string) || '';
    if (value.trim()) anchor_descriptors[band] = value.trim();
  }

  const payload = {
    level_id,
    name,
    weight,
    order_index,
    anchor_descriptors: Object.keys(anchor_descriptors).length > 0 ? anchor_descriptors : null,
  };

  const { error } = criterion_id
    ? await supabase.from('hackathon_rubric_criteria').update(payload).eq('id', criterion_id)
    : await supabase.from('hackathon_rubric_criteria').insert(payload);

  if (error) throw new Error(`No se pudo guardar el criterio: ${error.message}`);

  revalidatePath('/dashboard/instructor/hackathon/configuracion');
  return { success: true };
}

export async function deleteRubricCriterion(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const criterion_id = formData.get('criterion_id') as string;

  const { error } = await supabase.from('hackathon_rubric_criteria').delete().eq('id', criterion_id);
  if (error) throw new Error(`No se pudo eliminar el criterio: ${error.message}`);

  revalidatePath('/dashboard/instructor/hackathon/configuracion');
  return { success: true };
}

export async function saveScores(formData: FormData) {
  const judgeId = await requireRole('instructor');
  const supabase = await createClient();

  const team_id = formData.get('team_id') as string;

  const { data: submission } = await supabase
    .from('hackathon_submissions')
    .select('id')
    .eq('team_id', team_id)
    .single();

  if (!submission) throw new Error('Este equipo todavía no entregó nada para calificar.');

  const rows: { submission_id: string; judge_id: string; criterion_id: string; score: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('score_')) continue;
    const score = Number(value);
    if (!Number.isFinite(score)) continue;
    rows.push({ submission_id: submission.id, judge_id: judgeId, criterion_id: key.slice('score_'.length), score });
  }

  if (rows.length === 0) throw new Error('No hay ningún puntaje para guardar.');

  const { error } = await supabase
    .from('hackathon_scores')
    .upsert(rows, { onConflict: 'submission_id, judge_id, criterion_id' });

  if (error) throw new Error(`No se pudieron guardar los puntajes: ${error.message}`);

  revalidatePath(`/dashboard/instructor/hackathon/calificar/${team_id}`);
  revalidatePath('/dashboard/instructor/hackathon/calificar');
}

export async function approveLevelChangeRequest(formData: FormData) {
  const instructorId = await requireRole('instructor');
  const supabase = await createClient();

  const request_id = formData.get('request_id') as string;

  const { data: request, error: requestError } = await supabase
    .from('hackathon_level_change_requests')
    .select('id, event_id, user_id, requested_level_id')
    .eq('id', request_id)
    .single();

  if (requestError || !request) throw new Error('No se encontró la solicitud.');

  const { data: registration } = await supabase
    .from('hackathon_registrations')
    .select('team_id')
    .match({ event_id: request.event_id, user_id: request.user_id })
    .maybeSingle();

  if (registration?.team_id) {
    await supabase
      .from('hackathon_team_members')
      .delete()
      .match({ team_id: registration.team_id, user_id: request.user_id });
  }

  const { error: regError } = await supabase
    .from('hackathon_registrations')
    .update({ level_id: request.requested_level_id, team_id: null })
    .match({ event_id: request.event_id, user_id: request.user_id });

  if (regError) throw new Error(`No se pudo actualizar el registro del alumno: ${regError.message}`);

  const { error: statusError } = await supabase
    .from('hackathon_level_change_requests')
    .update({ status: 'approved', reviewed_by: instructorId, reviewed_at: new Date().toISOString() })
    .eq('id', request_id);

  if (statusError) throw new Error(`No se pudo actualizar la solicitud: ${statusError.message}`);

  revalidatePath('/dashboard/instructor/hackathon/cambios-nivel');
}

export async function rejectLevelChangeRequest(formData: FormData) {
  const instructorId = await requireRole('instructor');
  const supabase = await createClient();

  const request_id = formData.get('request_id') as string;

  const { error } = await supabase
    .from('hackathon_level_change_requests')
    .update({ status: 'rejected', reviewed_by: instructorId, reviewed_at: new Date().toISOString() })
    .eq('id', request_id);

  if (error) throw new Error(`No se pudo actualizar la solicitud: ${error.message}`);

  revalidatePath('/dashboard/instructor/hackathon/cambios-nivel');
}

export async function registerAsJudge(formData: FormData) {
  const instructorId = await requireRole('instructor');
  const supabase = await createClient();

  const event_id = formData.get('event_id') as string;
  const level_id = formData.get('level_id') as string;
  const role = formData.get('role') as string;

  const { error } = await supabase
    .from('hackathon_registrations')
    .upsert(
      { event_id, user_id: instructorId, role, level_id },
      { onConflict: 'event_id, user_id' }
    );

  if (error) throw new Error(`No se pudo completar tu registro: ${error.message}`);

  revalidatePath('/dashboard/instructor/hackathon/juez');
}
