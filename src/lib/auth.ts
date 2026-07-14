import { createClient } from '@/lib/supabase/server'

type Role = 'instructor' | 'admin' | 'student'

// Verifica que haya un usuario autenticado con el rol indicado.
// Lanza si no hay sesión o si el rol no coincide; devuelve el id del usuario si pasa.
export async function requireRole(role: Role): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== role) {
    throw new Error(`Acceso denegado. Se requieren permisos de ${role}.`)
  }

  return user.id
}
