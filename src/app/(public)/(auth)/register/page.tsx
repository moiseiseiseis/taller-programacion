'use client';

import { signup } from '../actions'
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import EventTicker from '@/components/layout/EventTicker';
import TerminalWindow from '@/components/layout/TerminalWindow';
import SubmitButton from '@/components/ui/SubmitButton';

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[75vh] px-4 sm:px-6">

      {/*  bandera de anuncios */}
      <EventTicker />

      {/* card de registro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mt-4 shadow-2xl"
      >
        <TerminalWindow label="signup.sh">
          <form className="flex flex-col gap-5 px-6 sm:px-8 py-8 sm:py-10">
            <div className="text-center mb-2">
              <h2 className="text-3xl font-serif font-bold text-brand-beige">Crear Cuenta</h2>
              <p className="text-sm font-sans text-[#9c9c94] mt-2">Únete a nuestra comunidad y accede a todos nuestros recursos.</p>
            </div>

            {error && <p className="text-sm font-sans text-brand-salmon text-center">{error}</p>}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-sans font-bold text-brand-beige">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-lg font-sans focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all placeholder:text-[#6f6f68]"
                placeholder="tu@correo.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-sans font-bold text-brand-beige">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="border border-brand-terminal-border bg-black/30 text-brand-beige p-3 rounded-lg font-sans focus:outline-none focus:border-brand-mint focus:ring-1 focus:ring-brand-mint transition-all placeholder:text-[#6f6f68]"
                placeholder="••••••••"
              />
            </div>

            <SubmitButton
              formAction={signup}
              pendingText="Creando cuenta"
              className="w-full bg-brand-mint text-[#0f1a15] font-sans font-bold p-3 rounded-lg hover:brightness-110 mt-4"
            >
              Entrar a la Plataforma
            </SubmitButton>

            <p className="text-sm text-center font-sans mt-2 text-[#9c9c94]">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-brand-mint font-bold hover:text-brand-salmon transition-colors">
                Inicia sesión
              </Link>
            </p>
          </form>
        </TerminalWindow>
      </motion.div>
    </div>
  );
}
