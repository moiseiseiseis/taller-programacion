'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createWorkshop(formData: FormData) {
  const supabase = await createClient();
  
  // Verificamos quién es el instructor logueado
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Debes iniciar sesión');
  }

  // Extraemos los datos del formulario
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  // Insertamos en la tabla workshops
  // created_by referencia a users (id)
  const { error } = await supabase
    .from('workshops')
    .insert({ 
      title: title, 
      description: description,
      created_by: user.id,
      is_active: true // Por defecto se crea activo
    });

  if (error) {
    console.error('Error creando taller:', error);
    throw new Error('No se pudo crear el taller.');
  }

  // Redirigimos de vuelta al panel principal del instructor
  redirect('/dashboard/instructor');
}

export async function createModule(formData: FormData) {
  const supabase = await createClient();
  
  const workshop_id = formData.get('workshop_id') as string;
  const title = formData.get('title') as string;

  // Calculamos el order_index automático (buscamos el módulo con el número más alto)
  const { data: existingModules } = await supabase
    .from('modules')
    .select('order_index')
    .eq('workshop_id', workshop_id)
    .order('order_index', { ascending: false })
    .limit(1);

  // Si ya hay módulos, le sumamos 1 al índice más alto. Si no, es el módulo 1.
  const nextOrderIndex = existingModules && existingModules.length > 0 
    ? existingModules[0].order_index + 1 
    : 1;

  // Insertamos el nuevo módulo
  const { error } = await supabase
    .from('modules')
    .insert({
      workshop_id: workshop_id,
      title: title, 
      order_index: nextOrderIndex
    });

  if (error) {
    console.error('Error creando módulo:', error);
    throw new Error('No se pudo crear el módulo');
  }

  // 3. Recargamos la página para ver el nuevo módulo
  redirect(`/dashboard/instructor/taller/${workshop_id}`);
}

export async function createLesson(formData: FormData) {
  const supabase = await createClient();
  
  const module_id = formData.get('module_id') as string;
  const title = formData.get('title') as string; 
  const type = formData.get('type') as string;  

  // Calculamos el orden automático
  const { data: existingLessons } = await supabase
    .from('lessons')
    .select('order_index')
    .eq('module_id', module_id)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrderIndex = existingLessons && existingLessons.length > 0 
    ? existingLessons[0].order_index + 1 
    : 1;

  // Insertamos la lección
  const { error } = await supabase
    .from('lessons')
    .insert({
      module_id: module_id,
      title: title, 
      type: type,
      order_index: nextOrderIndex
    });

  if (error) {
    console.error('Error creando lección:', error);
    throw new Error('No se pudo crear la lección');
  }

  // Recargamos la vista del módulo
  redirect(`/dashboard/instructor/modulo/${module_id}`);
}


export async function savePractice(formData: FormData) {
  const supabase = await createClient();
  
  const lesson_id = formData.get('lesson_id') as string;
  const title = formData.get('title') as string;
  const instructions = formData.get('instructions') as string;
  const language = formData.get('language') as string;
  const starter_code = formData.get('starter_code') as string;
  const expected_output = formData.get('expected_output') as string;

  const { data: existingPractice, error: searchError } = await supabase
    .from('practices')
    .select('id')
    .eq('lesson_id', lesson_id)
    .maybeSingle(); 

  if (searchError) {
    throw new Error(`Error de búsqueda: ${searchError.message}`);
  }

  let error;

  if (existingPractice) {
    // agregamos al Update
    const { error: updateError } = await supabase
      .from('practices')
      .update({ title, instructions, language, starter_code, expected_output }) 
      .eq('id', existingPractice.id);
    error = updateError;
  } else {
    // se agregagregamos al Insert
    const { error: insertError } = await supabase
      .from('practices')
      .insert({ lesson_id, title, instructions, language, starter_code, expected_output });
    error = insertError;
  }

  if (error) {
    throw new Error(`Error de Supabase: ${error.message}`); 
  }

  return { success: true };
}


export async function updateLessonMetadata(formData: FormData) {
  const supabase = await createClient();
  const lesson_id = formData.get('lesson_id') as string;
  const title = formData.get('title') as string;
  const type = formData.get('type') as string;

  const { error } = await supabase
    .from('lessons')
    .update({ title, type })
    .eq('id', lesson_id);

  if (error) {
    throw new Error(`Error al actualizar la lección: ${error.message}`);
  }
  
  redirect(`/dashboard/instructor/leccion/${lesson_id}`);
}

export async function deleteLesson(formData: FormData) {
  const supabase = await createClient();
  const lesson_id = formData.get('lesson_id') as string;
  const module_id = formData.get('module_id') as string;

  // 1. Por seguridad en bases de datos relacionales, borramos primero las prácticas 
  // asociadas a esta lección para que Postgres no marque error de Llave Foránea.
  await supabase.from('practices').delete().eq('lesson_id', lesson_id);

  // 2.  borramos la lección
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lesson_id);

  if (error) {
    throw new Error(`Error al eliminar la lección: ${error.message}`);
  }

  // 3. Redirigimos de vuelta a la página del módulo porque esta lección ya no existe
  redirect(`/dashboard/instructor/modulo/${module_id}`);
}


// Alternar si un taller está visible para los alumnos o no
export async function toggleWorkshopStatus(formData: FormData) {
  const supabase = await createClient();
  const workshop_id = formData.get('workshop_id') as string;
  const current_status = formData.get('current_status') === 'true';

  const { error } = await supabase
    .from('workshops')
    .update({ is_active: !current_status })
    .eq('id', workshop_id);

  if (error) throw new Error(`Error al actualizar estado: ${error.message}`);
  redirect('/dashboard/instructor/workshops'); 
}

// Eliminar un taller por completo
export async function deleteWorkshop(formData: FormData) {
  const supabase = await createClient();
  const workshop_id = formData.get('workshop_id') as string;

  // Si la base de datos no tiene "ON DELETE CASCADE", 
  // Postgres bloqueará esto si el taller ya tiene módulos o lecciones dentro.
  const { error } = await supabase
    .from('workshops')
    .delete()
    .eq('id', workshop_id);

  if (error) throw new Error(`Error al eliminar taller: ${error.message}`);
  redirect('/dashboard/instructor/gestion-talleres');
}

export async function evaluateSubmission(formData: FormData) {
  const supabase = await createClient();
  const submission_id = formData.get('submission_id') as string;
  const status = formData.get('status') as string;

  const { error } = await supabase
    .from('submissions')
    .update({ status: status })
    .eq('id', submission_id);

  if (error) {
    throw new Error(`Error al calificar: ${error.message}`);
  }

  // Redirigimos de vuelta a la bandeja de entrada
  redirect('/dashboard/instructor/revisiones');
}



export async function saveTheoryContent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario no autenticado');

  const lesson_id = formData.get('lesson_id') as string;
  const content_markdown = formData.get('content_markdown') as string;
  const video_url = formData.get('video_url') as string;

  // Buscamos si la lección ya tiene contenido teórico previo
  const { data: existingContent } = await supabase
    .from('theory_contents')
    .select('id')
    .eq('lesson_id', lesson_id)
    .maybeSingle();

  let error;

  if (existingContent) {
    // Si ya existe, actualizamos
    const { error: updateError } = await supabase
      .from('theory_contents')
      .update({ content_markdown, video_url, updated_at: new Date().toISOString() })
      .eq('id', existingContent.id);
    error = updateError;
  } else {
    // Si no existe, lo insertamos
    const { error: insertError } = await supabase
      .from('theory_contents')
      .insert({
        lesson_id,
        content_markdown,
        video_url
      });
    error = insertError;
  }

  if (error) {
    throw new Error(`Error al guardar contenido teórico: ${error.message}`);
  }

  return { success: true };
}

export async function uploadLessonResource(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Usuario no autenticado');

  const lesson_id = formData.get('lesson_id') as string;
  const title = formData.get('title') as string;
  const file = formData.get('file') as File;

  if (!file || file.size === 0) throw new Error("Debes seleccionar un archivo");

  // Generamos un nombre único para no sobreescribir archivos con el mismo nombre
  const fileExt = file.name.split('.').pop();
  const fileName = `${lesson_id}/${crypto.randomUUID()}.${fileExt}`;

  // Subimos el archivo físico a Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('resources')
    .upload(fileName, file);

  if (uploadError) throw new Error(`Error al subir archivo: ${uploadError.message}`);

  // Obtenemos el link público de descarga
  const { data: { publicUrl } } = supabase.storage
    .from('resources')
    .getPublicUrl(fileName);

  // Guardamos el registro en nuestra tabla relacional
  const { error: dbError } = await supabase
    .from('lesson_resources')
    .insert({
      lesson_id,
      title: title || file.name,
      resource_type: file.type.includes('pdf') ? 'pdf' : 'file',
      url: publicUrl
    });

  if (dbError) throw new Error(`Error en base de datos: ${dbError.message}`);

  return { success: true };
}


export async function updateLessonTools(lessonId: string, toolIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  // Borramos las herramientas que la lección tenía asignadas previamente
  await supabase.from('lesson_tools').delete().eq('lesson_id', lessonId);

  // Si el instructor seleccionó herramientas nuevas, las insertamos
  if (toolIds.length > 0) {
    const inserts = toolIds.map(toolId => ({
      lesson_id: lessonId,
      tool_id: toolId
    }));
    
    const { error } = await supabase.from('lesson_tools').insert(inserts);
    if (error) throw new Error('Error al asignar las herramientas');
  }
}