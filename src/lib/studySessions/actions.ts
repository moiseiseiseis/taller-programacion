'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { STUDY_SESSION_TIMEOUT_MINUTES } from './pilot';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Cierra sola cualquier sesión abierta de este alumno cuyo último heartbeat
// ya pasó el umbral de inactividad. Se llama antes de abrir una nueva sesión
// y en cada heartbeat, para que ninguna sesión olvidada quede corriendo
// indefinidamente e infle los promedios del piloto.
async function closeStaleSessions(supabase: SupabaseServerClient, userId: string) {
  const staleBefore = new Date(Date.now() - STUDY_SESSION_TIMEOUT_MINUTES * 60 * 1000).toISOString();

  const { data: stale } = await supabase
    .from('study_sessions')
    .select('id, last_heartbeat_at')
    .eq('user_id', userId)
    .is('ended_at', null)
    .lt('last_heartbeat_at', staleBefore);

  for (const session of stale ?? []) {
    await supabase
      .from('study_sessions')
      .update({ ended_at: session.last_heartbeat_at, ended_reason: 'timeout' })
      .eq('id', session.id);
  }
}

export async function startStudySession(workshopId: string): Promise<{ id: string; startedAt: string }> {
  const { user } = await getAuthUser();
  if (!user) throw new Error('No autenticado');

  const supabase = await createClient();
  await closeStaleSessions(supabase, user.id);

  // Idempotente: si ya hay una sesión abierta para este taller (doble clic,
  // recarga de página), la reusamos en vez de crear una duplicada.
  const { data: existing } = await supabase
    .from('study_sessions')
    .select('id, started_at')
    .eq('user_id', user.id)
    .eq('workshop_id', workshopId)
    .is('ended_at', null)
    .maybeSingle();

  if (existing) {
    return { id: existing.id, startedAt: existing.started_at };
  }

  const { data: created, error } = await supabase
    .from('study_sessions')
    .insert({ user_id: user.id, workshop_id: workshopId })
    .select('id, started_at')
    .single();

  if (error || !created) throw new Error('No se pudo iniciar la sesión de estudio');
  return { id: created.id, startedAt: created.started_at };
}

export async function heartbeatStudySession(sessionId: string): Promise<{ ok: boolean }> {
  const { user } = await getAuthUser();
  if (!user) throw new Error('No autenticado');

  const supabase = await createClient();
  await closeStaleSessions(supabase, user.id);

  const { data } = await supabase
    .from('study_sessions')
    .update({ last_heartbeat_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .is('ended_at', null)
    .select('id')
    .maybeSingle();

  // Si no hubo fila (la sesión ya se cerró por timeout justo antes), el
  // cliente lo interpreta como "ya no sigue activa" y resetea su botón.
  return { ok: !!data };
}

export async function endStudySession(sessionId: string): Promise<{ ok: boolean }> {
  const { user } = await getAuthUser();
  if (!user) throw new Error('No autenticado');

  const supabase = await createClient();

  const { data } = await supabase
    .from('study_sessions')
    .update({ ended_at: new Date().toISOString(), ended_reason: 'manual' })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .is('ended_at', null)
    .select('id')
    .maybeSingle();

  return { ok: !!data };
}
