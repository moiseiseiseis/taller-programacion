-- El certificado físico (plantilla del director) necesita fecha de
-- realización, lugar y duración del taller — datos que no existían en
-- ningún lado del sistema (solo guardábamos cuándo se EMITIÓ el
-- certificado, no cuándo/dónde/cuánto duró la sesión real).
ALTER TABLE public.certificates
  ADD COLUMN realized_at date,
  ADD COLUMN location text,
  ADD COLUMN duration_hours numeric;
