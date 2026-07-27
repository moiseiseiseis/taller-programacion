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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-brand-terminal-panel rounded-2xl border border-brand-terminal-border overflow-hidden">

      {/* Panel Izquierdo: Instrucciones */}
      <div className="p-6 bg-black/20 border-r border-brand-terminal-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-beige">{practice.title || 'Ejercicio Práctico'}</h2>
          <span className="text-xs font-bold px-3 py-1 bg-black/30 text-[#9c9c94] rounded-full uppercase tracking-wider">
            {practice.language}
          </span>
        </div>
        <div className="prose prose-sm prose-invert text-[#9c9c94] whitespace-pre-wrap">
          {practice.instructions}
        </div>

        {/* Estado de la entrega actual */}
        <div className="mt-8 pt-6 border-t border-brand-terminal-border">
          <h3 className="text-sm font-bold text-brand-beige mb-2">Estado de tu entrega:</h3>
          {!submission ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-black/30 text-[#9c9c94]">
              Aún no has enviado código
            </span>
          ) : submission.status === 'correct' ? (
            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-mint/10 text-brand-mint border border-brand-mint/30">
                 Aprobado
              </span>
              <p className="text-xs text-brand-mint font-medium">¡Felicidades! Tu código pasó la revisión.</p>
            </div>
          ) : submission.status === 'incorrect' ? (
            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-salmon/10 text-brand-salmon border border-brand-salmon/30">
                 Requiere corrección
              </span>
              <p className="text-xs text-brand-salmon font-medium">El instructor ha rechazado tu código. Revísalo y vuelve a intentarlo.</p>
            </div>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
              ⏳ Pendiente de revisión
            </span>
          )}
        </div>
      </div>

      {/* Panel Derecho: Editor */}
      <div className="flex flex-col h-full min-h-[500px]">
        <div className="bg-black/30 px-4 py-3 flex justify-between items-center text-[#6f6f68] text-sm font-mono border-b border-brand-terminal-border">
          <span>
            main.
            {practice.language === 'python'
              ? 'py'
              : practice.language === 'javascript'
              ? 'js'
              : practice.language === 'cpp'
              ? 'cpp'
              : 'txt'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-black text-brand-mint font-mono p-6 outline-none resize-none"
            spellCheck="false"
          />

          <div className="bg-black/20 p-4 border-t border-brand-terminal-border flex justify-between items-center">
            {isSuccess ? (
              <span className="text-brand-mint font-bold text-sm animate-pulse">
                ¡Código enviado correctamente!
              </span>
            ) : (
              <span className="text-[#6f6f68] text-sm">Asegúrate de probar tu código antes de enviar.</span>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${isLoading ? 'bg-black/30 text-[#6f6f68] cursor-not-allowed' : 'bg-brand-mint text-[#0f1a15] hover:brightness-110'}`}
            >
              {isLoading ? 'Enviando...' : 'Enviar Solución'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}