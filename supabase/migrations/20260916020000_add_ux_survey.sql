-- Instrumento de experiencia de usuario (UX), independiente del instrumento
-- de ansiedad tecnológica (anxiety_survey_responses). Mide fricción/claridad
-- por taller, no ansiedad general. Tres momentos:
--   'first_lesson'      -> primera lección completada en toda la plataforma
--   'workshop_complete' -> cada vez que el alumno termina un taller al 100%
--                          (se repite por taller, por eso lleva workshop_id)
--   'path_complete'     -> al terminar todos los talleres de una ruta de
--                          aprendizaje activa (ej. "Fundamentales")
create table if not exists public.ux_survey_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  momento text not null check (momento in ('first_lesson', 'workshop_complete', 'path_complete')),
  workshop_id uuid references public.workshops(id) on delete cascade,
  responses jsonb not null default '{}'::jsonb,
  comment text,
  created_at timestamptz not null default now(),
  constraint ux_survey_workshop_id_matches_momento check (
    (momento = 'workshop_complete' and workshop_id is not null) or
    (momento <> 'workshop_complete' and workshop_id is null)
  )
);

-- Un solo constraint UNIQUE con workshop_id nulleable no alcanza (NULL no se
-- compara igual a NULL en Postgres), así que se separan en dos índices
-- parciales: uno por taller para 'workshop_complete', y uno general para
-- los otros dos momentos que solo ocurren una vez por alumno.
create unique index if not exists ux_survey_unique_per_workshop
  on public.ux_survey_responses (user_id, momento, workshop_id)
  where workshop_id is not null;

create unique index if not exists ux_survey_unique_per_momento
  on public.ux_survey_responses (user_id, momento)
  where workshop_id is null;

alter table public.ux_survey_responses enable row level security;

create policy "ux_survey_own_read" on public.ux_survey_responses
  for select to authenticated using (user_id = auth.uid());

create policy "ux_survey_own_insert" on public.ux_survey_responses
  for insert to authenticated with check (user_id = auth.uid());

create policy "ux_survey_instructor_read_all" on public.ux_survey_responses
  for select to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );
