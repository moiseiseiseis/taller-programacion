import Link from 'next/link'

export default function SidebarAdmin() {
  return (
    <aside className="w-64 bg-brand-dark text-brand-beige flex flex-col min-h-[calc(100vh-4rem)]">
      <nav className="flex-1 py-6 px-4 space-y-2 font-sans">
        <div className="text-brand-mint text-xs font-bold uppercase tracking-wider mb-4 px-4">Administración</div>
        <Link href="/dashboard/admin" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Inicio</Link>
        <Link href="/dashboard/admin/users" className="block px-4 py-2 rounded hover:bg-brand-steel/20 transition-colors">Gestión de Usuarios</Link>
        
      </nav>
    </aside>
  )
}