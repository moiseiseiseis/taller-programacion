'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTool(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario no autenticado');

  const name = formData.get('name') as string;
  const category = formData.get('category') as string;
  const description_url = formData.get('description_url') as string;

  const { error } = await supabase.from('tools').insert({
    name,
    category,
    description_url,
    created_by: user.id
  });

  if (error) {
    console.error(error);
    throw new Error('Error al guardar la herramienta');
  }

  // Refresca la página automáticamente para mostrar la nueva herramienta
  revalidatePath('/dashboard/instructor/herramientas');
}

export async function deleteTool(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get('id') as string;

  const { error } = await supabase.from('tools').delete().eq('id', id);

  if (error) throw new Error('Error al eliminar la herramienta');
  revalidatePath('/dashboard/instructor/herramientas');
}