import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'

// Reemplaza el redirect por rol que antes vivía en middleware.ts — ahí
// requería una consulta a Postgres en cada ruta bajo /dashboard; aquí solo
// corre al entrar a /dashboard, y comparte el resultado cacheado de
// getAuthUser() con dashboard/layout.tsx.
export default async function DashboardIndexPage() {
  const { role } = await getAuthUser()
  redirect(`/dashboard/${role ?? 'student'}`)
}
