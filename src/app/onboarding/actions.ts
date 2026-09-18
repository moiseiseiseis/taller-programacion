'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';

export async function completeProfile(formData: FormData) {
  const supabase = await createClient();

  // 1. Verificamos quién es el usuario logueado
  const { user } = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Extraemos los datos del formulario
  const name = formData.get('name') as string;
  const career = formData.get('career') as string;

  // 3. Actualizamos la tabla pública
  const { error } = await supabase
    .from('users')
    .update({ 
      name: name, 
      career: career 
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error actualizando perfil:', error);
    throw new Error('No se pudo guardar el perfil.');
  }

  // 4. Si todo sale bien, lo mandamos al dashboard
  redirect('/dashboard');
}