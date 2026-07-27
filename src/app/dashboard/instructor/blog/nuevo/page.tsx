import BlogPostForm from '../BlogPostForm';

export default function NuevoBlogPostPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Nuevo Post</h1>
        <p className="text-[#9c9c94] mt-2">Se guarda como borrador salvo que marques &quot;Publicado&quot;.</p>
      </div>
      <BlogPostForm />
    </div>
  );
}
