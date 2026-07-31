-- Amplía los kinds soportados por algorithmia_exercises para las Unidades
-- 10 (retroceso exponencial) y 11 (teoría de juegos).
alter table public.algorithmia_exercises drop constraint algorithmia_exercises_kind_check;
alter table public.algorithmia_exercises add constraint algorithmia_exercises_kind_check
  check (kind = any (array['optimal_stopping', 'explore_exploit', 'sorting_cost', 'cache_lru', 'scheduling', 'bayes', 'overfitting', 'relaxation', 'randomness', 'backoff', 'game_theory']));
