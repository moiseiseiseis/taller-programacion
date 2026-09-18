import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'

// Antes esta protección (solo admin puede ver rutas de admin) vivía en
// middleware.ts con una consulta a Postgres en cada request. Movida aquí:
// reutiliza el resultado ya cacheado de getAuthUser() para este render.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getAuthUser()

  if (role !== 'admin') {
    redirect(`/dashboard/${role ?? 'student'}`)
  }

  return <>{children}</>
}
