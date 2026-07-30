'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { scoreLevelQuiz, type LevelQuizAnswer, type LevelQuizQuestionRow } from '@/lib/hackathon/levelQuiz';

export async function chooseLevel(formData: FormData) {
  const userId = await requireRole('student');
  const supabase = await createClient();

  const event_id = formData.get('event_id') as string;
  const level_id = formData.get('level_id') as string;

  const { error } = await supabase
    .from('hackathon_registrations')
    .upsert(
      { event_id, user_id: userId, role: 'participant', level_id },
      { onConflict: 'event_id, user_id' }
    );

  if (error) throw new Error(`No se pudo guardar tu nivel: ${error.message}`);

  revalidatePath('/dashboard/student/hackathon');
  redirect('/dashboard/student/hackathon');
}

export async function submitLevelQuiz(formData: FormData) {
  const userId = await requireRole('student');
  const supabase = await createClient();

  const event_id = formData.get('event_id') as string;

  const { data: questions } = await supabase
    .from('hackathon_level_quiz_questions')
    .select('id, options')
    .eq('event_id', event_id);

  const answers: LevelQuizAnswer[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('q_')) continue;
    answers.push({ questionId: key.slice(2), optionIndex: Number(value) });
  }

  const { suggestedLevelId } = scoreLevelQuiz((questions ?? []) as LevelQuizQuestionRow[], answers);

  const { error } = await supabase
    .from('hackathon_level_quiz_responses')
    .upsert(
      { event_id, user_id: userId, answers, suggested_level_id: suggestedLevelId },
      { onConflict: 'event_id, user_id' }
    );

  if (error) throw new Error(`No se pudieron guardar tus respuestas: ${error.message}`);

  redirect(`/dashboard/student/hackathon/nivel/confirmar?event_id=${event_id}`);
}

export async function createTeam(formData: FormData) {
  const userId = await requireRole('student');
  const supabase = await createClient();

  const event_id = formData.get('event_id') as string;
  const level_id = formData.get('level_id') as string;
  const name = formData.get('name') as string;

  const { data: team, error } = await supabase
    .from('hackathon_teams')
    .insert({ event_id, level_id, name, created_by: userId })
    .select('id')
    .single();

  if (error) throw new Error(`No se pudo crear el equipo: ${error.message}`);

  const { error: memberError } = await supabase
    .from('hackathon_team_members')
    .insert({ team_id: team.id, event_id, user_id: userId, role: 'leader' });

  if (memberError) throw new Error(`El equipo se creó, pero no se pudo unirte a él: ${memberError.message}`);

  const { error: regError } = await supabase
    .from('hackathon_registrations')
    .update({ team_id: team.id })
    .match({ event_id, user_id: userId });

  if (regError) throw new Error(`No se pudo actualizar tu registro: ${regError.message}`);

  revalidatePath('/dashboard/student/hackathon');
}

export async function joinTeam(formData: FormData) {
  const userId = await requireRole('student');
  const supabase = await createClient();

  const event_id = formData.get('event_id') as string;
  const team_id = formData.get('team_id') as string;

  const { data: team, error: teamError } = await supabase
    .from('hackathon_teams')
    .select('id, level_id, hackathon_levels(max_team_size)')
    .eq('id', team_id)
    .single();

  if (teamError || !team) throw new Error('No se encontró el equipo.');

  const { data: registration } = await supabase
    .from('hackathon_registrations')
    .select('level_id')
    .match({ event_id, user_id: userId })
    .maybeSingle();

  if (!registration?.level_id) throw new Error('Primero elige tu nivel.');
  if (registration.level_id !== team.level_id) throw new Error('Ese equipo es de otro nivel.');

  const { count } = await supabase
    .from('hackathon_team_members')
    .select('id', { count: 'exact', head: true })
    .eq('team_id', team_id);

  const levelInfo = team.hackathon_levels as unknown as { max_team_size: number } | null;
  const maxSize = levelInfo?.max_team_size ?? 6;
  if ((count ?? 0) >= maxSize) throw new Error('Este equipo ya está lleno.');

  const { error: memberError } = await supabase
    .from('hackathon_team_members')
    .insert({ team_id, event_id, user_id: userId, role: 'member' });

  if (memberError) throw new Error(`No se pudo unir al equipo: ${memberError.message}`);

  const { error: regError } = await supabase
    .from('hackathon_registrations')
    .update({ team_id })
    .match({ event_id, user_id: userId });

  if (regError) throw new Error(`No se pudo actualizar tu registro: ${regError.message}`);

  revalidatePath('/dashboard/student/hackathon');
}

export async function leaveTeam(formData: FormData) {
  const userId = await requireRole('student');
  const supabase = await createClient();

  const event_id = formData.get('event_id') as string;
  const team_id = formData.get('team_id') as string;

  await supabase.from('hackathon_team_members').delete().match({ team_id, user_id: userId });

  const { count } = await supabase
    .from('hackathon_team_members')
    .select('id', { count: 'exact', head: true })
    .eq('team_id', team_id);

  if ((count ?? 0) === 0) {
    await supabase.from('hackathon_teams').delete().eq('id', team_id);
  }

  await supabase.from('hackathon_registrations').update({ team_id: null }).match({ event_id, user_id: userId });

  revalidatePath('/dashboard/student/hackathon');
}

export async function saveSubmission(formData: FormData) {
  await requireRole('student');
  const supabase = await createClient();

  const team_id = formData.get('team_id') as string;
  const link = formData.get('link') as string;
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('hackathon_submissions')
    .upsert({ team_id, link, submitted_at: now, updated_at: now }, { onConflict: 'team_id' });

  if (error) throw new Error(`No se pudo guardar la entrega: ${error.message}`);

  revalidatePath('/dashboard/student/hackathon');
}

export async function requestLevelChange(formData: FormData) {
  const userId = await requireRole('student');
  const supabase = await createClient();

  const event_id = formData.get('event_id') as string;
  const current_level_id = (formData.get('current_level_id') as string) || null;
  const requested_level_id = formData.get('requested_level_id') as string;
  const reason = (formData.get('reason') as string) || null;

  const { error } = await supabase.from('hackathon_level_change_requests').insert({
    event_id,
    user_id: userId,
    current_level_id,
    requested_level_id,
    reason,
    status: 'pending',
  });

  if (error) throw new Error(`No se pudo enviar la solicitud: ${error.message}`);

  revalidatePath('/dashboard/student/hackathon');
}
