'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthUser } from '@/lib/auth'

// Crear un nuevo taller (Solo Instructor/Admin)
export async function createWorkshop(formData: FormData) {
  const supabase = await createClient()
  const { user } = await getAuthUser()

  const workshopData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    created_by: user?.id,
  }

  const { error } = await supabase.from('workshops').insert(workshopData)
  
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/instructor/workshops')
}

// Obtener todos los talleres activos para alumnos
export async function getActiveWorkshops() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('is_active', true)
  
  if (error) return []
  return data
}