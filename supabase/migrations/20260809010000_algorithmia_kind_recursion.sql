-- Amplía los kinds soportados por algorithmia_exercises para la nueva
-- Unidad 12 (Recursión), primera de las 4 unidades nuevas incorporadas
-- desde la fusión con Grokking Algorithms.
alter table public.algorithmia_exercises drop constraint algorithmia_exercises_kind_check;
alter table public.algorithmia_exercises add constraint algorithmia_exercises_kind_check
  check (kind = any (array['optimal_stopping', 'explore_exploit', 'sorting_cost', 'cache_lru', 'scheduling', 'bayes', 'overfitting', 'relaxation', 'randomness', 'backoff', 'game_theory', 'recursion']));
