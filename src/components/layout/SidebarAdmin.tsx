import Link from 'next/link'
import { TitlebarDots } from './TerminalWindow'

export default function SidebarAdmin() {
  return (
    <aside className="w-64 bg-brand-terminal text-brand-beige flex flex-col min-h-[calc(100vh-4rem)] border-r border-brand-terminal-border">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-brand-terminal-border shrink-0">
        <TitlebarDots />
        <span className="font-mono text-[11px] text-[#6f6f68] ml-1">panel_admin.sh</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 font-mono text-sm">
        <Link href="/dashboard/admin" className="block px-4 py-2 rounded-md text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint transition-colors">Inicio</Link>
        <Link href="/dashboard/admin/users" className="block px-4 py-2 rounded-md text-[#9c9c94] hover:bg-black/30 hover:text-brand-mint transition-colors">Gestión de Usuarios</Link>
      </nav>
    </aside>
  )
}
