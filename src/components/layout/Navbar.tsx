import { signOut } from '@/app//(public)/(auth)/actions'

export default function Navbar() {
  return (
    <header className="bg-brand-terminal border-b border-brand-terminal-border min-h-[4rem] flex items-center justify-between px-4 sm:px-6 py-3 z-10 relative gap-4">
      {/* Logo  */}
      <div className="font-mono font-bold text-brand-mint text-xs sm:text-lg md:text-xl tracking-tight line-clamp-2 sm:line-clamp-none">
        ~/taller-de-programacion
      </div>

      {/* Agregamos shrink-0 al formulario para que el botón nunca se aplaste */}
      <form action={signOut} className="shrink-0">
        <button className="text-xs sm:text-sm font-bold font-mono text-[#9c9c94] hover:text-brand-salmon transition-colors bg-black/30 sm:bg-transparent px-3 py-1.5 sm:px-0 sm:py-0 rounded-md sm:rounded-none">
          cerrar_sesion
        </button>
      </form>
    </header>
  )
}