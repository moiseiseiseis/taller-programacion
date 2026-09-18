import 'server-only'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

type Role = 'instructor' | 'admin' | 'student'

// getUser() y el select de rol pegan a la red (Supabase Auth + Postgres).
// cache() de React memoiza el resultado durante todo el render de la request,
// así layout.tsx, cada page.tsx y las server actions que corren en ese mismo
// paso solo pagan ese costo una vez en lugar de repetirlo por capa.
export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, role: null as Role | null, name: null as string | null }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single()

  return {
    user,
    role: (profile?.role || 'student') as Role,
    name: profile?.name ?? null,
  }
})

// Verifica que haya un usuario autenticado con el rol indicado.
// Lanza si no hay sesión o si el rol no coincide; devuelve el id del usuario si pasa.
export async function requireRole(role: Role): Promise<string> {
  const { user, role: actualRole } = await getAuthUser()

  if (!user) throw new Error('No autenticado')

  if (actualRole !== role) {
    throw new Error(`Acceso denegado. Se requieren permisos de ${role}.`)
  }

  return user.id
}
