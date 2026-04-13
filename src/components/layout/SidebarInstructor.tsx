'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SidebarInstructor() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón Hamburguesa flotante (Solo visible en pantallas pequeñas) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-brand-dark text-brand-beige p-3 rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-95"
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
          className="md:hidden fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-30 transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Principal */}
      <aside className={`
        fixed md:relative top-0 left-0 z-40
        w-64 bg-brand-dark text-brand-beige flex flex-col h-full md:min-h-[calc(100vh-4rem)]
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <nav className="flex-1 py-6 px-4 space-y-2 font-sans overflow-y-auto">
          <div className="text-brand-salmon text-xs font-bold uppercase tracking-wider mb-4 px-4">Panel de Instructor</div>
          
          {/* A cada Link le agregué onClick={() => setIsOpen(false)} para que el menú se cierre al navegar en móvil */}
          <Link onClick={() => setIsOpen(false)} href="/dashboard/instructor" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Inicio</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/instructor/workshops" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Gestión de Talleres</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/instructor/students" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Alumnos Inscritos</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/instructor/revisiones" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Entregas Pendientes</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/instructor/herramientas" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Inventario de Herramientas</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/student/comunidad" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Comunidad</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/student/events" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Eventos (vista alumnos)</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/instructor/events/nuevo" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Eventos (crear)</Link>
          <Link onClick={() => setIsOpen(false)} href="/dashboard/instructor/events" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Eventos (detalles) </Link>
        </nav>
      </aside>
    </>
  )
}