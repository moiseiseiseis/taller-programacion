-- Certificados oficiales: solo un instructor puede emitir el certificado de
-- un alumno, y solo para sus propios talleres. La emisión se valida de
-- nuevo server-side (progreso 100%) en la Server Action; esta tabla es el
-- registro oficial de que se emitió, con quién lo emitió y cuándo.

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workshop_id uuid NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  issued_by uuid REFERENCES public.users(id),
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, workshop_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- El alumno ve sus propios certificados.
CREATE POLICY "certificates_own_read" ON public.certificates
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- El instructor ve (y emite) certificados solo de sus propios talleres.
CREATE POLICY "certificates_instructor_read" ON public.certificates
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM workshops w WHERE w.id = certificates.workshop_id AND w.created_by = auth.uid())
    OR get_user_role() = 'admin'
  );

CREATE POLICY "certificates_instructor_write" ON public.certificates
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM workshops w WHERE w.id = certificates.workshop_id AND w.created_by = auth.uid())
    OR get_user_role() = 'admin'
  );

CREATE POLICY "certificates_instructor_update" ON public.certificates
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM workshops w WHERE w.id = certificates.workshop_id AND w.created_by = auth.uid())
    OR get_user_role() = 'admin'
  );
