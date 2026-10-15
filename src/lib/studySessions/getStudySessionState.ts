import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { isPilotStudent, isPilotWindowOpen } from './pilot';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type StudySessionState = {
  showButton: boolean;
  initialSession: { id: string; startedAt: string } | null;
};

// Decide si este alumno (en este taller) debe ver el botón flotante de
// sesión de estudio, y si ya tiene una sesión corriendo (p.ej. tras
// recargar la página) para que el botón arranque en el estado correcto.
export async function getStudySessionState(
  supabase: SupabaseServerClient,
  userId: string | undefined,
  createdAt: string | null | undefined,
  workshopId: string
): Promise<StudySessionState> {
  if (!userId || !isPilotWindowOpen() || !isPilotStudent(createdAt)) {
    return { showButton: false, initialSession: null };
  }

  const { data } = await supabase
    .from('study_sessions')
    .select('id, started_at')
    .eq('user_id', userId)
    .eq('workshop_id', workshopId)
    .is('ended_at', null)
    .maybeSingle();

  return {
    showButton: true,
    initialSession: data ? { id: data.id, startedAt: data.started_at } : null,
  };
}
