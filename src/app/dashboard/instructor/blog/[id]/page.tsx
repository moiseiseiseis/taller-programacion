import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import BlogPostForm from '../BlogPostForm';

export default async function EditarBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Editar Post</h1>
        <p className="text-[#9c9c94] mt-2">{post.title}</p>
      </div>
      <BlogPostForm post={post} />
    </div>
  );
}
