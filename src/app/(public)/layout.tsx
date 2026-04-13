'use client';

import Link from 'next/link';
import Image from 'next/image'; 
import { motion } from 'framer-motion';
import ParticlesBackground from '@/components/layout/ParticlesBackground';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-beige text-brand-dark font-serif selection:bg-brand-highlight/50 relative">
      
      {/* background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-brand-ieee)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-ieee)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03] pointer-events-none"></div>
        <ParticlesBackground />
      </div>

      {/* Navbar Flotante */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4 md:mt-6 px-4 pointer-events-none"
      >
        <div className="bg-white/80 border border-brand-steel/30 backdrop-blur-md px-4 py-3 md:px-8 md:py-3 rounded-2xl md:rounded-full flex flex-col md:flex-row items-center gap-3 md:gap-8 shadow-sm pointer-events-auto w-full md:w-auto max-w-4xl text-center md:text-left">
          <Link href="/" className="font-sans font-black text-sm sm:text-base lg:text-xl tracking-tighter text-brand-ieee hover:text-brand-salmon transition-colors">
            Taller de Programación para no Programadores
          </Link>
          <div className="hidden md:block h-4 w-[1px] bg-brand-steel/40"></div>
          <div className="flex gap-4 md:gap-6 text-xs md:text-sm font-sans font-bold text-brand-brown">
            <Link href="/" className="hover:text-brand-ieee transition-colors">Inicio</Link>
            <Link href="/blog" className="hover:text-brand-ieee transition-colors">Blog</Link>
          </div>
          <div className="hidden md:block h-4 w-[1px] bg-brand-steel/40"></div>
          <div className="flex gap-3 md:gap-4 text-xs md:text-sm font-sans font-bold items-center mt-1 md:mt-0">
            <Link href="/login" className="text-brand-dark hover:text-brand-ieee transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-brand-ieee text-white px-4 py-1.5 md:px-5 md:py-2 rounded-full hover:bg-brand-ieee/90 transition-all shadow-sm hover:shadow-md">
              Registrarse
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Contenido de las páginas */}
      {/* Aumentamos el padding-top en móvil (pt-44) por si el navbar colapsado ocupa más espacio vertical */}
      <main className="relative z-10 pt-44 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 pointer-events-none flex-grow">
        <div className="pointer-events-auto">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-white/40 backdrop-blur-md border-t border-brand-steel/20 py-8 mt-auto pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center gap-6 text-center">
          
          <p className="font-sans text-xs font-bold tracking-widest text-brand-steel uppercase">
            Con el respaldo de
          </p>

          {/* En móvil los logos se apilan o reducen su espacio */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-24 opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 duration-500">
            {/* logo udg */}
            <img 
              src="/logos/logo_udg.png" 
              alt="Universidad de Guadalajara" 
              width={180} 
              height={60} 
              className="object-contain h-20 sm:h-28 md:h-40 w-auto mix-blend-multiply"
            />
            
            {/*logo ieee*/}
            <img
              src="/logos/ieee_student_logo.jpeg" 
              alt="IEEE Student Branch" 
              width={180} 
              height={60} 
              className="object-contain h-20 sm:h-28 md:h-40 w-auto mix-blend-multiply"
            />
          </div>

          <p className="font-sans text-xs text-brand-brown/60 mt-4 px-4">
            © {new Date().getFullYear()} Learning Platform. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}