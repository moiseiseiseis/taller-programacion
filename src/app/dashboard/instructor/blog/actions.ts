'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { slugify } from '@/lib/slugify';
import { revalidatePath } from 'next/cache';
import { parseOptionalJson } from '@/lib/parseOptionalJson';

const QUIZ_JSON_ERROR = 'El JSON del quiz no es válido. Revisa el formato.';

export async function createBlogPost(formData: FormData) {
  const instructorId = await requireRole('instructor');
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const excerpt = formData.get('excerpt') as string;
  const category = formData.get('category') as string;
  const content_markdown = formData.get('content_markdown') as string;
  const is_published = formData.get('is_published') === 'true';
  const quiz = parseOptionalJson(formData.get('quiz_json') as string, QUIZ_JSON_ERROR);
  const cover_url = (formData.get('cover_url') as string) || null;
  const slug = slugify(title);

  const { error } = await supabase.from('blog_posts').insert({
    title,
    slug,
    excerpt,
    category,
    content_markdown,
    is_published,
    quiz,
    cover_url,
    created_by: instructorId,
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya existe un post con un título muy similar. Cambia el título.');
    }
    throw new Error(`No se pudo crear el post: ${error.message}`);
  }

  revalidatePath('/dashboard/instructor/blog');
  revalidatePath('/blog');
  return { success: true };
}

export async function updateBlogPost(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const excerpt = formData.get('excerpt') as string;
  const category = formData.get('category') as string;
  const content_markdown = formData.get('content_markdown') as string;
  const is_published = formData.get('is_published') === 'true';
  const quiz = parseOptionalJson(formData.get('quiz_json') as string, QUIZ_JSON_ERROR);
  const cover_url = (formData.get('cover_url') as string) || null;
  const slug = slugify(title);

  const { error } = await supabase
    .from('blog_posts')
    .update({
      title,
      slug,
      excerpt,
      category,
      content_markdown,
      is_published,
      quiz,
      cover_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya existe un post con un título muy similar. Cambia el título.');
    }
    throw new Error(`No se pudo actualizar el post: ${error.message}`);
  }

  revalidatePath('/dashboard/instructor/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  return { success: true };
}

export async function deleteBlogPost(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();
  const id = formData.get('id') as string;

  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw new Error(`No se pudo eliminar el post: ${error.message}`);

  revalidatePath('/dashboard/instructor/blog');
  revalidatePath('/blog');
}

export async function togglePublishBlogPost(formData: FormData) {
  await requireRole('instructor');
  const supabase = await createClient();
  const id = formData.get('id') as string;
  const current_status = formData.get('current_status') === 'true';

  const { error } = await supabase
    .from('blog_posts')
    .update({ is_published: !current_status })
    .eq('id', id);

  if (error) throw new Error(`No se pudo actualizar el estado: ${error.message}`);

  revalidatePath('/dashboard/instructor/blog');
  revalidatePath('/blog');
}
