'use client';

import MarkdownContent from '@/components/lessons/MarkdownContent';
import OptimalStoppingSim, { type StoppingSimResult } from '@/components/algorithmia/OptimalStoppingSim';
import ExploreExploitSim, { type BanditSimResult } from '@/components/algorithmia/ExploreExploitSim';
import SortingCostSim, { type SortingSimResult } from '@/components/algorithmia/SortingCostSim';
import CacheLruSim, { type CacheSimResult } from '@/components/algorithmia/CacheLruSim';
import SchedulingSim, { type SchedulingSimResult } from '@/components/algorithmia/SchedulingSim';
import BayesSim, { type BayesSimResult } from '@/components/algorithmia/BayesSim';
import OverfittingSim, { type OverfitSimResult } from '@/components/algorithmia/OverfittingSim';
import RelaxationSim, { type RelaxationSimResult } from '@/components/algorithmia/RelaxationSim';
import RandomnessSim, { type RandomnessSimResult } from '@/components/algorithmia/RandomnessSim';
import BackoffSim, { type BackoffSimResult } from '@/components/algorithmia/BackoffSim';
import GameTheorySim, { type GameTheorySimResult } from '@/components/algorithmia/GameTheorySim';
import RecursionSim, { type RecursionSimResult } from '@/components/algorithmia/RecursionSim';
import TreeSim, { type TreeSimResult } from '@/components/algorithmia/TreeSim';
import GraphSim, { type GraphSimResult } from '@/components/algorithmia/GraphSim';
import KnapsackSim, { type KnapsackSimResult } from '@/components/algorithmia/KnapsackSim';
import SortingAlgorithmsSim, { type SortingAlgorithmsSimResult } from '@/components/algorithmia/SortingAlgorithmsSim';
import HashTableSim, { type HashTableSimResult } from '@/components/algorithmia/HashTableSim';
import GreedySchedulingSim, { type GreedySchedulingSimResult } from '@/components/algorithmia/GreedySchedulingSim';
import KnnSim, { type KnnSimResult } from '@/components/algorithmia/KnnSim';
import type { SchedulingConfig } from '@/lib/algorithmia/scheduling';
import type { BayesConfig } from '@/lib/algorithmia/bayesPrediction';
import type { OverfitConfig } from '@/lib/algorithmia/overfitting';
import type { RelaxationConfig } from '@/lib/algorithmia/relaxation';
import type { LandscapeConfig } from '@/lib/algorithmia/randomness';
import type { BackoffConfig } from '@/lib/algorithmia/backoff';
import type { GameConfig } from '@/lib/algorithmia/gameTheory';
import type { RecursionConfig } from '@/lib/algorithmia/recursion';
import type { TreeConfig } from '@/lib/algorithmia/tree';
import type { GraphConfig } from '@/lib/algorithmia/graph';
import type { KnapsackConfig } from '@/lib/algorithmia/knapsack';
import type { SortingAlgorithmsConfig } from '@/lib/algorithmia/sortingAlgorithms';
import type { HashTableConfig } from '@/lib/algorithmia/hashTable';
import type { GreedyActivityConfig } from '@/lib/algorithmia/greedyScheduling';
import type { KnnConfig } from '@/lib/algorithmia/knn';
import { saveAlgorithmiaSubmission } from '../../actions';

export type AlgorithmiaExerciseData = {
  id: string;
  kind: string;
  title: string;
  dilemma: string;
  theory: string;
  config: Record<string, unknown>;
  reflection_prompt: string;
  explanation: string | null;
  hint: string | null;
};

export default function AlgorithmiaWorld({
  lessonId,
  exercise,
  initialSubmission,
}: {
  lessonId: string;
  exercise: AlgorithmiaExerciseData;
  initialSubmission: { sim_result: unknown; reflection_response: string | null } | null;
}) {
  async function handleSave(simResult: unknown, reflectionResponse: string) {
    await saveAlgorithmiaSubmission(exercise.id, lessonId, simResult, reflectionResponse);
  }

  return (
    <div className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 md:p-8 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-brand-beige">{exercise.title}</h3>
        <div className="text-sm text-[#9c9c94] mt-2">
          <MarkdownContent content={exercise.dilemma} />
        </div>
      </div>

      <div className="border-t border-brand-terminal-border pt-6">
        <MarkdownContent content={exercise.theory} />
      </div>

      {exercise.kind === 'optimal_stopping' ? (
        <OptimalStoppingSim
          config={exercise.config}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as StoppingSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'explore_exploit' ? (
        <ExploreExploitSim
          config={exercise.config}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as BanditSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'sorting_cost' ? (
        <SortingCostSim
          config={exercise.config}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as SortingSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'cache_lru' ? (
        <CacheLruSim
          config={exercise.config}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as CacheSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'scheduling' ? (
        <SchedulingSim
          config={exercise.config as Partial<SchedulingConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as SchedulingSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'bayes' ? (
        <BayesSim
          config={exercise.config as Partial<BayesConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as BayesSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'overfitting' ? (
        <OverfittingSim
          config={exercise.config as Partial<OverfitConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as OverfitSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'relaxation' ? (
        <RelaxationSim
          config={exercise.config as Partial<RelaxationConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as RelaxationSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'randomness' ? (
        <RandomnessSim
          config={exercise.config as Partial<LandscapeConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as RandomnessSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'backoff' ? (
        <BackoffSim
          config={exercise.config as Partial<BackoffConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as BackoffSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'game_theory' ? (
        <GameTheorySim
          config={exercise.config as Partial<GameConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as GameTheorySimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'recursion' ? (
        <RecursionSim
          config={exercise.config as Partial<RecursionConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as RecursionSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'tree_search' ? (
        <TreeSim
          config={exercise.config as Partial<TreeConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as TreeSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'graph_search' ? (
        <GraphSim
          config={exercise.config as Partial<GraphConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as GraphSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'knapsack_dp' ? (
        <KnapsackSim
          config={exercise.config as Partial<KnapsackConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as KnapsackSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'sorting_algorithms' ? (
        <SortingAlgorithmsSim
          config={exercise.config as Partial<SortingAlgorithmsConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as SortingAlgorithmsSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'hash_table' ? (
        <HashTableSim
          config={exercise.config as Partial<HashTableConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as HashTableSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'greedy_activity_selection' ? (
        <GreedySchedulingSim
          config={exercise.config as Partial<GreedyActivityConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as GreedySchedulingSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : exercise.kind === 'knn' ? (
        <KnnSim
          config={exercise.config as Partial<KnnConfig>}
          reflectionPrompt={exercise.reflection_prompt}
          explanation={exercise.explanation}
          initialSubmission={
            initialSubmission
              ? {
                  simResult: (initialSubmission.sim_result as KnnSimResult) ?? null,
                  reflectionResponse: initialSubmission.reflection_response,
                }
              : null
          }
          onSave={handleSave}
        />
      ) : (
        <div className="bg-black/20 border border-dashed border-brand-terminal-border rounded-xl p-6 text-center">
          <p className="text-[#9c9c94] text-sm">Este tipo de simulación todavía no está implementado.</p>
        </div>
      )}

      {exercise.hint && (
        <details className="text-xs text-[#6f6f68]">
          <summary className="cursor-pointer font-bold hover:text-brand-mint">Pista</summary>
          <p className="mt-1">{exercise.hint}</p>
        </details>
      )}
    </div>
  );
}
