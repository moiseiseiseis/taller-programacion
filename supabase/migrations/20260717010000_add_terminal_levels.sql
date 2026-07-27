-- Niveles del minijuego de terminal. Cada fila es un nivel jugable dentro de
-- una lección de tipo 'terminal' (un "mundo" del módulo 2). filesystem define
-- el árbol de archivos inicial del nivel; validator define cómo se detecta
-- que el alumno lo resolvió.
create table if not exists public.terminal_levels (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  order_index integer not null,
  title text not null,
  narrative text,
  goal text not null,
  filesystem jsonb not null,
  validator jsonb not null,
  hint text,
  created_at timestamptz not null default now()
);

create index if not exists terminal_levels_lesson_idx
  on public.terminal_levels (lesson_id, order_index);

alter table public.terminal_levels enable row level security;

-- Cualquier alumno autenticado puede leer los niveles (el contenido no es
-- sensible; el candado real de avance lo maneja la app con el progreso).
create policy "terminal_levels_read_all"
  on public.terminal_levels
  for select
  to authenticated
  using (true);

create policy "terminal_levels_instructor_write"
  on public.terminal_levels
  for insert
  to authenticated
  with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "terminal_levels_instructor_update"
  on public.terminal_levels
  for update
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "terminal_levels_instructor_delete"
  on public.terminal_levels
  for delete
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Qué niveles ya resolvió cada alumno.
create table if not exists public.terminal_level_progress (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.terminal_levels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (level_id, user_id)
);

create index if not exists terminal_level_progress_user_idx
  on public.terminal_level_progress (user_id);

alter table public.terminal_level_progress enable row level security;

create policy "terminal_level_progress_own_read"
  on public.terminal_level_progress
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "terminal_level_progress_own_insert"
  on public.terminal_level_progress
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "terminal_level_progress_instructor_read_all"
  on public.terminal_level_progress
  for select
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );
