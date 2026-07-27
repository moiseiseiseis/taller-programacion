'use client'; 
import { useState } from 'react';
import { savePractice } from '../../actions';
import { useRouter } from 'next/navigation';

export default function PracticeForm({ 
  lessonId, 
  moduleId, 
  practice 
}: { 
  lessonId: string; 
  moduleId: string; 
  practice: any;
}) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Esta función intercepta el envío del formulario
  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      // Llamamos a tu Server Action original
      await savePractice(formData);
      
      // Activamos la pantalla verde de éxito
      setIsSuccess(true);
      
      // Esperamos 2 segundos y redirigimos de vuelta al módulo
      setTimeout(() => {
        router.push(`/dashboard/instructor/modulo/${moduleId}`);
      }, 2000);

    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar. Revisa la consola.');
      setIsLoading(false);
    }
  }

  // Si fue un éxito, mostramos la "leyenda" en lugar del formulario
  if (isSuccess) {
    return (
      <div className="p-8 bg-brand-mint/10 border border-brand-mint/30 rounded-2xl text-center animate-in fade-in duration-500">
        <div className="text-brand-mint mb-4 flex justify-center">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-brand-beige mb-2">¡Práctica guardada con éxito!</h3>
        <p className="text-brand-mint font-semibold">Redirigiendo de vuelta al módulo...</p>
      </div>
    );
  }

  // Si no, mostramos el formulario normal
  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="lesson_id" value={lessonId} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-brand-beige mb-1">Título del Ejercicio</label>
          <input
            type="text"
            name="title"
            defaultValue={practice?.title || ''}
            required
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-brand-beige mb-1">Lenguaje de Programación</label>
          <select
            name="language"
            defaultValue={practice?.language || ''}
            required
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
          >
            <option value="">Selecciona un lenguaje...</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-brand-beige mb-1">Instrucciones detalladas</label>
          <textarea
            name="instructions"
            defaultValue={practice?.instructions || ''}
            required
            rows={4}
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-sans"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">Código Base (Starter Code)</label>
          <textarea
            name="starter_code"
            defaultValue={practice?.starter_code || ''}
            required
            rows={8}
            className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-sm bg-black"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">Resultado Esperado (Output)</label>
          <textarea
            name="expected_output"
            defaultValue={practice?.expected_output || ''}
            required
            rows={8}
            className="w-full rounded-lg border border-brand-terminal-border px-4 py-3 text-brand-mint focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none font-mono text-sm bg-black"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-brand-terminal-border flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`py-3 px-6 rounded-lg font-bold transition-all ${isLoading ? 'bg-black/30 text-[#6f6f68] cursor-not-allowed' : 'bg-brand-mint text-[#0f1a15] hover:brightness-110'}`}
        >
          {isLoading ? 'Guardando...' : 'Guardar Ejercicio'}
        </button>
      </div>
    </form>
  );
}