-- Amplía los kinds soportados por algorithmia_exercises para las Unidades
-- 2 (explorar/explotar) y 3 (costo de ordenar).
alter table public.algorithmia_exercises drop constraint algorithmia_exercises_kind_check;
alter table public.algorithmia_exercises add constraint algorithmia_exercises_kind_check
  check (kind = any (array['optimal_stopping', 'explore_exploit', 'sorting_cost']));
