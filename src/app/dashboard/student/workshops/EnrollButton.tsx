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
      className={`w-full py-2 rounded font-sans font-bold transition-colors ${
        isEnrolled 
          ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200' 
          : 'bg-brand-mint text-brand-brown hover:bg-brand-mint/80'
      } disabled:opacity-50`}
    >
      {isLoading ? 'Cargando...' : isEnrolled ? 'Continuar Taller →' : 'Inscribirme'}
    </button>
  );
}