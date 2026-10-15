'use client';

import { useEffect, useRef, useState } from 'react';
import { startStudySession, heartbeatStudySession, endStudySession } from '@/lib/studySessions/actions';

const HEARTBEAT_INTERVAL_MS = 30_000;

function formatElapsed(startedAt: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function StudySessionButton({
  workshopId,
  initialSession,
}: {
  workshopId: string;
  initialSession: { id: string; startedAt: string } | null;
}) {
  const [session, setSession] = useState(initialSession);
  const [pending, setPending] = useState(false);
  const [elapsedLabel, setElapsedLabel] = useState(initialSession ? formatElapsed(initialSession.startedAt) : '00:00');
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!session) return;

    tickRef.current = setInterval(() => setElapsedLabel(formatElapsed(session.startedAt)), 1000);

    heartbeatRef.current = setInterval(async () => {
      // Solo mandamos heartbeat con la pestaña visible — si el alumno la deja
      // en segundo plano o se va, el servidor cierra la sesión sola tras el
      // tiempo de inactividad, sin que esto la mantenga viva artificialmente.
      if (document.visibilityState !== 'visible') return;
      const { ok } = await heartbeatStudySession(session.id);
      if (!ok) setSession(null); // el servidor ya la cerró (timeout); refleja eso aquí
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [session]);

  async function handleStart() {
    setPending(true);
    try {
      const started = await startStudySession(workshopId);
      setSession(started);
    } finally {
      setPending(false);
    }
  }

  async function handleEnd() {
    if (!session) return;
    setPending(true);
    try {
      await endStudySession(session.id);
    } finally {
      setSession(null);
      setPending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-[260px]">
      <div className="bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl shadow-xl p-4 space-y-2">
        <p className="text-[11px] font-mono text-[#9c9c94] leading-snug">
          Piloto: ayúdanos registrando cuánto tiempo le dedicas a este taller.
        </p>
        {session ? (
          <>
            <p className="text-center font-mono text-lg font-bold text-brand-mint">{elapsedLabel}</p>
            <button
              onClick={handleEnd}
              disabled={pending}
              className="w-full bg-brand-salmon text-white font-sans font-bold text-sm py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-60"
            >
              Finalizar sesión de estudio
            </button>
          </>
        ) : (
          <button
            onClick={handleStart}
            disabled={pending}
            className="w-full bg-brand-mint text-[#0f1a15] font-sans font-bold text-sm py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-60"
          >
            Iniciar sesión de estudio
          </button>
        )}
      </div>
    </div>
  );
}
