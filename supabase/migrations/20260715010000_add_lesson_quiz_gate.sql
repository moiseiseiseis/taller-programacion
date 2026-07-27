-- Quiz opcional por lección, usado como gate para avanzar a la siguiente.
-- null = la lección no tiene quiz (se puede avanzar libremente). Estructura esperada:
-- {
--   "passScore": 3,
--   "questions": [
--     { "text": "...", "options": [{ "label": "...", "score": 1 }, { "label": "...", "score": 0 }] }
--   ]
-- }
alter table public.lessons add column if not exists quiz jsonb;

-- Intentos de quiz de los alumnos. El puntaje se calcula server-side (nunca
-- confiamos en un score que mande el cliente), así que esta tabla es la
-- fuente de verdad de qué lecciones ya desbloqueó cada alumno.
create table if not exists public.lesson_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null,
  passed boolean not null,
  answers jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lesson_quiz_attempts_user_lesson_idx
  on public.lesson_quiz_attempts (user_id, lesson_id);

alter table public.lesson_quiz_attempts enable row level security;

-- Cada alumno lee sus propios intentos
create policy "lesson_quiz_attempts_own_read"
  on public.lesson_quiz_attempts
  for select
  to authenticated
  using (user_id = auth.uid());

-- Cada alumno inserta sus propios intentos (nunca a nombre de otro)
create policy "lesson_quiz_attempts_own_insert"
  on public.lesson_quiz_attempts
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Los instructores pueden ver los intentos de todos, para seguimiento
create policy "lesson_quiz_attempts_instructor_read_all"
  on public.lesson_quiz_attempts
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'instructor'
    )
  );
