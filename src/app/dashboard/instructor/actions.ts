'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { parseOptionalJson } from '@/lib/parseOptionalJson';

export async function createWorkshop(formData: FormData) {
  const instructorId = await requireRole('instructor');
  const supabase = await createClient();

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
      created_by: instructorId,
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
  await requireRole('instructor');
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

export async function saveModuleCover(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const module_id = formData.get('module_id') as string;
  const cover_url = (formData.get('cover_url') as string) || null;

  const { error } = await supabase.from('modules').update({ cover_url }).eq('id', module_id);
  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/modulo/${module_id}`);
  return { success: true };
}

export async function createLesson(formData: FormData) {
  await requireRole('instructor');
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
  await requireRole('instructor');
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
  await requireRole('instructor');
  const supabase = await createClient();
  const lesson_id = formData.get('lesson_id') as string;
  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const description = (formData.get('description') as string) || null;

  const { error } = await supabase
    .from('lessons')
    .update({ title, type, description })
    .eq('id', lesson_id);

  if (error) {
    throw new Error(`Error al actualizar la lección: ${error.message}`);
  }
  
  redirect(`/dashboard/instructor/leccion/${lesson_id}`);
}

export async function deleteLesson(formData: FormData) {
  await requireRole('instructor');
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


// Actualiza el abstract (description) del taller, visible en su página tanto
// para el instructor como para el alumno.
export async function updateWorkshopDescription(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();
  const workshop_id = formData.get('workshop_id') as string;
  const description = (formData.get('description') as string) || null;
  const is_code_workshop = formData.get('is_code_workshop') === 'on';

  const { error } = await supabase
    .from('workshops')
    .update({ description, is_code_workshop })
    .eq('id', workshop_id);

  if (error) throw new Error(`Error al actualizar la descripción: ${error.message}`);
  revalidatePath(`/dashboard/instructor/taller/${workshop_id}`);
  revalidatePath(`/dashboard/student/taller/${workshop_id}`);
}

// Alternar si un taller está visible para los alumnos o no
export async function toggleWorkshopStatus(formData: FormData) {
  await requireRole('instructor');
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
  await requireRole('instructor');
  const supabase = await createClient();
  const workshop_id = formData.get('workshop_id') as string;

  // Si la base de datos no tiene "ON DELETE CASCADE",
  // Postgres bloqueará esto si el taller ya tiene módulos o lecciones dentro.
  const { error } = await supabase
    .from('workshops')
    .delete()
    .eq('id', workshop_id);

  if (error) throw new Error(`Error al eliminar taller: ${error.message}`);
  redirect('/dashboard/instructor/workshops');
}

export async function evaluateSubmission(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();
  const submission_id = formData.get('submission_id') as string;
  const status = formData.get('status') as string;

  const { data: submission } = await supabase
    .from('submissions')
    .select('user_id, practice_id')
    .eq('id', submission_id)
    .single();

  const { error } = await supabase
    .from('submissions')
    .update({ status: status })
    .eq('id', submission_id);

  if (error) {
    throw new Error(`Error al calificar: ${error.message}`);
  }

  // Al aprobar, marcamos la lección de esa práctica como completada para el alumno
  if (status === 'correct' && submission) {
    const { data: practice } = await supabase
      .from('practices')
      .select('lesson_id')
      .eq('id', submission.practice_id)
      .single();

    if (practice?.lesson_id) {
      await supabase
        .from('lesson_completions')
        .upsert(
          { lesson_id: practice.lesson_id, user_id: submission.user_id },
          { onConflict: 'lesson_id,user_id', ignoreDuplicates: true }
        );
    }
  }

  // Redirigimos de vuelta a la bandeja de entrada
  redirect('/dashboard/instructor/revisiones');
}



export async function saveTheoryContent(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

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
  await requireRole('instructor');
  const supabase = await createClient();

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
  await requireRole('instructor');
  const supabase = await createClient();

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

export async function updateLessonQuiz(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const lesson_id = formData.get('lesson_id') as string;
  const quiz = parseOptionalJson(
    formData.get('quiz_json') as string,
    'El JSON del quiz no es válido. Revisa el formato.'
  );

  const { error } = await supabase.from('lessons').update({ quiz }).eq('id', lesson_id);
  if (error) throw new Error(`No se pudo guardar el quiz: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

export async function savePythonExercise(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const exercise_id = formData.get('exercise_id') as string | null;
  const lesson_id = formData.get('lesson_id') as string;
  const order_index = Number(formData.get('order_index'));
  const kind = formData.get('kind') as string;
  const title = formData.get('title') as string;
  const prompt = formData.get('prompt') as string;
  const starter_code = formData.get('starter_code') as string;
  const hint = (formData.get('hint') as string) || null;

  const test_spec = parseOptionalJson(
    formData.get('test_spec_json') as string,
    'El JSON del validador (test_spec) no es válido. Revisa el formato.'
  );
  if (!test_spec) throw new Error('El validador (test_spec) es obligatorio.');

  const payload = { lesson_id, order_index, kind, title, prompt, starter_code, test_spec, hint };

  const { error } = exercise_id
    ? await supabase.from('python_exercises').update(payload).eq('id', exercise_id)
    : await supabase.from('python_exercises').insert(payload);

  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

export async function deletePythonExercise(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const exercise_id = formData.get('exercise_id') as string;
  const lesson_id = formData.get('lesson_id') as string;

  const { error } = await supabase.from('python_exercises').delete().eq('id', exercise_id);
  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

export async function saveTerminalLevel(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const level_id = formData.get('level_id') as string | null;
  const lesson_id = formData.get('lesson_id') as string;
  const order_index = Number(formData.get('order_index'));
  const title = formData.get('title') as string;
  const narrative = (formData.get('narrative') as string) || null;
  const goal = formData.get('goal') as string;
  const hint = (formData.get('hint') as string) || null;

  const filesystem = parseOptionalJson(
    formData.get('filesystem_json') as string,
    'El JSON del sistema de archivos no es válido. Revisa el formato.'
  );
  if (!filesystem) throw new Error('El sistema de archivos (filesystem) es obligatorio.');

  const validator = parseOptionalJson(
    formData.get('validator_json') as string,
    'El JSON del validador no es válido. Revisa el formato.'
  );
  if (!validator) throw new Error('El validador es obligatorio.');

  const payload = { lesson_id, order_index, title, narrative, goal, filesystem, validator, hint };

  const { error } = level_id
    ? await supabase.from('terminal_levels').update(payload).eq('id', level_id)
    : await supabase.from('terminal_levels').insert(payload);

  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

export async function deleteTerminalLevel(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const level_id = formData.get('level_id') as string;
  const lesson_id = formData.get('lesson_id') as string;

  const { error } = await supabase.from('terminal_levels').delete().eq('id', level_id);
  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

export async function saveLogicPuzzle(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const puzzle_id = formData.get('puzzle_id') as string | null;
  const lesson_id = formData.get('lesson_id') as string;
  const order_index = Number(formData.get('order_index'));
  const kind = formData.get('kind') as string;
  const title = formData.get('title') as string;
  const narrative = (formData.get('narrative') as string) || null;
  const prompt = formData.get('prompt') as string;
  const hint = (formData.get('hint') as string) || null;
  const explanation = (formData.get('explanation') as string) || null;

  const puzzle_data = parseOptionalJson(
    formData.get('puzzle_data_json') as string,
    'El JSON de la pieza (puzzle_data) no es válido. Revisa el formato.'
  );
  if (!puzzle_data) throw new Error('La pieza (puzzle_data) es obligatoria.');

  const solution = parseOptionalJson(
    formData.get('solution_json') as string,
    'El JSON de la solución no es válido. Revisa el formato.'
  );
  if (!solution) throw new Error('La solución es obligatoria.');

  const payload = { lesson_id, order_index, kind, title, narrative, prompt, puzzle_data, solution, hint, explanation };

  const { error } = puzzle_id
    ? await supabase.from('logic_puzzles').update(payload).eq('id', puzzle_id)
    : await supabase.from('logic_puzzles').insert(payload);

  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

export async function deleteLogicPuzzle(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const puzzle_id = formData.get('puzzle_id') as string;
  const lesson_id = formData.get('lesson_id') as string;

  const { error } = await supabase.from('logic_puzzles').delete().eq('id', puzzle_id);
  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

export async function saveMetacogExercise(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const exercise_id = formData.get('exercise_id') as string | null;
  const lesson_id = formData.get('lesson_id') as string;
  const kind = formData.get('kind') as string;
  const title = formData.get('title') as string;
  const prompt = formData.get('prompt') as string;
  const hint = (formData.get('hint') as string) || null;

  const config = parseOptionalJson(
    formData.get('config_json') as string,
    'El JSON de configuración (config) no es válido. Revisa el formato.'
  );

  const payload = { lesson_id, kind, title, prompt, config: config ?? {}, hint };

  const { error } = exercise_id
    ? await supabase.from('metacog_exercises').update(payload).eq('id', exercise_id)
    : await supabase.from('metacog_exercises').insert(payload);

  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

export async function deleteMetacogExercise(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const exercise_id = formData.get('exercise_id') as string;
  const lesson_id = formData.get('lesson_id') as string;

  const { error } = await supabase.from('metacog_exercises').delete().eq('id', exercise_id);
  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

export async function saveAlgorithmiaExercise(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const exercise_id = formData.get('exercise_id') as string | null;
  const lesson_id = formData.get('lesson_id') as string;
  const kind = formData.get('kind') as string;
  const title = formData.get('title') as string;
  const dilemma = formData.get('dilemma') as string;
  const theory = formData.get('theory') as string;
  const reflection_prompt = formData.get('reflection_prompt') as string;
  const explanation = (formData.get('explanation') as string) || null;
  const hint = (formData.get('hint') as string) || null;

  const config = parseOptionalJson(
    formData.get('config_json') as string,
    'El JSON de configuración (config) no es válido. Revisa el formato.'
  );

  const payload = { lesson_id, kind, title, dilemma, theory, reflection_prompt, explanation, config: config ?? {}, hint };

  const { error } = exercise_id
    ? await supabase.from('algorithmia_exercises').update(payload).eq('id', exercise_id)
    : await supabase.from('algorithmia_exercises').insert(payload);

  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

export async function deleteAlgorithmiaExercise(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const exercise_id = formData.get('exercise_id') as string;
  const lesson_id = formData.get('lesson_id') as string;

  const { error } = await supabase.from('algorithmia_exercises').delete().eq('id', exercise_id);
  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath(`/dashboard/instructor/leccion/${lesson_id}`);
  return { success: true };
}

// Pone la rúbrica (3 niveles, no correcto/incorrecto) y un comentario en una
// entrega reflexiva. No toca response ni lesson_completions: el avance del
// alumno ya quedó marcado cuando guardó su respuesta, esto es solo
// retroalimentación asíncrona.
export async function gradeReflectionSubmission(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const submission_id = formData.get('submission_id') as string;
  const rubric_level = formData.get('rubric_level') as string;
  const instructor_feedback = (formData.get('instructor_feedback') as string) || null;

  const { error } = await supabase
    .from('metacog_submissions')
    .update({ rubric_level, instructor_feedback })
    .eq('id', submission_id);

  if (error) throw new Error(`Error de Supabase: ${error.message}`);

  revalidatePath('/dashboard/instructor/revisiones');
  redirect('/dashboard/instructor/revisiones');
}