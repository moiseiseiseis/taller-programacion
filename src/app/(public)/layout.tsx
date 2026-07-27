'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ParticlesBackground from '@/components/layout/ParticlesBackground';

const NAV_LINKS = [
  { href: '/eventos', label: 'eventos' },
  { href: '/', label: 'inicio' },
  { href: '/blog', label: 'blog' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-brand-terminal text-brand-beige font-serif selection:bg-brand-highlight/50 relative">

      {/* background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-brand-terminal-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-brand-terminal-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.25] pointer-events-none"></div>
        <ParticlesBackground />
      </div>

{/* Navbar */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-brand-terminal/95 backdrop-blur-md border-b border-brand-terminal-border"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">

          <Link href="/" className="font-mono font-bold text-sm sm:text-base text-brand-mint flex items-center gap-1 whitespace-nowrap">
            ~/futuros-programadores
            <span
              className="inline-block w-[7px] h-4 bg-brand-mint align-middle"
              style={{ animation: 'blink 1s step-end infinite' }}
            />
          </Link>

          {/* Enlaces del centro (escritorio) */}
          <div className="hidden md:flex items-center gap-6 font-mono text-sm text-[#9c9c94]">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand-mint transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Botones de acción (escritorio) */}
          <div className="hidden md:flex gap-3 md:gap-4 text-xs md:text-sm font-mono items-center shrink-0">
            <Link href="/login" className="text-[#9c9c94] hover:text-brand-mint transition-colors whitespace-nowrap">
              login
            </Link>
            <Link href="/register" className="bg-brand-mint text-[#0f1a15] font-bold px-4 py-1.5 md:px-5 md:py-2 rounded-md hover:brightness-110 transition-all whitespace-nowrap">
              registrarse
            </Link>
          </div>

          {/* Botón de hamburguesa (móvil) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden inline-flex items-center justify-center text-brand-beige hover:text-brand-mint transition-colors p-1.5 -mr-1.5"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menú desplegable (móvil) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-nav-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-brand-terminal-border"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1 font-mono text-sm">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-[#9c9c94] hover:text-brand-mint hover:bg-black/20 transition-colors px-3 py-2.5 rounded-lg"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="h-px bg-brand-terminal-border my-2" />

                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[#9c9c94] hover:text-brand-mint hover:bg-black/20 transition-colors px-3 py-2.5 rounded-lg"
                >
                  login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-brand-mint text-[#0f1a15] font-bold text-center px-3 py-2.5 rounded-lg hover:brightness-110 transition-all mt-1"
                >
                  registrarse
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Contenido de las páginas */}
      <main className="relative z-10 pt-20 md:pt-24 pb-12 md:pb-16 px-4 md:px-6 pointer-events-none flex-grow">
        <div className="pointer-events-auto">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-black/30 backdrop-blur-md border-t border-brand-terminal-border py-8 mt-auto pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center gap-6 text-center">

          <p className="font-sans text-xs font-bold tracking-widest text-[#9c9c94] uppercase">
            Con el respaldo de
          </p>

          {/* En móvil los logos se apilan o reducen su espacio */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-24 opacity-80 hover:opacity-100 transition-opacity">
            {/* logo udg */}
            <img
              src="/logos/logo_udg.png"
              alt="Universidad de Guadalajara"
              width={180}
              height={60}
              className="object-contain h-20 sm:h-28 md:h-40 w-auto"
            />

            {/*logo ieee*/}
            <img
              src="/logos/ieee_student_logo.jpeg"
              alt="IEEE Student Branch"
              width={180}
              height={60}
              className="object-contain h-20 sm:h-28 md:h-40 w-auto"
            />
          </div>

          <p className="font-sans text-xs text-[#6f6f68] mt-4 px-4">
            © {new Date().getFullYear()} Learning Platform. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}