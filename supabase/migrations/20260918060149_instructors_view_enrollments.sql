-- El panel de instructor ("Alumnos Inscritos") consulta la tabla `enrollments`,
-- pero esa tabla solo tenía una política de lectura para el propio alumno
-- (auth.uid() = user_id). Sin esta política, un instructor consultando
-- enrollments para sus propios talleres siempre obtenía 0 filas por RLS,
-- aunque los datos sí existieran.
CREATE POLICY "Instructores ven inscripciones de sus talleres"
ON public.enrollments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workshops
    WHERE workshops.id = enrollments.workshop_id
      AND workshops.created_by = auth.uid()
  )
  OR get_user_role() = 'admin'
);
