import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import SidebarStudent from '@/components/layout/SidebarStudent'
import SidebarInstructor from '@/components/layout/SidebarInstructor'
import SidebarAdmin from '@/components/layout/SidebarAdmin'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Modificamos el select para traer también el 'name'
  const { data: userData } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single()

  // 2.Si el usuario no tiene nombre, lo mandamos a completar su perfil
  // (Hacemos esto antes de procesar cualquier cosa visual del dashboard)
  if (!userData?.name) {
    redirect('/onboarding')
  }

  // 3.le asignamos su rol (o student por defecto)
  const role = userData?.role || 'student'

  return (
    <div className="min-h-screen bg-brand-beige flex flex-col font-serif text-brand-dark">
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