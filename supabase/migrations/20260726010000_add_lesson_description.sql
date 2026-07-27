-- "Abstract" corto de cada lección (equivalente al description que ya tiene
-- workshops), editable desde el panel del instructor junto con título/tipo.
alter table public.lessons add column if not exists description text;
