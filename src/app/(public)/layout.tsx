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
        {/* Cambiamos max-w-4xl por max-w-max y ajustamos los breakpoints a lg para que no se aplaste en tablets */}
        <div className="bg-white/80 border border-brand-steel/30 backdrop-blur-md px-4 py-3 lg:px-6 lg:py-3 rounded-2xl lg:rounded-full flex flex-col lg:flex-row items-center gap-3 lg:gap-6 shadow-sm pointer-events-auto w-full md:w-auto max-w-max text-center lg:text-left">
          
          {/* Añadimos lg:whitespace-nowrap para que el título NUNCA se parta en dos líneas en PC */}
          <Link href="/" className="font-sans font-black text-sm sm:text-base lg:text-lg tracking-tighter text-brand-ieee hover:text-brand-salmon transition-colors lg:whitespace-nowrap">
            Programación Para Futuros Programadores
          </Link>
          
          <div className="hidden lg:block h-4 w-[1px] bg-brand-steel/40"></div>
          
          {/* Agrupamos los enlaces del centro para mejor distribución */}
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm font-sans font-bold text-brand-brown">
            <Link 
              href="/eventos" 
              className="relative group flex items-center gap-1.5 px-3 py-2 rounded-full overflow-hidden font-bold shrink-0"
            >
              <span className="absolute inset-0 bg-brand-salmon/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 rounded-full"></span>
              <span className="relative z-10 flex items-center gap-1 text-brand-salmon group-hover:text-brand-dark transition-colors">
                <span className="animate-pulse"></span> Eventos
              </span>
            </Link>
            <Link href="/" className="hover:text-brand-ieee transition-colors px-2">Inicio</Link>
            <Link href="/blog" className="hover:text-brand-ieee transition-colors px-2">Blog</Link>
          </div>

          <div className="hidden lg:block h-4 w-[1px] bg-brand-steel/40"></div>
          
          {/* Botones de acción con whitespace-nowrap para que no se deformen */}
          <div className="flex gap-3 md:gap-4 text-xs md:text-sm font-sans font-bold items-center mt-1 lg:mt-0 shrink-0">
            <Link href="/login" className="text-brand-dark hover:text-brand-ieee transition-colors whitespace-nowrap">
              Login
            </Link>
            <Link href="/register" className="bg-brand-ieee text-white px-4 py-1.5 md:px-5 md:py-2 rounded-full hover:bg-brand-ieee/90 transition-all shadow-sm hover:shadow-md whitespace-nowrap">
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