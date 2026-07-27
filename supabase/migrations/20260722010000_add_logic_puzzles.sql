-- Piezas del expediente del taller de Lógica. Cada fila es un acertijo
-- interactivo dentro de una lección de tipo 'logic'. puzzle_data define las
-- entidades/opciones (o las opciones de una pregunta de elección) que ve el
-- alumno; solution define la respuesta correcta contra la que se valida.
create table if not exists public.logic_puzzles (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  order_index integer not null,
  kind text not null check (kind in ('assignment', 'choice')),
  title text not null,
  narrative text,
  prompt text not null,
  puzzle_data jsonb not null,
  solution jsonb not null,
  hint text,
  created_at timestamptz not null default now()
);

create index if not exists logic_puzzles_lesson_idx
  on public.logic_puzzles (lesson_id, order_index);

alter table public.logic_puzzles enable row level security;

-- Cualquier alumno autenticado puede leer las piezas (el contenido no es
-- sensible; el candado real de avance lo maneja la app con el progreso).
create policy "logic_puzzles_read_all"
  on public.logic_puzzles
  for select
  to authenticated
  using (true);

create policy "logic_puzzles_instructor_write"
  on public.logic_puzzles
  for insert
  to authenticated
  with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "logic_puzzles_instructor_update"
  on public.logic_puzzles
  for update
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "logic_puzzles_instructor_delete"
  on public.logic_puzzles
  for delete
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Qué piezas ya resolvió cada alumno.
create table if not exists public.logic_puzzle_progress (
  id uuid primary key default gen_random_uuid(),
  puzzle_id uuid not null references public.logic_puzzles(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (puzzle_id, user_id)
);

create index if not exists logic_puzzle_progress_user_idx
  on public.logic_puzzle_progress (user_id);

alter table public.logic_puzzle_progress enable row level security;

create policy "logic_puzzle_progress_own_read"
  on public.logic_puzzle_progress
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "logic_puzzle_progress_own_insert"
  on public.logic_puzzle_progress
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "logic_puzzle_progress_instructor_read_all"
  on public.logic_puzzle_progress
  for select
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );
