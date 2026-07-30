-- Sistema de registro para el Hackathon (Fase 1: registro, niveles, equipos).
-- Deliberadamente separado de `events`/`event_participants` (RSVP simple sin
-- niveles ni equipos, no versionado en migraciones) para no mezclar dos
-- conceptos distintos. Todas las tablas se prefijan hackathon_ para evitar
-- cualquier colisión con esas tablas no versionadas.

-- ============================================================
-- Tablas con Server Actions / UI en Fase 1
-- ============================================================

create table if not exists public.hackathon_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  kind text not null default 'team' check (kind in ('team', 'individual', 'both')),
  has_levels boolean not null default true,
  start_date timestamptz,
  end_date timestamptz,
  status text not null default 'draft' check (status in ('draft', 'open', 'in_progress', 'closed')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.hackathon_events enable row level security;

create policy "hackathon_events_read_all" on public.hackathon_events
  for select to authenticated using (true);

create policy "hackathon_events_instructor_insert" on public.hackathon_events
  for insert to authenticated with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "hackathon_events_instructor_update" on public.hackathon_events
  for update to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Niveles de un evento (Principiante/Medio/Avanzado). description = contenido
-- del menú informativo para autoselección.
create table if not exists public.hackathon_levels (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.hackathon_events(id) on delete cascade,
  name text not null,
  description text,
  order_index integer not null default 0,
  max_team_size integer not null default 6,
  created_at timestamptz not null default now(),
  unique (event_id, name)
);

create index if not exists hackathon_levels_event_idx on public.hackathon_levels (event_id, order_index);

alter table public.hackathon_levels enable row level security;

create policy "hackathon_levels_read_all" on public.hackathon_levels
  for select to authenticated using (true);

create policy "hackathon_levels_instructor_insert" on public.hackathon_levels
  for insert to authenticated with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "hackathon_levels_instructor_update" on public.hackathon_levels
  for update to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "hackathon_levels_instructor_delete" on public.hackathon_levels
  for delete to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Equipos, siempre atados a un nivel (un equipo no mezcla niveles).
create table if not exists public.hackathon_teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.hackathon_events(id) on delete cascade,
  level_id uuid not null references public.hackathon_levels(id) on delete cascade,
  name text not null,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, name)
);

create index if not exists hackathon_teams_level_idx on public.hackathon_teams (level_id);

alter table public.hackathon_teams enable row level security;

-- Lectura abierta: un estudiante necesita ver todos los equipos de su nivel
-- para decidir a cuál unirse.
create policy "hackathon_teams_read_all" on public.hackathon_teams
  for select to authenticated using (true);

create policy "hackathon_teams_own_insert" on public.hackathon_teams
  for insert to authenticated with check (created_by = auth.uid());

create policy "hackathon_teams_instructor_update" on public.hackathon_teams
  for update to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "hackathon_teams_instructor_delete" on public.hackathon_teams
  for delete to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Membresía. event_id se denormaliza (derivable de team_id) específicamente
-- para poder poner unique(event_id, user_id): un usuario solo puede estar en
-- UN equipo por evento, sin importar el nivel.
create table if not exists public.hackathon_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.hackathon_teams(id) on delete cascade,
  event_id uuid not null references public.hackathon_events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('leader', 'member')),
  joined_at timestamptz not null default now(),
  unique (team_id, user_id),
  unique (event_id, user_id)
);

create index if not exists hackathon_team_members_user_idx on public.hackathon_team_members (user_id);

alter table public.hackathon_team_members enable row level security;

create policy "hackathon_team_members_read_all" on public.hackathon_team_members
  for select to authenticated using (true);

create policy "hackathon_team_members_own_insert" on public.hackathon_team_members
  for insert to authenticated with check (user_id = auth.uid());

create policy "hackathon_team_members_own_delete" on public.hackathon_team_members
  for delete to authenticated using (user_id = auth.uid());

create policy "hackathon_team_members_instructor_delete" on public.hackathon_team_members
  for delete to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Registro de rol dentro del evento: participante (con nivel, sin equipo
-- todavía), jurado, o mentor. Una fila por usuario por evento.
create table if not exists public.hackathon_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.hackathon_events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('participant', 'judge', 'mentor')),
  level_id uuid references public.hackathon_levels(id) on delete set null,
  team_id uuid references public.hackathon_teams(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists hackathon_registrations_event_idx on public.hackathon_registrations (event_id, role, level_id);

alter table public.hackathon_registrations enable row level security;

create policy "hackathon_registrations_own_read" on public.hackathon_registrations
  for select to authenticated using (user_id = auth.uid());

create policy "hackathon_registrations_own_insert" on public.hackathon_registrations
  for insert to authenticated with check (user_id = auth.uid());

create policy "hackathon_registrations_own_update" on public.hackathon_registrations
  for update to authenticated using (user_id = auth.uid());

create policy "hackathon_registrations_instructor_read_all" on public.hackathon_registrations
  for select to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Preguntas del test de 15 preguntas, específicas de este evento (no un
-- banco genérico todavía — decisión explícita de la sección 7.4 del doc).
-- options = [{ "label": "...", "scores": { "<level_id>": 3, "<level_id2>": 0 } }]
create table if not exists public.hackathon_level_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.hackathon_events(id) on delete cascade,
  order_index integer not null default 0,
  text text not null,
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists hackathon_quiz_questions_event_idx on public.hackathon_level_quiz_questions (event_id, order_index);

alter table public.hackathon_level_quiz_questions enable row level security;

create policy "hackathon_quiz_questions_read_all" on public.hackathon_level_quiz_questions
  for select to authenticated using (true);

create policy "hackathon_quiz_questions_instructor_insert" on public.hackathon_level_quiz_questions
  for insert to authenticated with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "hackathon_quiz_questions_instructor_update" on public.hackathon_level_quiz_questions
  for update to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "hackathon_quiz_questions_instructor_delete" on public.hackathon_level_quiz_questions
  for delete to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Respuesta + sugerencia calculada server-side. answers guarda
-- [{questionId, optionIndex}] — nunca el score, ese se recalcula siempre
-- desde hackathon_level_quiz_questions.
create table if not exists public.hackathon_level_quiz_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.hackathon_events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  answers jsonb not null default '[]'::jsonb,
  suggested_level_id uuid references public.hackathon_levels(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.hackathon_level_quiz_responses enable row level security;

create policy "hackathon_quiz_responses_own_read" on public.hackathon_level_quiz_responses
  for select to authenticated using (user_id = auth.uid());

create policy "hackathon_quiz_responses_own_insert" on public.hackathon_level_quiz_responses
  for insert to authenticated with check (user_id = auth.uid());

create policy "hackathon_quiz_responses_own_update" on public.hackathon_level_quiz_responses
  for update to authenticated using (user_id = auth.uid());

create policy "hackathon_quiz_responses_instructor_read_all" on public.hackathon_level_quiz_responses
  for select to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- ============================================================
-- Tablas solo-schema en Fase 1 (RLS lista; sin Server Actions ni UI todavía)
-- ============================================================

-- Un solo link por equipo, editable hasta el cierre de esa fase (regla de
-- negocio para Fase 2, no impuesta a nivel de constraint acá).
create table if not exists public.hackathon_submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.hackathon_teams(id) on delete cascade,
  link text not null,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (team_id)
);

alter table public.hackathon_submissions enable row level security;

create policy "hackathon_submissions_team_read" on public.hackathon_submissions
  for select to authenticated using (
    exists (select 1 from public.hackathon_team_members tm where tm.team_id = hackathon_submissions.team_id and tm.user_id = auth.uid())
  );

create policy "hackathon_submissions_team_insert" on public.hackathon_submissions
  for insert to authenticated with check (
    exists (select 1 from public.hackathon_team_members tm where tm.team_id = hackathon_submissions.team_id and tm.user_id = auth.uid())
  );

create policy "hackathon_submissions_team_update" on public.hackathon_submissions
  for update to authenticated using (
    exists (select 1 from public.hackathon_team_members tm where tm.team_id = hackathon_submissions.team_id and tm.user_id = auth.uid())
  );

create policy "hackathon_submissions_instructor_read_all" on public.hackathon_submissions
  for select to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Precargada desde la rúbrica del documento de diseño en una migración de
-- datos posterior (Fase 2), no acá.
create table if not exists public.hackathon_rubric_criteria (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.hackathon_levels(id) on delete cascade,
  name text not null,
  weight numeric(5,2) not null,
  order_index integer not null default 0,
  anchor_descriptors jsonb,
  created_at timestamptz not null default now()
);

alter table public.hackathon_rubric_criteria enable row level security;

create policy "hackathon_rubric_criteria_read_all" on public.hackathon_rubric_criteria
  for select to authenticated using (true);

create policy "hackathon_rubric_criteria_instructor_write" on public.hackathon_rubric_criteria
  for all to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  ) with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- judge_id se resuelve vía requireRole('instructor') cuando se construya el
-- dashboard de jueces en la siguiente fase.
create table if not exists public.hackathon_scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.hackathon_submissions(id) on delete cascade,
  judge_id uuid not null references public.users(id) on delete cascade,
  criterion_id uuid not null references public.hackathon_rubric_criteria(id) on delete cascade,
  score integer not null check (score between 1 and 10),
  created_at timestamptz not null default now(),
  unique (submission_id, judge_id, criterion_id)
);

alter table public.hackathon_scores enable row level security;

create policy "hackathon_scores_judge_own_read" on public.hackathon_scores
  for select to authenticated using (judge_id = auth.uid());

create policy "hackathon_scores_judge_own_insert" on public.hackathon_scores
  for insert to authenticated with check (judge_id = auth.uid());

create policy "hackathon_scores_judge_own_update" on public.hackathon_scores
  for update to authenticated using (judge_id = auth.uid());

create policy "hackathon_scores_instructor_read_all" on public.hackathon_scores
  for select to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Flujo de aprobación de cambio de nivel (sección 7.5 del documento),
-- construido en la siguiente fase.
create table if not exists public.hackathon_level_change_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.hackathon_events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  current_level_id uuid references public.hackathon_levels(id) on delete set null,
  requested_level_id uuid not null references public.hackathon_levels(id) on delete cascade,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.hackathon_level_change_requests enable row level security;

create policy "hackathon_level_change_own_read" on public.hackathon_level_change_requests
  for select to authenticated using (user_id = auth.uid());

create policy "hackathon_level_change_own_insert" on public.hackathon_level_change_requests
  for insert to authenticated with check (user_id = auth.uid());

create policy "hackathon_level_change_instructor_read_all" on public.hackathon_level_change_requests
  for select to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create policy "hackathon_level_change_instructor_update" on public.hackathon_level_change_requests
  for update to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );
