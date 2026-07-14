'use server'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';

export async function getCommunities() {
  const supabase = await createClient();
  const { data } = await supabase.from('communities').select('*').order('name');
  return data || [];
}

export async function getPosts(communitySlug?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users(name, role),
      community:communities(name, slug),
      comments(count)
    `)
    .order('created_at', { ascending: false });

  if (communitySlug) {
    // Si pasamos un slug, filtramos por esa carrera
    query = query.eq('community.slug', communitySlug);
  }

  const { data } = await query;
  // Limpiamos los nulos si es que filtró
  return data?.filter(post => post.community !== null) || [];
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Debes iniciar sesión para publicar");
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const community_id = formData.get('community_id') as string;

  // Insertamos en la base de datos
  const { error } = await supabase.from('posts').insert({
    title,
    content,
    community_id,
    user_id: user.id
  });

  if (error) {
    console.error("Error al publicar:", error);
    
    throw new Error("No se pudo guardar la publicación");
  }

  // Si todo sale bien, limpiamos la caché y regresamos al feed
  revalidatePath('/dashboard/student/comunidad', 'layout');
  redirect('/dashboard/student/comunidad');
}


export async function getPostById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(name, role),
      community:communities(name, slug),
      comments(
        id,
        content,
        created_at,
        is_endorsed,  
        user:users(name)
      )
    `)
    .eq('id', id)
    .single();


    if (error) {
    console.error("Error en getPostById:", error);
  }

  return data;
}

export async function createComment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Debes iniciar sesión para comentar");

  const post_id = formData.get('post_id') as string;
  const content = formData.get('content') as string;


  const { data: post } = await supabase.from('posts').select('is_locked').eq('id', post_id).single();
  if (post?.is_locked) {
    throw new Error("Este hilo ha sido cerrado por un instructor y no admite más respuestas.");
  }


  const { error } = await supabase.from('comments').insert({
    post_id,
    content,
    user_id: user.id
  });

  if (error) {
    console.error("Error al comentar:", error);
    throw new Error("No se pudo guardar el comentario");
  }

  revalidatePath(`/dashboard/student/comunidad/p/${post_id}`);
}


// 2. Cerrar/Abrir un hilo
export async function toggleLockPost(postId: string, currentStatus: boolean) {
  await requireRole('instructor');
  const supabase = await createClient();
  const { error } = await supabase.from('posts').update({ is_locked: !currentStatus }).eq('id', postId);

  if (error) console.error("Error al cerrar post:", error);
  revalidatePath(`/dashboard/student/comunidad/p/${postId}`);
}

// 3. Fijar/Desfijar un post 
export async function togglePinPost(postId: string, currentStatus: boolean, slug: string) {
  await requireRole('instructor');
  const supabase = await createClient();
  
  await supabase.from('posts').update({ is_pinned: !currentStatus }).eq('id', postId);
  revalidatePath(`/dashboard/student/comunidad/c/${slug}`);
  revalidatePath(`/dashboard/student/comunidad`);
}

// 4. Avalar una respuesta 
export async function toggleEndorseComment(commentId: string, postId: string, currentStatus: boolean) {
  await requireRole('instructor');
  const supabase = await createClient();
  
  await supabase.from('comments').update({ is_endorsed: !currentStatus }).eq('id', commentId);
  revalidatePath(`/dashboard/student/comunidad/p/${postId}`);
}

// 5. Borrar un post por completo 
export async function deletePostAsAdmin(postId: string) {
  await requireRole('instructor');
  const supabase = await createClient();
  
  await supabase.from('posts').delete().eq('id', postId);
  redirect('/dashboard/student/comunidad');
}


// Borrar un comentario específico
export async function deleteCommentAsAdmin(commentId: string, postId: string) {
  await requireRole('instructor');
  const supabase = await createClient();
  
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  
  if (error) {
    console.error("Error al borrar comentario:", error);
  }
  
  // Recargamos la página para que el comentario desaparezca al instante
  revalidatePath(`/dashboard/student/comunidad/p/${postId}`);
}