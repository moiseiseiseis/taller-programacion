-- Texto que explica por qué la respuesta correcta es correcta (y, por lo
-- tanto, por qué cualquier otra no lo es). Se muestra al alumno después de
-- comprobar, tanto si acertó como si no.
alter table public.logic_puzzles add column if not exists explanation text;
