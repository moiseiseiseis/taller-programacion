-- Ejercicios reflexivos del taller de Metacognición. A diferencia de los
-- demás motores de ejercicio, acá no hay corrección automática: la rúbrica
-- es de 3 niveles (superficial/aplicado/con evidencia concreta) y la pone
-- el instructor, no un validador. Cada lección de tipo 'reflection' tiene
-- exactamente un ejercicio (1:1, como practices), no varias piezas.
create table if not exists public.metacog_exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  kind text not null check (kind in (
    'diagnostic', 'embedded_challenge', 'comparison', 'applied_reference',
    'spaced_calendar', 'interleaved_set', 'elaboration', 'calibration', 'integration'
  )),
  title text not null,
  prompt text not null,
  config jsonb not null default '{}'::jsonb,
  hint text,
  created_at timestamptz not null default now()
);

alter table public.metacog_exercises enable row level security;

create policy "metacog_exercises_read_all"
  on public.metacog_exercises
  for select
  to authenticated
  using (true);

create policy "metacog_exercises_instructor_write"
  on public.metacog_exercises
  for insert
  to authenticated
  with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "metacog_exercises_instructor_update"
  on public.metacog_exercises
  for update
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "metacog_exercises_instructor_delete"
  on public.metacog_exercises
  for delete
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Respuesta reflexiva del alumno. referenced_lesson_id es la "referencia
-- cruzada entre talleres": el alumno puede apuntar a una lección real de
-- cualquier otro taller (Python, Análisis de Datos, Lógica) que esté usando
-- como materia prima del ejercicio. rubric_level e instructor_feedback los
-- llena el instructor de forma asíncrona, sin bloquear el avance del alumno
-- (que se marca al primer guardado de response, no al ser revisado).
create table if not exists public.metacog_submissions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.metacog_exercises(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  response jsonb not null default '{}'::jsonb,
  referenced_lesson_id uuid references public.lessons(id) on delete set null,
  rubric_level text check (rubric_level in ('superficial', 'aplicado', 'evidencia_concreta')),
  instructor_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exercise_id, user_id)
);

create index if not exists metacog_submissions_user_idx
  on public.metacog_submissions (user_id);

alter table public.metacog_submissions enable row level security;

create policy "metacog_submissions_own_read"
  on public.metacog_submissions
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "metacog_submissions_own_insert"
  on public.metacog_submissions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "metacog_submissions_own_update"
  on public.metacog_submissions
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "metacog_submissions_instructor_read_all"
  on public.metacog_submissions
  for select
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "metacog_submissions_instructor_update"
  on public.metacog_submissions
  for update
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- El check constraint de lessons.type vive directo en la base (no en
-- migraciones previas) — agregamos 'reflection' para el nuevo tipo de
-- lección de este taller, en la misma migración que crea las tablas.
alter table public.lessons drop constraint if exists lessons_type_check;
alter table public.lessons
  add constraint lessons_type_check
  check (type = any (array['theory'::text, 'practice'::text, 'challenge'::text, 'terminal'::text, 'python'::text, 'logic'::text, 'reflection'::text]));
