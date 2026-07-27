-- Ejercicios del módulo de Python (Taller 3). Cada fila es un ejercicio de
-- código dentro de una lección de tipo 'python': 'guided' es un ejercicio con
-- código casi completo (el alumno llena la parte que falta), 'free' es un
-- problema abierto que combina conceptos de unidades anteriores. test_spec
-- define cómo se valida la solución (ver src/lib/pythonTestSpec.ts).
create table if not exists public.python_exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  order_index integer not null,
  kind text not null check (kind in ('guided', 'free')),
  title text not null,
  prompt text not null,
  starter_code text not null,
  test_spec jsonb not null,
  hint text,
  created_at timestamptz not null default now()
);

create index if not exists python_exercises_lesson_idx
  on public.python_exercises (lesson_id, order_index);

alter table public.python_exercises enable row level security;

-- Cualquier alumno autenticado puede leer los ejercicios (el contenido no es
-- sensible; el candado real de avance lo maneja la app con el progreso).
create policy "python_exercises_read_all"
  on public.python_exercises
  for select
  to authenticated
  using (true);

create policy "python_exercises_instructor_write"
  on public.python_exercises
  for insert
  to authenticated
  with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "python_exercises_instructor_update"
  on public.python_exercises
  for update
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "python_exercises_instructor_delete"
  on public.python_exercises
  for delete
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Qué ejercicios ya resolvió cada alumno.
create table if not exists public.python_exercise_progress (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.python_exercises(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (exercise_id, user_id)
);

create index if not exists python_exercise_progress_user_idx
  on public.python_exercise_progress (user_id);

alter table public.python_exercise_progress enable row level security;

create policy "python_exercise_progress_own_read"
  on public.python_exercise_progress
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "python_exercise_progress_own_insert"
  on public.python_exercise_progress
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "python_exercise_progress_instructor_read_all"
  on public.python_exercise_progress
  for select
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );
