-- Registro de qué lecciones completó cada alumno. Es la fuente de verdad para
-- el progreso visible (checkmarks, barras de %, "Mi Progreso"), separada de
-- lesson_quiz_attempts (que sigue siendo la fuente de verdad del bloqueo de
-- avance). Se llena automáticamente desde tres lugares:
--   - aprobar el quiz de una lección (submitLessonQuiz)
--   - el instructor aprueba una entrega de práctica (evaluateSubmission)
--   - el alumno marca como vista una lección de teoría sin quiz (markLessonComplete)
create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (lesson_id, user_id)
);

create index if not exists lesson_completions_user_idx
  on public.lesson_completions (user_id);

alter table public.lesson_completions enable row level security;

create policy "lesson_completions_own_read"
  on public.lesson_completions
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "lesson_completions_own_insert"
  on public.lesson_completions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "lesson_completions_instructor_read_all"
  on public.lesson_completions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'instructor'
    )
  );

-- El instructor inserta a nombre del alumno cuando aprueba una entrega
-- (evaluateSubmission corre con la sesión del instructor, no la del alumno).
create policy "lesson_completions_instructor_insert"
  on public.lesson_completions
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'instructor'
    )
  );
