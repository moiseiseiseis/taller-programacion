-- Infraestructura técnica del instrumento de ansiedad tecnológica/de
-- programación (proyecto-investigacion-consolidado.md, sección 10). Solo
-- T0 y T1: T2 depende de una fecha de cierre del MVP que el propio
-- documento deja sin definir todavía.

alter table public.workshops add column if not exists is_code_workshop boolean not null default false;

-- career se guarda como snapshot al momento de responder (no se lee por
-- join a users), para que un cambio posterior de carrera del alumno no
-- reescriba silenciosamente datos de análisis ya recolectados.
create table if not exists public.anxiety_survey_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  momento text not null check (momento in ('T0', 'T1', 'T2')),
  career text,
  responses jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, momento)
);

alter table public.anxiety_survey_responses enable row level security;

create policy "anxiety_survey_own_read" on public.anxiety_survey_responses
  for select to authenticated using (user_id = auth.uid());

create policy "anxiety_survey_own_insert" on public.anxiety_survey_responses
  for insert to authenticated with check (user_id = auth.uid());

create policy "anxiety_survey_instructor_read_all" on public.anxiety_survey_responses
  for select to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );
