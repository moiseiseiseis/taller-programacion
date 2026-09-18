import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'

// Antes esta protección (estudiante no puede ver rutas de instructor) vivía
// en middleware.ts con una consulta a Postgres en cada request. Movida aquí:
// reutiliza el resultado ya cacheado de getAuthUser() para este render.
export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getAuthUser()

  if (role === 'student') {
    redirect('/dashboard/student')
  }

  return <>{children}</>
}
