-- Auditoría de seguridad: varias políticas de RLS quedaban con qual/with_check
-- en `true` para {authenticated} sin ningún chequeo de rol, permitiendo que
-- cualquier alumno logueado (con su propio token, sin pasar por la UI) hiciera
-- operaciones reservadas a instructores directamente contra la API de Supabase.
-- El código de la app sí llama requireRole('instructor') en los Server Actions,
-- pero eso no protege nada si el cliente le pega directo a PostgREST.

-- theory_contents: cualquiera podía reescribir la teoría de cualquier lección.
ALTER POLICY "Instructores insertan teoría" ON public.theory_contents
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'instructor'));
ALTER POLICY "Instructores actualizan teoría" ON public.theory_contents
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'instructor'));

-- lesson_resources: cualquiera podía subir/borrar materiales de cualquier lección.
ALTER POLICY "Instructores insertan recursos" ON public.lesson_resources
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'instructor'));
ALTER POLICY "Instructores borran recursos" ON public.lesson_resources
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'instructor'));

-- lesson_tools: cualquiera podía reasignar las herramientas de cualquier lección.
-- Se separa lectura (pública, como antes) de escritura (solo instructor).
ALTER POLICY "Instructores asignan herramientas" ON public.lesson_tools
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'instructor'))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'instructor'));
CREATE POLICY "lesson_tools_read_all" ON public.lesson_tools
  FOR SELECT TO authenticated USING (true);

-- submissions: un alumno podía auto-calificarse (poner status='correct' en su
-- propia entrega, o incluso en la de otro) porque la política de instructor
-- para cambiar el status no validaba rol, y la política del alumno sobre su
-- propia fila no restringía qué columnas podía tocar.
ALTER POLICY "Instructores pueden actualizar el status a correct/incorrect" ON public.submissions
  USING (get_user_role() = ANY (ARRAY['instructor'::text, 'admin'::text]));
ALTER POLICY "students can update their submissions" ON public.submissions
  WITH CHECK (user_id = auth.uid() AND status = 'pending');
ALTER POLICY "students can submit code" ON public.submissions
  WITH CHECK (user_id = auth.uid() AND status = 'pending');
ALTER POLICY "Alumnos pueden insertar entregas" ON public.submissions
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
-- Esta política dejaba leer TODAS las entregas (de cualquier alumno) a
-- cualquier autenticado; ya existen políticas correctas (propio alumno /
-- instructor-admin) que la reemplazan.
DROP POLICY "Permitir lectura general de entregas" ON public.submissions;

-- event_participants: lectura global de asistentes, reemplazada por una
-- política scoped a "soy el instructor de este evento" (o admin), que es lo
-- que de verdad necesita getEventByIdForInstructor().
DROP POLICY "Lectura global de participantes" ON public.event_participants;
CREATE POLICY "event_participants_instructor_read_all" ON public.event_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM events e WHERE e.id = event_participants.event_id AND e.instructor_id = auth.uid())
    OR get_user_role() = 'admin'
  );

-- workshop_enrollments: tabla huérfana (nada en el código actual la usa; las
-- inscripciones reales viven en `enrollments`), pero seguía teniendo lectura
-- global para cualquier autenticado. Se retira por consistencia.
DROP POLICY "Permitir lectura general de inscripciones" ON public.workshop_enrollments;
