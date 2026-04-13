import { signOut } from '@/app//(public)/(auth)/actions'

export default function Navbar() {
  return (
    <header className="bg-white border-b border-brand-steel/30 min-h-[4rem] flex items-center justify-between px-4 sm:px-6 py-3 shadow-sm z-10 relative gap-4">
      {/* Logo  */}
      <div className="font-sans font-black text-brand-ieee text-sm sm:text-xl md:text-2xl tracking-tight line-clamp-2 sm:line-clamp-none">
        Taller de Programación para no programadores
      </div>
      
      {/* Agregamos shrink-0 al formulario para que el botón nunca se aplaste */}
      <form action={signOut} className="shrink-0">
        <button className="text-xs sm:text-sm font-bold font-sans text-brand-dark hover:text-brand-salmon transition-colors bg-brand-steel/10 sm:bg-transparent px-3 py-1.5 sm:px-0 sm:py-0 rounded-md sm:rounded-none">
          Cerrar Sesión
        </button>
      </form>
    </header>
  )
}