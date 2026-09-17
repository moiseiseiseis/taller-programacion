'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PendingUxSurvey } from '@/lib/uxSurvey/triggers';

function surveyHref(survey: PendingUxSurvey): string {
  if (survey.momento === 'workshop_complete') {
    return `/dashboard/student/encuesta-ux/workshop_complete?taller=${survey.workshopId}`;
  }
  return `/dashboard/student/encuesta-ux/${survey.momento}`;
}

function surveyCopy(survey: PendingUxSurvey): { title: string; subtitle: string } {
  if (survey.momento === 'workshop_complete') {
    return {
      title: `¿Cómo fue tu experiencia en "${survey.workshopTitle}"?`,
      subtitle: 'Es voluntaria, no afecta tu calificación y toma menos de dos minutos.',
    };
  }
  if (survey.momento === 'path_complete') {
    return {
      title: 'Terminaste la ruta Fundamentales — contanos qué tal estuvo',
      subtitle: 'Es voluntaria, no afecta tu calificación y toma menos de dos minutos.',
    };
  }
  return {
    title: '¿Cómo fue empezar en la plataforma?',
    subtitle: 'Es voluntaria, no afecta tu calificación y toma menos de dos minutos.',
  };
}

export default function UxSurveyBanner({ survey }: { survey: PendingUxSurvey }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const { title, subtitle } = surveyCopy(survey);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-mint/10 border border-brand-mint/30 rounded-2xl px-6 py-4">
      <div>
        <p className="font-bold text-brand-beige text-sm">{title}</p>
        <p className="text-sm text-[#9c9c94] mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href={surveyHref(survey)}
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
