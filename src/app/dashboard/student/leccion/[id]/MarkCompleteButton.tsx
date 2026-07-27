'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markLessonComplete } from '../../actions';

export default function MarkCompleteButton({
  lessonId,
  nextLessonId,
  workshopId,
}: {
  lessonId: string;
  nextLessonId: string | null;
  workshopId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setIsLoading(true);
    try {
      await markLessonComplete(lessonId);
      router.push(nextLessonId ? `/dashboard/student/leccion/${nextLessonId}` : `/dashboard/student/taller/${workshopId}`);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hubo un error al guardar tu progreso.');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-bold text-[#0f1a15] bg-brand-mint hover:brightness-110 disabled:opacity-50 transition-all"
      >
        {isLoading ? 'Guardando...' : nextLessonId ? 'Marcar como completada y continuar →' : 'Marcar como completada'}
      </button>
    </div>
  );
}
