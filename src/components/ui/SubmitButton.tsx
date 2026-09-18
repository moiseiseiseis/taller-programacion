'use client';

import { useFormStatus } from 'react-dom';
import Spinner from './Spinner';

// Botón de submit con feedback visual mientras la Server Action está en
// vuelo (login, signup, etc. tardan un par de segundos en pegarle a
// Supabase). useFormStatus solo funciona si este componente se renderiza
// DENTRO del <form> — no en el mismo componente que lo define.
export default function SubmitButton({
  children,
  pendingText = 'Procesando',
  formAction,
  className = '',
}: {
  children: React.ReactNode;
  pendingText?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      formAction={formAction}
      disabled={pending}
      aria-busy={pending}
      className={`flex items-center justify-center gap-2.5 transition-all disabled:cursor-not-allowed disabled:brightness-90 ${className}`}
    >
      {pending ? (
        <>
          <Spinner size={16} />
          <span className="font-mono">
            {pendingText}
            <span className="animate-blink">_</span>
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
