'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Lock, PartyPopper } from 'lucide-react';
import Terminal, { type TerminalLine } from '@/components/terminal/Terminal';
import { resolveConfirmedDelete, runLine } from '@/lib/terminal/interpreter';
import { checkValidator, type LevelValidator } from '@/lib/terminal/validator';
import { cloneFs, formatPath, type FsNode, type Path } from '@/lib/terminal/filesystem';
import { completeTerminalLevel } from '../../actions';

export type TerminalLevelData = {
  id: string;
  order_index: number;
  title: string;
  narrative: string | null;
  goal: string;
  filesystem: { tree: FsNode; initialCwd: string[] };
  validator: LevelValidator;
  hint: string | null;
};

export default function TerminalWorld({
  lessonId,
  levels,
  initiallyCompletedLevelIds,
  nextLessonId,
}: {
  lessonId: string;
  levels: TerminalLevelData[];
  initiallyCompletedLevelIds: string[];
  nextLessonId: string | null;
}) {
  const sortedLevels = useMemo(() => levels.slice().sort((a, b) => a.order_index - b.order_index), [levels]);
  const [completedIds, setCompletedIds] = useState(new Set(initiallyCompletedLevelIds));

  const firstUnsolved = sortedLevels.findIndex((l) => !completedIds.has(l.id));
  const [currentIndex, setCurrentIndex] = useState(firstUnsolved === -1 ? sortedLevels.length - 1 : firstUnsolved);

  const currentLevel = sortedLevels[currentIndex];
  const allDone = completedIds.size === sortedLevels.length;

  function handleLevelSolved(levelId: string) {
    setCompletedIds((prev) => new Set(prev).add(levelId));
  }

  return (
    <div className="space-y-6">
      {/* Progreso del mundo */}
      <div className="flex flex-wrap gap-2">
        {sortedLevels.map((level, i) => {
          const isSolved = completedIds.has(level.id);
          const isLocked = i > 0 && !completedIds.has(sortedLevels[i - 1].id) && !isSolved;
          return (
            <button
              key={level.id}
              type="button"
              disabled={isLocked}
              onClick={() => setCurrentIndex(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                i === currentIndex
                  ? 'bg-brand-mint text-[#0f1a15]'
                  : isSolved
                  ? 'bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20'
                  : isLocked
                  ? 'bg-black/30 text-[#6f6f68] cursor-not-allowed'
                  : 'bg-black/30 text-[#9c9c94] hover:bg-black/40'
              }`}
            >
              {isSolved ? <Check size={12} /> : isLocked ? <Lock size={12} /> : null}
              Nivel {i + 1}
            </button>
          );
        })}
      </div>

      {allDone ? (
        <div className="bg-brand-mint/10 border border-brand-mint/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="font-bold text-brand-mint">Completaste todos los niveles de este mundo.</p>
          {nextLessonId ? (
            <Link
              href={`/dashboard/student/leccion/${nextLessonId}`}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
            >
              Siguiente lección →
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-mint whitespace-nowrap">
              <PartyPopper size={16} /> ¡Completaste el taller!
            </span>
          )}
        </div>
      ) : (
        <LevelPlayer
          key={currentLevel.id}
          lessonId={lessonId}
          level={currentLevel}
          isSolved={completedIds.has(currentLevel.id)}
          onSolved={() => handleLevelSolved(currentLevel.id)}
        />
      )}
    </div>
  );
}

function LevelPlayer({
  lessonId,
  level,
  isSolved,
  onSolved,
}: {
  lessonId: string;
  level: TerminalLevelData;
  isSolved: boolean;
  onSolved: () => void;
}) {
  const [root, setRoot] = useState<FsNode>(() => cloneFs(level.filesystem.tree));
  const [cwd, setCwd] = useState<Path>(level.filesystem.initialCwd);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [solved, setSolved] = useState(isSolved);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<{ path: Path; name: string } | null>(null);

  const homePath = level.filesystem.initialCwd;
  const prompt = `pip@raiz:${formatPath(cwd)}$`;

  // Se llama después de cada acción (comando o respuesta s/n a una confirmación).
  // Como se revisa cada vez, un validador que solo mira "lo que acaba de pasar"
  // alcanza para detectar el acierto en el momento exacto en que ocurre.
  async function markSolvedIfValid(historyForCheck: Parameters<typeof checkValidator>[1], checkCwd: Path, checkRoot: FsNode) {
    if (solved) return;
    if (!checkValidator(level.validator, historyForCheck, checkCwd, checkRoot)) return;

    setSolved(true);
    setIsSaving(true);
    try {
      await completeTerminalLevel(level.id, lessonId);
    } catch {
      // El progreso visual ya se marcó; si falla el guardado, no bloqueamos al alumno.
    } finally {
      setIsSaving(false);
    }
    onSolved();
  }

  async function handleSubmit(raw: string) {
    // Si hay un rm -i esperando respuesta, esta línea es la respuesta, no un comando nuevo.
    if (pendingConfirm) {
      const answer = raw.trim().toLowerCase();
      const confirmed = ['s', 'si', 'sí', 'y', 'yes'].includes(answer);
      const newRoot = confirmed ? resolveConfirmedDelete(root, pendingConfirm) : root;

      setLines((prev) => [
        ...prev,
        { prompt, command: raw, output: confirmed ? `'${pendingConfirm.name}' eliminado.` : 'Cancelado.', isError: false },
      ]);
      setPendingConfirm(null);

      if (confirmed) {
        setRoot(newRoot);
        await markSolvedIfValid(
          [{ command: 'rm', flags: ['-i'], args: [], output: '', isError: false, cwd, root: newRoot, confirm: null }],
          cwd,
          newRoot
        );
      }
      return;
    }

    const result = runLine(root, cwd, homePath, raw);

    if (result.output === '__CLEAR__') {
      setLines([]);
      return;
    }

    const newLine: TerminalLine = { prompt, command: raw, output: result.output, isError: result.isError };
    setLines((prev) => [...prev, newLine]);
    setCwd(result.cwd);
    setRoot(result.root);

    if (result.confirm) {
      setPendingConfirm(result.confirm);
      return;
    }

    await markSolvedIfValid([result], result.cwd, result.root);
  }

  return (
    <div className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-brand-beige">{level.title}</h3>
        {level.narrative && <p className="text-sm text-[#9c9c94] mt-1 italic">{level.narrative}</p>}
        <p className="text-sm text-brand-beige font-semibold mt-2">Objetivo: {level.goal}</p>
      </div>

      <Terminal lines={lines} currentPrompt={prompt} onSubmit={handleSubmit} disabled={solved} />

      {solved && (
        <div className="flex items-center gap-2 text-brand-mint text-sm font-bold">
          <Check size={16} /> {isSaving ? 'Guardando...' : 'Nivel resuelto. Elige el siguiente arriba.'}
        </div>
      )}

      {level.hint && !solved && (
        <details className="text-xs text-[#6f6f68]">
          <summary className="cursor-pointer font-bold hover:text-brand-mint">Pista</summary>
          <p className="mt-1">{level.hint}</p>
        </details>
      )}
    </div>
  );
}
