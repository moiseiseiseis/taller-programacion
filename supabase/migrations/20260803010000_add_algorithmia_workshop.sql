-- Motor del Taller de Algoritmia (taller-algoritmia.md). Cada unidad es una
-- simulación distinta (parada óptima, bandido multi-brazo, caché LRU...),
-- así que el motor guarda kind + config jsonb por lección, igual que
-- metacog_exercises. Por ahora solo se implementa 'optimal_stopping'
-- (Unidad 1, piloto); el resto de los kinds se agregan cuando se construya
-- cada unidad.

alter table public.lessons drop constraint lessons_type_check;
alter table public.lessons add constraint lessons_type_check
  check (type = any (array['theory','practice','challenge','terminal','python','logic','reflection','algorithm_sim']));

create table if not exists public.algorithmia_exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  kind text not null check (kind in ('optimal_stopping')),
  title text not null,
  dilemma text not null,
  theory text not null,
  config jsonb not null default '{}'::jsonb,
  reflection_prompt text not null,
  explanation text,
  hint text,
  created_at timestamptz not null default now(),
  unique (lesson_id)
);

alter table public.algorithmia_exercises enable row level security;

create policy "algorithmia_exercises_read_all" on public.algorithmia_exercises
  for select to authenticated using (true);

create policy "algorithmia_exercises_instructor_write" on public.algorithmia_exercises
  for all to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  ) with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Sin corrección automática de la reflexión: el avance se marca al guardar,
-- no al acertar (mismo criterio que metacog_submissions). sim_result guarda
-- qué pasó en la corrida manual del alumno, informativo, no gatea nada.
create table if not exists public.algorithmia_submissions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.algorithmia_exercises(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  sim_result jsonb not null default '{}'::jsonb,
  reflection_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exercise_id, user_id)
);

alter table public.algorithmia_submissions enable row level security;

create policy "algorithmia_submissions_own_read" on public.algorithmia_submissions
  for select to authenticated using (user_id = auth.uid());

create policy "algorithmia_submissions_own_insert" on public.algorithmia_submissions
  for insert to authenticated with check (user_id = auth.uid());

create policy "algorithmia_submissions_own_update" on public.algorithmia_submissions
  for update to authenticated using (user_id = auth.uid());

create policy "algorithmia_submissions_instructor_read_all" on public.algorithmia_submissions
  for select to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );
