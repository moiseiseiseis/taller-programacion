'use client';

import { useState } from 'react';
import { submitCode } from '../../actions';
import { useRouter } from 'next/navigation';

export default function StudentCodeEditor({ practice, submission }: { practice: any, submission: any }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Si el alumno ya tenía código guardado, lo mostramos. Si no, mostramos el código base.
  const [code, setCode] = useState(submission?.code || practice.starter_code || '');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('practice_id', practice.id);
    formData.append('code', code);

    try {
      await submitCode(formData);
      setIsSuccess(true);
      
      // Ocultamos el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false);
        router.refresh(); // Refrescamos los datos del servidor
      }, 3000);
    } catch (error) {
      alert('Hubo un error al enviar tu código.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      
      {/* Panel Izquierdo: Instrucciones */}
      <div className="p-6 bg-zinc-50 border-r border-zinc-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900">{practice.title || 'Ejercicio Práctico'}</h2>
          <span className="text-xs font-bold px-3 py-1 bg-zinc-200 text-zinc-700 rounded-full uppercase tracking-wider">
            {practice.language}
          </span>
        </div>
        <div className="prose prose-sm text-zinc-700 whitespace-pre-wrap">
          {practice.instructions}
        </div>
        
        {/* Estado de la entrega actual */}
        <div className="mt-8 pt-6 border-t border-zinc-200">
          <h3 className="text-sm font-bold text-zinc-900 mb-2">Estado de tu entrega:</h3>
          {!submission ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-zinc-200 text-zinc-600">
              Aún no has enviado código
            </span>
          ) : submission.status === 'correct' ? (
            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                 Aprobado
              </span>
              <p className="text-xs text-green-700 font-medium">¡Felicidades! Tu código pasó la revisión.</p>
            </div>
          ) : submission.status === 'incorrect' ? (
            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
                 Requiere corrección
              </span>
              <p className="text-xs text-red-700 font-medium">El instructor ha rechazado tu código. Revísalo y vuelve a intentarlo.</p>
            </div>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
              ⏳ Pendiente de revisión
            </span>
          )}
        </div>
      </div>

      {/* Panel Derecho: Editor */}
      <div className="flex flex-col h-full min-h-[500px]">
        <div className="bg-zinc-900 px-4 py-3 flex justify-between items-center text-zinc-400 text-sm font-mono border-b border-zinc-800">
          <span>main.{practice.language === 'python' ? 'py' : practice.language === 'javascript' ? 'js' : 'cpp'}</span>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-zinc-950 text-emerald-400 font-mono p-6 outline-none resize-none"
            spellCheck="false"
          />
          
          <div className="bg-white p-4 border-t border-zinc-200 flex justify-between items-center">
            {isSuccess ? (
              <span className="text-green-600 font-bold text-sm animate-pulse">
                ¡Código enviado correctamente!
              </span>
            ) : (
              <span className="text-zinc-400 text-sm">Asegúrate de probar tu código antes de enviar.</span>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-colors ${isLoading ? 'bg-zinc-400 cursor-not-allowed' : 'bg-black hover:bg-zinc-800'}`}
            >
              {isLoading ? 'Enviando...' : 'Enviar Solución'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}