-- Amplía los kinds soportados por algorithmia_exercises para las Unidades
-- 6 (regla de Bayes) y 7 (sobreajuste).
alter table public.algorithmia_exercises drop constraint algorithmia_exercises_kind_check;
alter table public.algorithmia_exercises add constraint algorithmia_exercises_kind_check
  check (kind = any (array['optimal_stopping', 'explore_exploit', 'sorting_cost', 'cache_lru', 'scheduling', 'bayes', 'overfitting']));
