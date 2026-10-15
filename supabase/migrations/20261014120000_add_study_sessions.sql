-- Piloto de medición de tiempo de estudio: cada alumno del grupo piloto
-- (los que se registran durante la ventana del piloto, ver
-- src/lib/studySessions/pilot.ts) puede marcar "inicio/fin de sesión de
-- estudio" dentro de un taller. Un heartbeat periódico del cliente
-- actualiza last_heartbeat_at mientras la pestaña está visible; si no llega
-- ningún heartbeat en ~10 min, la sesión se cierra sola (ended_reason
-- 'timeout') usando la hora del último heartbeat, no la hora en que alguien
-- lo nota — así una sesión olvidada no infla los promedios.

CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_heartbeat_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  ended_reason text CHECK (ended_reason IN ('manual', 'timeout'))
);

CREATE INDEX study_sessions_open_by_user ON public.study_sessions (user_id) WHERE ended_at IS NULL;

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- El alumno maneja sus propias sesiones (crear, mandar heartbeat, cerrar).
CREATE POLICY "study_sessions_own_insert" ON public.study_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "study_sessions_own_select" ON public.study_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "study_sessions_own_update" ON public.study_sessions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- El instructor dueño del taller (o admin) puede leer las sesiones para
-- sacar los promedios del análisis, pero no puede escribirlas.
CREATE POLICY "study_sessions_instructor_select" ON public.study_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM workshops w WHERE w.id = study_sessions.workshop_id AND w.created_by = auth.uid())
    OR get_user_role() = 'admin'
  );
