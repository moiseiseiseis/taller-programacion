import { createClient } from '@/lib/supabase/server';
import BlogPageContent from './BlogPageContent';

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, created_at, cover_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) console.error('Error al traer los posts del blog:', error);

  return <BlogPageContent posts={posts || []} />;
}
