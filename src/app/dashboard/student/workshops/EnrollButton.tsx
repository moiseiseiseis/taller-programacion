'use client';

import { useState } from 'react';
import { enrollInWorkshop } from './actions';
import { useRouter } from 'next/navigation';

export default function EnrollButton({ workshopId, isEnrolled }: { workshopId: string, isEnrolled: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAction = async () => {
    setIsLoading(true);
    
    if (isEnrolled) {
      // Si ya está inscrito, solo lo navegamos al taller sin ir a la base de datos
      router.push(`/dashboard/student/taller/${workshopId}`);
    } else {
      // Si es nuevo, disparamos la acción del servidor
      try {
        await enrollInWorkshop(workshopId);
      } catch (error) {
        alert("Hubo un error al inscribirte. Intenta de nuevo.");
        setIsLoading(false);
      }
    }
  };

  return (
    <button 
      onClick={handleAction}
      disabled={isLoading}
      className={`w-full py-2 rounded font-mono font-bold transition-colors ${
        isEnrolled
          ? 'bg-black/30 text-[#9c9c94] hover:bg-black/40 border border-brand-terminal-border'
          : 'bg-brand-mint text-[#0f1a15] hover:brightness-110'
      } disabled:opacity-50`}
    >
      {isLoading ? 'Cargando...' : isEnrolled ? 'Continuar Taller →' : 'Inscribirme'}
    </button>
  );
}