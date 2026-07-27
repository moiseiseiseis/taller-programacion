'use client';

import { updatePassword } from '../actions';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import EventTicker from '@/components/layout/EventTicker';
import TerminalWindow from '@/components/layout/TerminalWindow';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[75vh] px-4 sm:px-6">

      <EventTicker />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mt-4 shadow-2xl"
      >
        <TerminalWindow label="new-password.sh">
          <form className="flex flex-col gap-4 sm:gap-5 px-6 sm:px-8 py-8 sm:py-10">
            <div className="text-center mb-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-beige">Nueva Contraseña</h2>
              <p className="text-xs sm:text-sm font-sans text-[#9c9c94] mt-2">Define tu nueva contraseña para continuar.</p>
            </div>

            {error && <p className="text-sm font-sans text-brand-salmon text-center">{error}</p>}
            {message && <p className="text-sm font-sans text-brand-mint text-center">{message}</p>}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-sans font-bold text-brand-beige">Nueva contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="border border-brand-terminal-border bg-black/30 text-brand-beige p-2.5 sm:p-3 rounded-lg font-sans focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all placeholder:text-[#6f6f68]"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-sans font-bold text-brand-beige">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="border border-brand-terminal-border bg-black/30 text-brand-beige p-2.5 sm:p-3 rounded-lg font-sans focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all placeholder:text-[#6f6f68]"
                placeholder="••••••••"
              />
            </div>

            <button
              formAction={updatePassword}
              className="w-full bg-brand-mint text-[#0f1a15] font-sans font-bold p-3 rounded-lg hover:brightness-110 transition-all mt-2 sm:mt-4"
            >
              Guardar Contraseña
            </button>
          </form>
        </TerminalWindow>
      </motion.div>
    </div>
  );
}
