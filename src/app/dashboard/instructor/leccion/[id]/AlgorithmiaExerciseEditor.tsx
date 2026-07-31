'use client';

import { useState } from 'react';
import { saveAlgorithmiaExercise, deleteAlgorithmiaExercise } from '../../actions';

type AlgorithmiaExerciseRow = {
  id: string;
  kind: string;
  title: string;
  dilemma: string;
  theory: string;
  config: unknown;
  reflection_prompt: string;
  explanation: string | null;
  hint: string | null;
};

const KIND_LABELS: Record<string, string> = {
  optimal_stopping: 'Parada óptima (problema de la secretaria)',
  explore_exploit: 'Explorar vs. explotar (bandido multi-brazo)',
  sorting_cost: 'Costo de ordenar vs. buscar',
  cache_lru: 'Caché (política LRU)',
  scheduling: 'Planificación de tareas',
  bayes: 'Predicción con regla de Bayes',
  overfitting: 'Sobreajuste (identificar y generalizar)',
  relaxation: 'Relajación de restricciones',
  randomness: 'Aleatoriedad (recocido simulado)',
  backoff: 'Retroceso exponencial (calendario de seguimiento)',
  game_theory: 'Teoría de juegos (equilibrio de Nash)',
  recursion: 'Recursión (descenso y deshacer el camino)',
  tree_search: 'Árboles (ancestro común y balance)',
  graph_search: 'Grafos (grados de separación y ruta más barata)',
  knapsack_dp: 'Programación dinámica (problema de la mochila)',
  sorting_algorithms: 'Ordenar a mano (selection sort vs. quicksort)',
  hash_table: 'Hash table (función de hash rudimentaria)',
  greedy_activity_selection: 'Selección voraz de actividades',
  knn: 'k-vecinos más cercanos',
};

const EMPTY_CONFIG: Record<string, string> = {
  optimal_stopping: `{
  "sequenceLength": 20,
  "trialsForComparison": 500,
  "earlyLookFraction": 0.1,
  "lateLookFraction": 0.7
}`,
  explore_exploit: `{
  "numArms": 4,
  "totalRounds": 15,
  "trialsForComparison": 500
}`,
  sorting_cost: `{
  "defaultItemCount": 200,
  "sortCostPerItem": 1,
  "unsortedSearchCost": 1,
  "sortedSearchCost": 1,
  "maxSearchesSlider": 60
}`,
  cache_lru: `{
  "cacheSize": 4,
  "streamLength": 20,
  "distinctItems": 7
}`,
  scheduling: `{
  "tasks": [
    { "id": "t1", "label": "Responder correos", "duration": 2, "deadline": 6 },
    { "id": "t2", "label": "Entregar reporte", "duration": 5, "deadline": 5 },
    { "id": "t3", "label": "Preparar presentación", "duration": 3, "deadline": 10 },
    { "id": "t4", "label": "Revisar pendientes chicos", "duration": 1, "deadline": 3 }
  ]
}`,
  bayes: `{
  "scenarios": [
    {
      "id": "s1",
      "description": "Una película normal dura entre 90 y 120 minutos. Ya pasaron 20.",
      "distributionType": "normal",
      "elapsed": 20,
      "averageTotal": 105,
      "unit": "minutos"
    },
    {
      "id": "s2",
      "description": "Un libro lleva 10 años en la lista de más vendidos.",
      "distributionType": "power_law",
      "elapsed": 10,
      "unit": "años"
    }
  ]
}`,
  overfitting: `{
  "examples": [
    {
      "id": "e1",
      "text": "Preparaste una respuesta memorizada palabra por palabra para \\"cuéntame de un error que hayas cometido\\", pero si te preguntan algo apenas distinto no sabes qué decir.",
      "isOverfit": true,
      "note": "Está ajustada a una sola pregunta exacta, no a la habilidad real de responder ese tipo de preguntas."
    },
    {
      "id": "e2",
      "text": "Preparaste 2-3 anécdotas reales que puedes adaptar a distintas preguntas de entrevista según lo que te pregunten.",
      "isOverfit": false,
      "note": "Es una estrategia flexible: se adapta a variaciones de la pregunta en vez de depender de una redacción exacta."
    }
  ]
}`,
  relaxation: `{
  "constraintOptions": [
    { "id": "time", "label": "Tiempo", "description": "Ignorar por un momento cuánto tardaría." },
    { "id": "money", "label": "Dinero", "description": "Ignorar por un momento cuánto costaría." },
    { "id": "certainty", "label": "Certeza / perfección", "description": "Ignorar por un momento que salga perfecto a la primera." }
  ]
}`,
  randomness: `{
  "landscape": [2, 3, 5, 8, 6, 4, 3, 2, 3, 5, 7, 9, 10, 8, 5, 3, 2, 1, 2, 4],
  "maxSteps": 10,
  "initialTemperature": 5,
  "trialsForComparison": 500
}`,
  backoff: `{
  "baseWaitDays": 2,
  "maxAttempts": 5
}`,
  game_theory: `{
  "choiceLabels": ["Cooperar", "Delatar"],
  "cells": [
    { "choiceA": 0, "choiceB": 0, "payoffA": 3, "payoffB": 3 },
    { "choiceA": 0, "choiceB": 1, "payoffA": 0, "payoffB": 5 },
    { "choiceA": 1, "choiceB": 0, "payoffA": 5, "payoffB": 0 },
    { "choiceA": 1, "choiceB": 1, "payoffA": 1, "payoffB": 1 }
  ]
}`,
  recursion: `{
  "startN": 5,
  "baseCaseN": 0,
  "baseCaseValue": 1
}`,
  tree_search: `{
  "nodes": [
    { "id": "g0", "label": "Trisabuela Rosa", "parentId": null },
    { "id": "g1a", "label": "Abuelo Jorge", "parentId": "g0" },
    { "id": "g1b", "label": "Abuela Marta", "parentId": "g0" },
    { "id": "g2a", "label": "Papá Luis", "parentId": "g1a" },
    { "id": "g2b", "label": "Tía Elena", "parentId": "g1a" },
    { "id": "g2c", "label": "Tío Raúl", "parentId": "g1b" },
    { "id": "g3a", "label": "Tú", "parentId": "g2a" },
    { "id": "g3b", "label": "Prima Sofía", "parentId": "g2b" },
    { "id": "g3c", "label": "Primo Diego", "parentId": "g2c" }
  ],
  "personAId": "g3a",
  "personBId": "g3b",
  "balancedNodeCount": 15
}`,
  graph_search: `{
  "socialNodes": [
    { "id": "you", "label": "Tú" },
    { "id": "ana", "label": "Ana" },
    { "id": "beto", "label": "Beto" },
    { "id": "carla", "label": "Carla" },
    { "id": "dario", "label": "Darío" },
    { "id": "elena", "label": "Elena" },
    { "id": "fer", "label": "Fer (organizadora del evento)" }
  ],
  "socialEdges": [
    { "from": "you", "to": "ana" },
    { "from": "you", "to": "beto" },
    { "from": "ana", "to": "carla" },
    { "from": "beto", "to": "dario" },
    { "from": "carla", "to": "elena" },
    { "from": "dario", "to": "elena" },
    { "from": "elena", "to": "fer" }
  ],
  "startPersonId": "you",
  "targetPersonId": "fer",
  "mapNodes": [
    { "id": "a", "label": "Ciudad A" },
    { "id": "b", "label": "Ciudad B" },
    { "id": "c", "label": "Ciudad C" },
    { "id": "d", "label": "Ciudad D" },
    { "id": "e", "label": "Ciudad E" }
  ],
  "mapEdges": [
    { "from": "a", "to": "b", "weight": 2 },
    { "from": "a", "to": "c", "weight": 5 },
    { "from": "b", "to": "c", "weight": 1 },
    { "from": "b", "to": "d", "weight": 6 },
    { "from": "c", "to": "d", "weight": 2 },
    { "from": "d", "to": "e", "weight": 1 },
    { "from": "c", "to": "e", "weight": 7 }
  ],
  "startCityId": "a",
  "targetCityId": "e"
}`,
  knapsack_dp: `{
  "items": [
    { "id": "i1", "label": "Excursión a la montaña", "weight": 3, "value": 8 },
    { "id": "i2", "label": "Clase de cocina local", "weight": 2, "value": 5 },
    { "id": "i3", "label": "Museo de historia", "weight": 1, "value": 3 },
    { "id": "i4", "label": "Tour gastronómico nocturno", "weight": 4, "value": 9 },
    { "id": "i5", "label": "Paseo en bicicleta por la costa", "weight": 2, "value": 4 }
  ],
  "capacity": 6
}`,
  sorting_algorithms: `{
  "list": [29, 4, 71, 15, 8, 47, 3, 22]
}`,
  hash_table: `{
  "items": [
    { "id": "p1", "key": "manzana" },
    { "id": "p2", "key": "pera" },
    { "id": "p3", "key": "uva" },
    { "id": "p4", "key": "kiwi" },
    { "id": "p5", "key": "mango" },
    { "id": "p6", "key": "limon" },
    { "id": "p7", "key": "fresa" },
    { "id": "p8", "key": "sandia" }
  ],
  "bucketCount": 5
}`,
  greedy_activity_selection: `{
  "activities": [
    { "id": "a1", "label": "Reunión de equipo", "start": 9, "end": 10 },
    { "id": "a2", "label": "Revisión de diseño", "start": 9.5, "end": 11 },
    { "id": "a3", "label": "Llamada con cliente", "start": 10, "end": 10.5 },
    { "id": "a4", "label": "Escribir propuesta", "start": 10.5, "end": 12.5 },
    { "id": "a5", "label": "Almuerzo de trabajo", "start": 12, "end": 13 },
    { "id": "a6", "label": "Entrevista", "start": 13, "end": 14 },
    { "id": "a7", "label": "Cierre del día", "start": 13.5, "end": 15 }
  ]
}`,
  knn: `{
  "featureName": "años de experiencia",
  "points": [
    { "id": "p1", "label": "Persona A", "category": "junior", "feature": 0.5 },
    { "id": "p2", "label": "Persona B", "category": "junior", "feature": 1 },
    { "id": "p3", "label": "Persona C", "category": "junior", "feature": 1.5 },
    { "id": "p4", "label": "Persona D", "category": "semi-senior", "feature": 3 },
    { "id": "p5", "label": "Persona E", "category": "semi-senior", "feature": 3.5 },
    { "id": "p6", "label": "Persona F", "category": "senior", "feature": 6 },
    { "id": "p7", "label": "Persona G", "category": "senior", "feature": 8 },
    { "id": "p8", "label": "Persona H", "category": "senior", "feature": 9 }
  ],
  "newCaseLabel": "Persona nueva",
  "newCaseFeature": 3.2,
  "k": 3
}`,
};

export default function AlgorithmiaExerciseEditor({
  lessonId,
  exercise,
}: {
  lessonId: string;
  exercise: AlgorithmiaExerciseRow | null;
}) {
  const [kind, setKind] = useState(exercise?.kind || 'optimal_stopping');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await saveAlgorithmiaExercise(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar el ejercicio.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!exercise) return;
    if (!window.confirm('¿Eliminar este ejercicio? Esta acción no se puede deshacer.')) return;
    const formData = new FormData();
    formData.append('exercise_id', exercise.id);
    formData.append('lesson_id', lessonId);
    try {
      await deleteAlgorithmiaExercise(formData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al eliminar el ejercicio.');
    }
  }

  return (
    <div className="bg-brand-terminal-panel p-8 rounded-2xl border border-brand-terminal-border space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-beige">Simulación de esta unidad</h2>
          <p className="text-[#9c9c94] text-sm">
            {exercise ? 'Esta unidad ya tiene una simulación configurada.' : 'Esta unidad todavía no tiene simulación configurada.'}
          </p>
        </div>
        {exercise && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-brand-salmon bg-brand-salmon/10 hover:bg-brand-salmon/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
          >
            Eliminar simulación
          </button>
        )}
      </div>

      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="lesson_id" value={lessonId} />
        {exercise && <input type="hidden" name="exercise_id" value={exercise.id} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Tipo de simulación</label>
            <select
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            >
              {Object.entries(KIND_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Título</label>
            <input
              type="text"
              name="title"
              defaultValue={exercise?.title || ''}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">Dilema de entrada (admite markdown)</label>
          <textarea
            name="dilemma"
            defaultValue={exercise?.dilemma || ''}
            required
            rows={3}
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">Teoría (admite markdown)</label>
          <textarea
            name="theory"
            defaultValue={exercise?.theory || ''}
            required
            rows={5}
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">Configuración de la simulación (config, JSON)</label>
          <textarea
            name="config_json"
            defaultValue={exercise ? JSON.stringify(exercise.config, null, 2) : EMPTY_CONFIG[kind]}
            rows={6}
            className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-xs bg-black"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">Pregunta de reflexión personal</label>
          <textarea
            name="reflection_prompt"
            defaultValue={exercise?.reflection_prompt || ''}
            required
            rows={2}
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">
            Explicación de cierre (opcional, admite markdown)
          </label>
          <textarea
            name="explanation"
            defaultValue={exercise?.explanation || ''}
            rows={3}
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">Pista (opcional)</label>
          <input
            type="text"
            name="hint"
            defaultValue={exercise?.hint || ''}
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isSaving ? 'Guardando...' : 'Guardar simulación'}
          </button>
        </div>
      </form>
    </div>
  );
}
