'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { scoreLessonQuiz, getLessonQuizMaxScore, type LessonQuiz, type LessonQuizAnswer } from '@/lib/lessonQuiz';

export async function enrollInWorkshop(formData: FormData) {
  const supabase = await createClient();
  const workshop_id = formData.get('workshop_id') as string;
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión');

  // Insertamos la inscripción en la tabla intermedia.
  // la base de datos tiene una restricción UNIQUE (workshop_id, user_id),
  // por lo que si el alumno intenta hacer trampa, Postgres lo detendrá automáticamente.
  const { error } = await supabase
    .from('enrollments')
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

export async function submitLessonQuiz(lessonId: string, answers: LessonQuizAnswer[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión');

  // El quiz se lee de la base, nunca del cliente: así el puntaje no se puede falsear.
  const { data: lesson } = await supabase.from('lessons').select('quiz').eq('id', lessonId).single();
  const quiz = lesson?.quiz as LessonQuiz | null;

  if (!quiz) throw new Error('Esta lección no tiene un quiz configurado');

  const { score, passed, results } = scoreLessonQuiz(quiz, answers);

  const { error } = await supabase.from('lesson_quiz_attempts').insert({
    lesson_id: lessonId,
    user_id: user.id,
    score,
    passed,
    answers,
  });

  if (error) {
    console.error('Error al guardar intento de quiz:', error);
    throw new Error('No se pudo guardar tu intento');
  }

  if (passed) {
    await supabase
      .from('lesson_completions')
      .upsert(
        { lesson_id: lessonId, user_id: user.id },
        { onConflict: 'lesson_id,user_id', ignoreDuplicates: true }
      );
  }

  revalidatePath(`/dashboard/student/leccion/${lessonId}`);
  return { score, passed, results, maxScore: getLessonQuizMaxScore(quiz) };
}

// Marca como completada una lección de teoría que no tiene quiz. No afecta el
// bloqueo de avance (eso lo maneja lesson_quiz_attempts) — esto solo alimenta
// el progreso visible: checkmarks, barras de %, "Mi Progreso".
export async function markLessonComplete(lessonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('lesson_completions')
    .upsert(
      { lesson_id: lessonId, user_id: user.id },
      { onConflict: 'lesson_id,user_id', ignoreDuplicates: true }
    );

  if (error) {
    console.error('Error al marcar la lección como completada:', error);
    throw new Error('No se pudo guardar tu progreso');
  }

  revalidatePath(`/dashboard/student/leccion/${lessonId}`);
  return { success: true };
}

// Marca un ejercicio de Python como resuelto. A diferencia de
// completeTerminalLevel, esto NO marca la lección como completa aunque se
// resuelvan todos los ejercicios: a una lección de tipo 'python' todavía le
// falta aprobar el quiz mixto de cierre, y eso lo maneja submitLessonQuiz.
export async function completePythonExercise(exerciseId: string, lessonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('python_exercise_progress')
    .upsert(
      { exercise_id: exerciseId, user_id: user.id },
      { onConflict: 'exercise_id,user_id', ignoreDuplicates: true }
    );

  if (error) {
    console.error('Error al guardar progreso del ejercicio:', error);
    throw new Error('No se pudo guardar tu progreso');
  }

  revalidatePath(`/dashboard/student/leccion/${lessonId}`);
  return { success: true };
}

// Marca una pieza del expediente (acertijo de lógica) como resuelta. Igual
// que completePythonExercise, esto NO marca la lección como completa: a una
// lección de tipo 'logic' todavía le falta aprobar el quiz de cierre.
export async function completeLogicPuzzle(puzzleId: string, lessonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('logic_puzzle_progress')
    .upsert(
      { puzzle_id: puzzleId, user_id: user.id },
      { onConflict: 'puzzle_id,user_id', ignoreDuplicates: true }
    );

  if (error) {
    console.error('Error al guardar progreso de la pieza:', error);
    throw new Error('No se pudo guardar tu progreso');
  }

  revalidatePath(`/dashboard/student/leccion/${lessonId}`);
  return { success: true };
}

// Marca un nivel del minijuego de terminal como resuelto. Si con este ya
// quedaron todos los niveles de la lección resueltos, marca la lección
// completa también, para que se integre al progreso general.
export async function completeTerminalLevel(levelId: string, lessonId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('terminal_level_progress')
    .upsert(
      { level_id: levelId, user_id: user.id },
      { onConflict: 'level_id,user_id', ignoreDuplicates: true }
    );

  if (error) {
    console.error('Error al guardar progreso del nivel:', error);
    throw new Error('No se pudo guardar tu progreso');
  }

  const [{ data: allLevels }, { data: solvedLevels }] = await Promise.all([
    supabase.from('terminal_levels').select('id').eq('lesson_id', lessonId),
    supabase
      .from('terminal_level_progress')
      .select('level_id, terminal_levels!inner(lesson_id)')
      .eq('user_id', user.id)
      .eq('terminal_levels.lesson_id', lessonId),
  ]);

  if (allLevels && solvedLevels && allLevels.length > 0 && solvedLevels.length >= allLevels.length) {
    await supabase
      .from('lesson_completions')
      .upsert(
        { lesson_id: lessonId, user_id: user.id },
        { onConflict: 'lesson_id,user_id', ignoreDuplicates: true }
      );
  }

  revalidatePath(`/dashboard/student/leccion/${lessonId}`);
  return { success: true };
}

// Guarda (o actualiza) la respuesta reflexiva de un ejercicio de
// Metacognición. A diferencia de los demás motores, esto no corrige nada
// automáticamente: el avance se marca al guardar, no al acertar, porque
// estos ejercicios no tienen un estado "correcto" que aprobar.
export async function saveReflectionResponse(
  exerciseId: string,
  lessonId: string,
  response: unknown,
  referencedLessonId: string | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('metacog_submissions')
    .upsert(
      {
        exercise_id: exerciseId,
        user_id: user.id,
        response,
        referenced_lesson_id: referencedLessonId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'exercise_id,user_id' }
    );

  if (error) {
    console.error('Error al guardar la respuesta reflexiva:', error);
    throw new Error('No se pudo guardar tu respuesta');
  }

  await supabase
    .from('lesson_completions')
    .upsert(
      { lesson_id: lessonId, user_id: user.id },
      { onConflict: 'lesson_id,user_id', ignoreDuplicates: true }
    );

  revalidatePath(`/dashboard/student/leccion/${lessonId}`);
  return { success: true };
}

// Guarda (o actualiza) el resultado de una simulación de Algoritmia + la
// reflexión personal. Igual que Metacognición, el avance se marca al
// guardar, no al acertar la simulación — ganar o no la corrida manual es
// parcialmente cuestión de suerte, no una habilidad que aprobar.
export async function saveAlgorithmiaSubmission(
  exerciseId: string,
  lessonId: string,
  simResult: unknown,
  reflectionResponse: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión');

  const { error } = await supabase
    .from('algorithmia_submissions')
    .upsert(
      {
        exercise_id: exerciseId,
        user_id: user.id,
        sim_result: simResult,
        reflection_response: reflectionResponse,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'exercise_id,user_id' }
    );

  if (error) {
    console.error('Error al guardar la simulación de Algoritmia:', error);
    throw new Error('No se pudo guardar tu respuesta');
  }

  await supabase
    .from('lesson_completions')
    .upsert(
      { lesson_id: lessonId, user_id: user.id },
      { onConflict: 'lesson_id,user_id', ignoreDuplicates: true }
    );

  revalidatePath(`/dashboard/student/leccion/${lessonId}`);
  return { success: true };
}