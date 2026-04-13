'use server'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function enrollInWorkshop(workshopId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  // Usamos 'upsert' por si acaso el usuario hace doble clic
  const { error } = await supabase
    .from('enrollments')
    .upsert(
      { user_id: user.id, workshop_id: workshopId }, 
      { onConflict: 'user_id, workshop_id' }
    );

  if (error) {
    console.error("Error al inscribir:", error);
    throw new Error("No se pudo procesar la inscripción");
  }

  // Si todo sale bien, lo mandamos directo al temario del taller
  redirect(`/dashboard/student/taller/${workshopId}`);
}