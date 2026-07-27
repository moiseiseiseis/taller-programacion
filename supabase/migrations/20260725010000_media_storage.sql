-- Bucket público para fotos y video subidos desde el panel de instructor
-- (portadas de blog/módulo, video de lecciones, imágenes insertadas en el
-- cuerpo markdown). Se sube directo desde el navegador al Storage de
-- Supabase, sin pasar por una Server Action de Next.js, para no chocar con
-- el límite de payload de Server Actions — la política RLS de escritura es
-- lo único que autoriza o rechaza la subida.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 209715200,
  array['image/png','image/jpeg','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do nothing;

create policy "media_public_read" on storage.objects
  for select to public using (bucket_id = 'media');

-- Sin scoping por carpeta a propósito (mismo criterio que el bucket
-- `resources` ya existente): cualquier instructor puede escribir en la
-- carpeta de cualquier lección/post/módulo, no solo la propia.
create policy "media_instructor_write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'media' and exists (
      select 1 from public.users u where u.id = auth.uid() and u.role in ('instructor', 'admin')
    )
  );

create policy "media_instructor_update" on storage.objects
  for update to authenticated using (
    bucket_id = 'media' and exists (
      select 1 from public.users u where u.id = auth.uid() and u.role in ('instructor', 'admin')
    )
  );

create policy "media_instructor_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'media' and exists (
      select 1 from public.users u where u.id = auth.uid() and u.role in ('instructor', 'admin')
    )
  );

alter table public.blog_posts add column if not exists cover_url text;
alter table public.modules add column if not exists cover_url text;
