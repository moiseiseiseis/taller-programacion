import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import SidebarStudent from '@/components/layout/SidebarStudent'
import SidebarInstructor from '@/components/layout/SidebarInstructor'
import SidebarAdmin from '@/components/layout/SidebarAdmin'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role, name } = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  // Si el usuario no tiene nombre, lo mandamos a completar su perfil
  // (Hacemos esto antes de procesar cualquier cosa visual del dashboard)
  if (!name) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-brand-terminal flex flex-col font-serif text-brand-beige">
      <Navbar />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Renderizado condicional del Sidebar según el rol */}
        {role === 'student' && <SidebarStudent />}
        {role === 'instructor' && <SidebarInstructor />}
        {role === 'admin' && <SidebarAdmin />}

        {/* Contenedor principal donde vivirán las páginas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}