-- Amplía los kinds soportados por algorithmia_exercises para las Unidades
-- 13 (Árboles), 14 (Grafos) y 15 (Programación dinámica), incorporadas
-- desde la fusión con Grokking Algorithms.
alter table public.algorithmia_exercises drop constraint algorithmia_exercises_kind_check;
alter table public.algorithmia_exercises add constraint algorithmia_exercises_kind_check
  check (kind = any (array['optimal_stopping', 'explore_exploit', 'sorting_cost', 'cache_lru', 'scheduling', 'bayes', 'overfitting', 'relaxation', 'randomness', 'backoff', 'game_theory', 'recursion', 'tree_search', 'graph_search', 'knapsack_dp']));
