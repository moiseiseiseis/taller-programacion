-- Tabla de posts del blog público
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_markdown text not null,
  category text,
  is_published boolean not null default false,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

-- Cualquiera (incluso sin sesión) puede leer posts publicados
create policy "blog_posts_public_read"
  on public.blog_posts
  for select
  using (is_published = true);

-- Los instructores autenticados pueden leer todo, incluidos borradores
create policy "blog_posts_instructor_read_all"
  on public.blog_posts
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'instructor'
    )
  );

-- Solo instructores pueden crear posts
create policy "blog_posts_instructor_insert"
  on public.blog_posts
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'instructor'
    )
  );

-- Solo instructores pueden editar posts
create policy "blog_posts_instructor_update"
  on public.blog_posts
  for update
  to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'instructor'
    )
  );

-- Solo instructores pueden borrar posts
create policy "blog_posts_instructor_delete"
  on public.blog_posts
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'instructor'
    )
  );
