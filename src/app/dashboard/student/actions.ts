'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function enrollInWorkshop(formData: FormData) {
  const supabase = await createClient();
  const workshop_id = formData.get('workshop_id') as string;
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión');

  // Insertamos la inscripción en la tabla intermedia.
  // la base de datos tiene una restricción UNIQUE (workshop_id, user_id),
  // por lo que si el alumno intenta hacer trampa, Postgres lo detendrá automáticamente.
  const { error } = await supabase
    .from('workshop_enrollments')
    .insert({
      workshop_id: workshop_id,
      user_id: user.id
    });

 if (error) {
    console.error('El error real de Supabase es:', error);
    // Exponemos el mensaje de la base de datos directo al navegador
    throw new Error(`Error de Supabase: ${error.message}`);
  }

  // Recargamos la página para que el botón cambie a "Ir al taller"
  redirect('/dashboard/student');
}

export async function submitCode(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario no autenticado');

  const practice_id = formData.get('practice_id') as string;
  const code = formData.get('code') as string;

  // 1. Verificamos si el alumno ya tiene una entrega previa
  const { data: existingSubmission, error: searchError } = await supabase
    .from('submissions')
    .select('id')
    .eq('practice_id', practice_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (searchError) throw new Error(`Error de búsqueda: ${searchError.message}`);

  let error;

  if (existingSubmission) {
    // 2A. Si ya existe, actualizamos el código y lo regresamos a estado 'pending'
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ code: code, status: 'pending' })
      .eq('id', existingSubmission.id);
    error = updateError;
  } else {
    // 2B. Si es nuevo, lo insertamos
    const { error: insertError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        practice_id: practice_id,
        code: code,
        status: 'pending'
      });
    error = insertError;
  }

  if (error) {
    console.error("Error de Supabase:", error);
    throw new Error(`Error al guardar entrega: ${error.message}`);
  }

  return { success: true };
}