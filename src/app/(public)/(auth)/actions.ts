'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

async function getSiteOrigin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? (process.env.NODE_ENV === 'development' ? 'http' : 'https')
  return `${proto}://${host}`
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // inicio de sesion con supabase
  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=No+se+pudo+iniciar+sesion')
  }

  // 2. se rastrea el rol del usuario para redireccionar a la ruta correcta
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role') 
      .eq('id', user.id)
      .single()

    // 3. Limpiamos caché
    revalidatePath('/', 'layout')

    // 4. Redirección inteligente
    if (profile?.role === 'instructor') {
      redirect('/dashboard/instructor')
    } else {
      redirect('/dashboard/student')
    }
  }

  // Fallback por si algo extrañísimo pasa
  redirect('/login')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error("Error exacto de Supabase:", error.message)
    redirect('/register?error=No+se+pudo+registrar')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()
  const origin = await getSiteOrigin()

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  // Mensaje genérico siempre, exista o no el email (evita enumeración de usuarios)
  redirect('/forgot-password?message=Si+el+correo+existe,+te+enviamos+un+enlace')
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    redirect('/reset-password?error=Las+contraseñas+no+coinciden')
  }
  if (password.length < 6) {
    redirect('/reset-password?error=La+contraseña+debe+tener+al+menos+6+caracteres')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/reset-password?error=No+se+pudo+actualizar+la+contraseña')
  }

  redirect('/login?message=Contraseña+actualizada')
}