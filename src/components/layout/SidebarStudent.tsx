'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TitlebarDots } from './TerminalWindow';

export default function SidebarStudent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón Hamburguesa flotante (Solo visible en pantallas pequeñas) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-brand-mint text-[#0f1a15] p-3 rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-95"
      >
        {isOpen ? (
          // Icono de X (Cerrar)
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          // Icono de Hamburguesa
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>

      {/* Fondo oscuro borroso cuando el menú está abierto en móvil (Overlay) */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Principal */}
      <aside className={`
        fixed md:relative top-0 left-0 z-40
        w-64 bg-brand-terminal text-brand-beige flex flex-col h-full md:min-h-[calc(100vh-4rem)]
        border-r border-brand-terminal-border
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-brand-terminal-border shrink-0">
          <TitlebarDots />
          <span className="font-mono text-[11px] text-[#6f6f68] ml-1">panel_alumno.sh</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 font-mono text-sm overflow-y-auto">
          <Link onClick={() => setIsOpen(false)} href="/dashboard/student" className="block px-4 py-2 rounded-md text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint transition-colors">Inicio</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/student/workshops" className="block px-4 py-2 rounded-md text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint transition-colors">Mis Talleres</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/student/progreso" className="block px-4 py-2 rounded-md text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint transition-colors">Mi Progreso</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/student/calificaciones" className="block px-4 py-2 rounded-md text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint transition-colors">Mis Calificaciones</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/student/herramientas" className="block px-4 py-2 rounded-md text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint transition-colors">Directorio de Herramientas</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/student/events" className="block px-4 py-2 rounded-md text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint transition-colors">Eventos</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/student/hackathon" className="block px-4 py-2 rounded-md text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint transition-colors">Hackathon</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/student/comunidad" className="block px-4 py-2 rounded-md text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint transition-colors">Comunidad</Link>
        </nav>
      </aside>
    </>
  )
}
