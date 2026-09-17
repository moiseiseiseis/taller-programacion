-- Rutas de aprendizaje: agrupan talleres existentes en un orden secuencial
-- curado (ej. "Fundamentales"), sin tocar la tabla workshops. No bloquean
-- el acceso entre talleres, es solo un orden sugerido para mostrar al alumno.

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_active boolean not null default true,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

alter table public.learning_paths enable row level security;

create policy "learning_paths_read_all" on public.learning_paths
  for select to authenticated using (true);

create policy "learning_paths_instructor_write" on public.learning_paths
  for all to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  ) with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

create table if not exists public.learning_path_workshops (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  position integer not null,
  unique (path_id, workshop_id),
  unique (path_id, position)
);

create index if not exists learning_path_workshops_path_idx
  on public.learning_path_workshops (path_id, position);

alter table public.learning_path_workshops enable row level security;

create policy "learning_path_workshops_read_all" on public.learning_path_workshops
  for select to authenticated using (true);

create policy "learning_path_workshops_instructor_write" on public.learning_path_workshops
  for all to authenticated using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  ) with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'instructor')
  );

-- Ruta "Fundamentales": todos los talleres activos salvo Metacognición y
-- Análisis de Datos con Python (este último oculto/inconcluso, 3 de 11
-- unidades). Orden acordado con el instructor el 2026-09-16.
with new_path as (
  insert into public.learning_paths (title, description, is_active)
  values ('Fundamentales', 'Ruta base sugerida para empezar el programa, en orden.', true)
  returning id
)
insert into public.learning_path_workshops (path_id, workshop_id, position)
select new_path.id, v.workshop_id, v.position
from new_path, (values
  ('371fbe59-bab9-45f2-bfc9-226bcebb9d61'::uuid, 1), -- Fundamentos de Computación (antes de programar)
  ('81a5b632-6aec-4f14-8d42-bd76a280e774'::uuid, 2), -- Pensamiento Computacional (sin código)
  ('b72f5369-4af9-4a43-8a39-7754be9faa0a'::uuid, 3), -- Taller de Lógica — El Expediente
  ('f7160bd3-1489-49a7-bffd-0c3be34c201f'::uuid, 4), -- Taller de Python para Principiantes
  ('34d426cb-722b-4566-8a04-55a0681afd87'::uuid, 5)  -- Algoritmia para la vida cotidiana
) as v(workshop_id, position);
