-- Amplía los kinds soportados por algorithmia_exercises para los 4
-- enriquecimientos incorporados desde la fusión con Grokking Algorithms
-- (segunda lección dentro de las Unidades 3, 4, 5 y 6 ya existentes).
alter table public.algorithmia_exercises drop constraint algorithmia_exercises_kind_check;
alter table public.algorithmia_exercises add constraint algorithmia_exercises_kind_check
  check (kind = any (array['optimal_stopping', 'explore_exploit', 'sorting_cost', 'cache_lru', 'scheduling', 'bayes', 'overfitting', 'relaxation', 'randomness', 'backoff', 'game_theory', 'recursion', 'tree_search', 'graph_search', 'knapsack_dp', 'sorting_algorithms', 'hash_table', 'greedy_activity_selection', 'knn']));
