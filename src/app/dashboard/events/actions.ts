'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';

// --- ACCIONES DE INSTRUCTOR ---

// 1. crear un nuevo evento
export async function createEvent(formData: FormData) {
  const instructorId = await requireRole('instructor');
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const event_type = formData.get('event_type') as string; // 'online' o 'presencial'
  const location_url = formData.get('location_url') as string;
  const event_date = formData.get('event_date') as string;

  const { error } = await supabase.from('events').insert({
    title,
    description,
    event_type,
    location_url,
    event_date,
    instructor_id: instructorId
  });

  if (error) {
    console.error("Error al crear evento:", error);
    throw new Error("No se pudo agendar el evento");
  }

  // Refrescamos las rutas donde se vean los eventos
  revalidatePath('/dashboard/student/events', 'layout');
  revalidatePath('/dashboard/instructor/events', 'layout');
  redirect('/dashboard/instructor/events'); 
}

// 3. Borrar un evento
export async function deleteEvent(eventId: string) {
  await requireRole('instructor');
  const supabase = await createClient();
  
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) console.error("Error al borrar evento:", error);
  
  revalidatePath('/dashboard/student/events', 'layout');
  revalidatePath('/dashboard/instructor/events', 'layout');
}


// --- ACCIONES GENERALES Y DE ESTUDIANTES ---

// 4. Obtener todos los eventos futuros
export async function getUpcomingEvents() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      instructor:users!instructor_id(name),
      participants:event_participants(user_id)
    `)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true });

  if (error) console.error("Error al traer eventos:", error);
  return data || [];
}

// 5. Registrarse o cancelar asistencia a un evento (Toggle)
export async function toggleEventRegistration(eventId: string, isRegistered: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión");

  if (isRegistered) {
    
    await supabase.from('event_participants')
      .delete()
      .match({ event_id: eventId, user_id: user.id });
  } else {
   
    await supabase.from('event_participants')
      .insert({ event_id: eventId, user_id: user.id });
  }

  revalidatePath('/dashboard/student/events');
}

// 6. Obtener detalles de un evento y sus asistentes (Solo para Instructores)
export async function getEventByIdForInstructor(eventId: string) {
  // 1. Verificamos que sea instructor
  await requireRole('instructor');
  
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      participants:event_participants(
        id,
        created_at,
        user:users(name, email) 
      )
    `)
    .eq('id', eventId)
    .single();

  if (error) {
    console.error("Error al traer detalles del evento:", error);
    return null;
  }

  return data;
}

// 7. Actualizar un evento existente
export async function updateEvent(formData: FormData) {
  const instructorId = await requireRole('instructor');
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const event_type = formData.get('event_type') as string;
  const location_url = formData.get('location_url') as string;
  const event_date = formData.get('event_date') as string;

  const { error } = await supabase.from('events').update({
    title,
    description,
    event_type,
    location_url,
    event_date
  }).match({ id, instructor_id: instructorId }); 

  if (error) {
    console.error("Error al actualizar evento:", error);
    throw new Error("No se pudo actualizar");
  }

  // Refrescamos las cachés
  revalidatePath(`/dashboard/instructor/events/${id}`);
  revalidatePath('/dashboard/student/events');
  revalidatePath('/dashboard/instructor/events');
}

// 8. Borrar evento y salir de la página
export async function deleteEventAndRedirect(eventId: string) {
  await requireRole('instructor');
  const supabase = await createClient();
  
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) console.error("Error al borrar evento:", error);
  
  revalidatePath('/dashboard/student/events');
  revalidatePath('/dashboard/instructor/events');
  redirect('/dashboard/instructor/events'); // Lo mandamos de vuelta pal lobby
}