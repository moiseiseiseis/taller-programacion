'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import AssignmentBoard from '@/components/logic/AssignmentBoard';
import ChoiceCard from '@/components/logic/ChoiceCard';
import { checkLogicPuzzle } from '@/lib/logicPuzzle/checker';
import type { AssignmentAnswer, LogicPuzzleAnswer, LogicPuzzleData, LogicPuzzleSolution } from '@/lib/logicPuzzle/types';
import LessonReferencePicker from './LessonReferencePicker';
import { METACOG_TECHNIQUES, type AnyMetacogConfig, type AnyMetacogResponse, type MetacogKind } from '@/lib/metacog/types';

type EmbeddedPuzzle = {
  id: string;
  puzzle_data: LogicPuzzleData;
  solution: LogicPuzzleSolution;
  title: string;
  prompt: string;
};

export default function ReflectionExercise({
  kind,
  config,
  initialResponse,
  availableLessons,
  embeddedPuzzle,
  diagnosticText,
  actualQuizResult,
  onSave,
}: {
  kind: MetacogKind;
  config: AnyMetacogConfig;
  initialResponse: AnyMetacogResponse | null;
  availableLessons: { id: string; label: string }[];
  embeddedPuzzle?: EmbeddedPuzzle | null;
  diagnosticText?: string | null;
  actualQuizResult?: { score: number; maxScore: number; passed: boolean } | null;
  onSave: (response: AnyMetacogResponse, referencedLessonId: string | null) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Estado por tipo de ejercicio. Solo se usa el que corresponde a `kind`.
  const [text, setText] = useState<string>(initialResponse?.text ?? '');
  const [reflection, setReflection] = useState<string>(initialResponse?.reflection ?? '');
  const [solved, setSolved] = useState<boolean>(initialResponse?.solved ?? false);
  const [compA, setCompA] = useState<string>(initialResponse?.a ?? '');
  const [compB, setCompB] = useState<string>(initialResponse?.b ?? '');
  const [referencedLessonId, setReferencedLessonId] = useState<string | null>(
    initialResponse?.referencedLessonId ?? null
  );
  const [items, setItems] = useState<{ question: string; recalledWithoutLooking: boolean }[]>(
    initialResponse?.items ?? [{ question: '', recalledWithoutLooking: false }]
  );
  const [topic, setTopic] = useState<string>(initialResponse?.topic ?? '');
  const [intervals, setIntervals] = useState<{ dueDate: string; done: boolean }[]>(
    initialResponse?.intervals ?? [1, 2, 5, 10].map((days) => ({ dueDate: addDays(days), done: false }))
  );
  const [answers, setAnswers] = useState<Record<string, string>>(initialResponse?.answers ?? {});
  const [explanation, setExplanation] = useState<string>(initialResponse?.explanation ?? '');
  const [stuckPoint, setStuckPoint] = useState<string>(initialResponse?.stuckPoint ?? '');
  const [predictedScore, setPredictedScore] = useState<string>(
    initialResponse?.predictedScore != null ? String(initialResponse.predictedScore) : ''
  );
  const [predictedPassed, setPredictedPassed] = useState<boolean | null>(
    initialResponse?.predictedPassed ?? null
  );
  const [plan, setPlan] = useState<string>(initialResponse?.plan ?? '');
  const [techniquesUsed, setTechniquesUsed] = useState<string[]>(initialResponse?.techniquesUsed ?? []);

  // Solo para embedded_challenge: el tablero/tarjeta del acertijo real de Lógica.
  const [assignmentAnswer, setAssignmentAnswer] = useState<AssignmentAnswer>(() =>
    embeddedPuzzle && embeddedPuzzle.puzzle_data.kind === 'assignment'
      ? Object.fromEntries(embeddedPuzzle.puzzle_data.boards.map((b) => [b.id, {}]))
      : {}
  );
  const [choiceAnswer, setChoiceAnswer] = useState<string | null>(null);

  function toggleTechnique(t: string) {
    setTechniquesUsed((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function handleAssignmentToggle(boardId: string, entityId: string, optionId: string) {
    if (!embeddedPuzzle || embeddedPuzzle.puzzle_data.kind !== 'assignment') return;
    setAssignmentAnswer((prev) => {
      const board = embeddedPuzzle.puzzle_data.kind === 'assignment'
        ? embeddedPuzzle.puzzle_data.boards.find((b) => b.id === boardId)
        : undefined;
      const boardAnswer = { ...(prev[boardId] ?? {}) };
      if (board?.optionsAreUnique) {
        for (const key of Object.keys(boardAnswer)) {
          if (boardAnswer[key] === optionId) delete boardAnswer[key];
        }
      }
      if (boardAnswer[entityId] === optionId) delete boardAnswer[entityId];
      else boardAnswer[entityId] = optionId;
      return { ...prev, [boardId]: boardAnswer };
    });
  }

  function checkEmbeddedPuzzle() {
    if (!embeddedPuzzle) return;
    const answer: LogicPuzzleAnswer =
      embeddedPuzzle.puzzle_data.kind === 'assignment'
        ? { kind: 'assignment', boards: assignmentAnswer }
        : { kind: 'choice', optionId: choiceAnswer };
    const correct = checkLogicPuzzle(embeddedPuzzle.puzzle_data, embeddedPuzzle.solution, answer);
    setSolved(correct);
  }

  function buildResponse(): AnyMetacogResponse {
    switch (kind) {
      case 'diagnostic':
        return { text };
      case 'embedded_challenge':
        return { solved, reflection };
      case 'comparison':
        return { a: compA, b: compB, reflection };
      case 'applied_reference':
        return { referencedLessonId, items, reflection };
      case 'spaced_calendar':
        return { topic, referencedLessonId, intervals };
      case 'interleaved_set':
        return { answers, reflection };
      case 'elaboration':
        return { explanation, stuckPoint };
      case 'calibration':
        return {
          referencedLessonId,
          predictedScore: predictedScore === '' ? null : Number(predictedScore),
          predictedPassed,
          reflection,
        };
      case 'integration':
        return { plan, techniquesUsed };
      default:
        return {};
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = buildResponse();
      const refId =
        kind === 'applied_reference' || kind === 'spaced_calendar' || kind === 'calibration'
          ? referencedLessonId
          : null;
      await onSave(response, refId);
      setSavedAt(Date.now());
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu respuesta.');
    } finally {
      setIsSaving(false);
    }
  }

  const textareaClass =
    'w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none';
  const labelClass = 'block text-sm font-semibold text-brand-beige mb-1';

  return (
    <div className="space-y-5">
      {kind === 'diagnostic' && (
        <div>
          <label className={labelClass}>Cómo estudias ahora mismo</label>
          <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} className={textareaClass} />
        </div>
      )}

      {kind === 'embedded_challenge' && embeddedPuzzle && (
        <div className="space-y-4">
          <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-4">
            <h4 className="font-bold text-brand-beige mb-2">{embeddedPuzzle.title}</h4>
            <p className="text-sm text-[#c8c8c0] mb-4">{embeddedPuzzle.prompt}</p>
            {embeddedPuzzle.puzzle_data.kind === 'assignment' ? (
              <AssignmentBoard
                boards={embeddedPuzzle.puzzle_data.boards}
                answer={assignmentAnswer}
                onToggle={handleAssignmentToggle}
              />
            ) : (
              <ChoiceCard
                options={embeddedPuzzle.puzzle_data.options}
                selected={choiceAnswer}
                onSelect={setChoiceAnswer}
              />
            )}
            <button
              type="button"
              onClick={checkEmbeddedPuzzle}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-brand-mint text-[#0f1a15] hover:brightness-110 transition-colors"
            >
              Comprobar
            </button>
            {solved && (
              <p className="mt-2 text-sm font-bold text-brand-mint flex items-center gap-1.5">
                <Check size={14} /> Lo resolviste en modo enfocado.
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              Si te atascaste: ¿te alejaste del problema y volviste? ¿Cambió algo al volver?
            </label>
            <textarea rows={5} value={reflection} onChange={(e) => setReflection(e.target.value)} className={textareaClass} />
          </div>
        </div>
      )}

      {kind === 'comparison' && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{config?.labelA ?? 'Primer método'}</label>
            <textarea rows={4} value={compA} onChange={(e) => setCompA(e.target.value)} className={textareaClass} />
          </div>
          <div>
            <label className={labelClass}>{config?.labelB ?? 'Segundo método'}</label>
            <textarea rows={4} value={compB} onChange={(e) => setCompB(e.target.value)} className={textareaClass} />
          </div>
          <div>
            <label className={labelClass}>¿Qué diferencia notaste?</label>
            <textarea rows={4} value={reflection} onChange={(e) => setReflection(e.target.value)} className={textareaClass} />
          </div>
        </div>
      )}

      {kind === 'applied_reference' && (
        <div className="space-y-4">
          <LessonReferencePicker
            availableLessons={availableLessons}
            value={referencedLessonId}
            onChange={setReferencedLessonId}
          />
          <div className="space-y-3">
            <label className={labelClass}>Tus propias preguntas de recuperación activa</label>
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <textarea
                  rows={2}
                  value={item.question}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...next[i], question: e.target.value };
                    setItems(next);
                  }}
                  placeholder={`Pregunta ${i + 1}`}
                  className={`${textareaClass} flex-1`}
                />
                <label className="flex items-center gap-1.5 text-xs text-[#9c9c94] whitespace-nowrap pt-3">
                  <input
                    type="checkbox"
                    checked={item.recalledWithoutLooking}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = { ...next[i], recalledWithoutLooking: e.target.checked };
                      setItems(next);
                    }}
                    className="accent-brand-mint"
                  />
                  la recordé sin mirar
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems([...items, { question: '', recalledWithoutLooking: false }])}
              className="text-xs font-bold text-brand-mint hover:brightness-110"
            >
              + agregar pregunta
            </button>
          </div>
          <div>
            <label className={labelClass}>Reflexión</label>
            <textarea rows={4} value={reflection} onChange={(e) => setReflection(e.target.value)} className={textareaClass} />
          </div>
        </div>
      )}

      {kind === 'spaced_calendar' && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Tema que estás repasando</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={textareaClass}
            />
          </div>
          <LessonReferencePicker
            availableLessons={availableLessons}
            value={referencedLessonId}
            onChange={setReferencedLessonId}
          />
          <div className="space-y-2">
            <label className={labelClass}>Tu calendario de repaso</label>
            {intervals.map((interval, i) => (
              <label
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-brand-terminal-border bg-black/20 text-sm text-[#c8c8c0]"
              >
                <input
                  type="checkbox"
                  checked={interval.done}
                  onChange={(e) => {
                    const next = [...intervals];
                    next[i] = { ...next[i], done: e.target.checked };
                    setIntervals(next);
                  }}
                  className="accent-brand-mint"
                />
                {new Date(interval.dueDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
              </label>
            ))}
          </div>
        </div>
      )}

      {kind === 'interleaved_set' && (
        <div className="space-y-4">
          {(config?.items ?? []).map((item) => (
            <div key={item.id} className="bg-black/20 border border-brand-terminal-border rounded-xl p-4">
              <p className="text-sm text-brand-beige font-semibold mb-3">{item.scenario}</p>
              <div className="space-y-2">
                {item.options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer text-sm ${
                      answers[item.id] === option.id
                        ? 'border-brand-mint bg-brand-mint/10 text-brand-beige'
                        : 'border-brand-terminal-border text-[#c8c8c0] hover:border-brand-mint/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`item-${item.id}`}
                      checked={answers[item.id] === option.id}
                      onChange={() => setAnswers({ ...answers, [item.id]: option.id })}
                      className="accent-brand-mint"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className={labelClass}>¿Se sintió más difícil que practicar un solo tipo seguido? ¿Por qué crees que pasa eso?</label>
            <textarea rows={4} value={reflection} onChange={(e) => setReflection(e.target.value)} className={textareaClass} />
          </div>
        </div>
      )}

      {kind === 'elaboration' && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Explica el concepto como si la otra persona no supiera nada del tema</label>
            <textarea rows={8} value={explanation} onChange={(e) => setExplanation(e.target.value)} className={textareaClass} />
          </div>
          <div>
            <label className={labelClass}>¿En qué punto exacto te trabaste?</label>
            <textarea rows={3} value={stuckPoint} onChange={(e) => setStuckPoint(e.target.value)} className={textareaClass} />
          </div>
        </div>
      )}

      {kind === 'calibration' && (
        <div className="space-y-4">
          <LessonReferencePicker
            availableLessons={availableLessons}
            value={referencedLessonId}
            onChange={setReferencedLessonId}
            label="¿Qué examen o reto vas a predecir?"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tu predicción (puntaje)</label>
              <input
                type="number"
                value={predictedScore}
                onChange={(e) => setPredictedScore(e.target.value)}
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>¿Crees que vas a aprobar?</label>
              <div className="flex gap-3 pt-3">
                <label className="flex items-center gap-1.5 text-sm text-[#c8c8c0]">
                  <input
                    type="radio"
                    checked={predictedPassed === true}
                    onChange={() => setPredictedPassed(true)}
                    className="accent-brand-mint"
                  />
                  Sí
                </label>
                <label className="flex items-center gap-1.5 text-sm text-[#c8c8c0]">
                  <input
                    type="radio"
                    checked={predictedPassed === false}
                    onChange={() => setPredictedPassed(false)}
                    className="accent-brand-mint"
                  />
                  No
                </label>
              </div>
            </div>
          </div>
          {actualQuizResult && (
            <div className="bg-brand-terminal-panel border border-brand-terminal-border rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6f6f68] mb-1">Resultado real</p>
              <p className="text-sm text-brand-beige">
                {actualQuizResult.score} / {actualQuizResult.maxScore} — {actualQuizResult.passed ? 'Aprobado' : 'No aprobado'}
              </p>
            </div>
          )}
          <div>
            <label className={labelClass}>¿Qué tan cerca estuvo tu predicción? ¿Te sorprendió?</label>
            <textarea rows={4} value={reflection} onChange={(e) => setReflection(e.target.value)} className={textareaClass} />
          </div>
        </div>
      )}

      {kind === 'integration' && (
        <div className="space-y-4">
          {diagnosticText && (
            <div className="bg-black/20 border border-brand-terminal-border rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6f6f68] mb-1">
                Lo que describiste al empezar el taller
              </p>
              <p className="text-sm text-[#c8c8c0] whitespace-pre-wrap">{diagnosticText}</p>
            </div>
          )}
          <div>
            <label className={labelClass}>Tu plan de estudio</label>
            <textarea rows={10} value={plan} onChange={(e) => setPlan(e.target.value)} className={textareaClass} />
          </div>
          <div>
            <label className={labelClass}>Técnicas que usaste explícitamente en tu plan</label>
            <div className="flex flex-wrap gap-2">
              {METACOG_TECHNIQUES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleTechnique(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    techniquesUsed.includes(t)
                      ? 'bg-brand-mint/10 border-brand-mint text-brand-mint'
                      : 'border-brand-terminal-border text-[#9c9c94] hover:border-brand-mint/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {isSaving ? 'Guardando...' : 'Guardar respuesta'}
        </button>
        {savedAt && <span className="text-xs text-brand-mint font-bold">Guardado.</span>}
      </div>
    </div>
  );
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
