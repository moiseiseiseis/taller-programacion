'use client';

import { login } from '../actions';
import Link from 'next/link';
import { motion } from 'framer-motion';
import EventTicker from '@/components/layout/EventTicker';

export default function LoginPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[75vh] px-4 sm:px-6">
      
      {/* anuncios e´picos joder */}
      <EventTicker />

      {/* login card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-brand-steel/30 p-6 sm:p-8 rounded-2xl shadow-xl mt-4"
      >
        <form className="flex flex-col gap-4 sm:gap-5">
          <div className="text-center mb-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">Iniciar Sesión</h2>
            <p className="text-xs sm:text-sm font-sans text-brand-brown mt-2">Accede a tu panel de talleres y herramientas.</p>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-sans font-bold text-brand-dark">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="border border-brand-steel/40 bg-white/50 p-2.5 sm:p-3 rounded-lg font-sans focus:outline-none focus:border-brand-ieee focus:ring-1 focus:ring-brand-ieee transition-all" 
              placeholder="tu@correo.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-sans font-bold text-brand-dark">Contraseña</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="border border-brand-steel/40 bg-white/50 p-2.5 sm:p-3 rounded-lg font-sans focus:outline-none focus:border-brand-ieee focus:ring-1 focus:ring-brand-ieee transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            formAction={login} 
            className="w-full bg-brand-ieee text-white font-sans font-bold p-3 rounded-lg hover:bg-brand-ieee/90 transition-colors shadow-md mt-2 sm:mt-4"
          >
            Entrar a la Plataforma
          </button>

          <p className="text-xs sm:text-sm text-center font-sans mt-2 text-brand-brown">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-brand-salmon font-bold hover:underline transition-all">
              Regístrate
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}