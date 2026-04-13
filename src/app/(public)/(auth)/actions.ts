'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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