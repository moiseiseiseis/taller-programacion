-- El check constraint de lessons.type vive directo en la base (no estaba
-- capturado en ninguna migración previa) y solo permitía
-- theory/practice/challenge/terminal/python. Le agregamos 'logic' para el
-- nuevo tipo de lección de acertijos del Taller de Lógica.
alter table public.lessons drop constraint if exists lessons_type_check;

alter table public.lessons
  add constraint lessons_type_check
  check (type = any (array['theory'::text, 'practice'::text, 'challenge'::text, 'terminal'::text, 'python'::text, 'logic'::text]));
