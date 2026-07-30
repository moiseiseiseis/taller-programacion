'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AnxietySurveyBanner({ momento }: { momento: 'T0' | 'T1' }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-mint/10 border border-brand-mint/30 rounded-2xl px-6 py-4">
      <div>
        <p className="font-bold text-brand-beige text-sm">Encuesta corta de investigación educativa</p>
        <p className="text-sm text-[#9c9c94] mt-1">
          Es voluntaria, no afecta tu calificación y toma un par de minutos. Nos ayuda a mejorar el taller.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href={`/dashboard/student/encuesta/${momento}`}
          className="py-2 px-5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 transition-all whitespace-nowrap"
        >
          Responder encuesta
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-sm font-semibold text-[#9c9c94] hover:text-brand-beige transition-colors whitespace-nowrap"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
