import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StudentCodeEditor from './StudentCodeEditor';
import ReactMarkdown from 'react-markdown'; 

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

// Diccionario visual para los colores de las categoríasIgual que el del instructor)
const categoryStyles: Record<string, { label: string, color: string }> = {
  hardware: { label: 'Hardware', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  software: { label: 'Software', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  language: { label: 'Lenguaje', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

export default async function StudentLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Buscamos la lección
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, modules(id, workshop_id, title)')
    .eq('id', id)
    .single();

  if (!lesson) notFound();

  // 2. Buscamos el contenido dependiendo del tipo
  let practice = null;
  let submission = null;
  let theory = null;

  if (lesson.type === 'practice' || lesson.type === 'challenge') {
    const { data: p } = await supabase.from('practices').select('*').eq('lesson_id', id).maybeSingle();
    practice = p;
    if (practice) {
      const { data: s } = await supabase.from('submissions').select('*').eq('practice_id', practice.id).eq('user_id', user?.id).maybeSingle();
      submission = s;
    }
  } else if (lesson.type === 'theory') {
    const { data: t } = await supabase.from('theory_contents').select('*').eq('lesson_id', id).maybeSingle();
    theory = t;
  }

  // 3. Buscamos los recursos adjuntos (PDFs)
  const { data: resources } = await supabase
    .from('lesson_resources')
    .select('*')
    .eq('lesson_id', id);

  // 4. Buscamos las herramientas asignadas haciendo un JOIN con la tabla tools
  const { data: lessonTools } = await supabase
    .from('lesson_tools')
    .select(`
      tools (
        id,
        name,
        category,
        description_url
      )
    `)
    .eq('lesson_id', id);

  
  const requiredTools = lessonTools?.map((lt: any) => lt.tools).filter(Boolean) || [];
  
  const embedUrl = theory?.video_url ? getYouTubeEmbedUrl(theory.video_url) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Encabezado y Título */}
      <div>
        <Link 
          href={`/dashboard/student/taller/${lesson.modules?.workshop_id}`} 
          className="text-sm font-semibold text-zinc-500 hover:text-black mb-4 inline-block"
        >
          ← Volver al Temario
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900">{lesson.title}</h1>
      </div>

      {/* Herramientas Requeridas */}
      {requiredTools.length > 0 && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="text-sm font-bold text-zinc-700 whitespace-nowrap">
            ⚙️ Requisitos para esta clase:
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredTools.map((tool: any) => (
              <a 
                key={tool.id}
                href={tool.description_url || '#'} 
                target={tool.description_url ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${categoryStyles[tool.category]?.color} ${tool.description_url ? 'hover:opacity-80' : 'cursor-default'}`}
              >
                {tool.name}
                {tool.description_url && <span className="text-[10px] opacity-70">↗</span>}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Contenido Principal (Teoría o Práctica) */}
      {lesson.type === 'theory' ? (
        theory ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              {embedUrl && (
                <div className="w-full aspect-video bg-black">
                  <iframe src={embedUrl} className="w-full h-full" allowFullScreen></iframe>
                </div>
              )}
              <div className="p-8 lg:p-12">
                <div className="prose prose-zinc max-w-none">
                  <ReactMarkdown>{theory.content_markdown}</ReactMarkdown>
                </div>
              </div>
            </div>

            {/* DESCARGAS */}
            {resources && resources.length > 0 && (
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  Material Complementario
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {resources.map((res: any) => (
                    <a 
                      key={res.id} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-zinc-100 rounded flex items-center justify-center text-xl mr-3 group-hover:bg-white transition-colors">
                        {res.resource_type === 'pdf' ? '' : ''}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-zinc-900 truncate">{res.title}</p>
                        <p className="text-xs text-zinc-500">Descargar</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-zinc-300 text-center">
            <p className="text-zinc-500 font-semibold">El instructor aún está redactando esta lección.</p>
          </div>
        )
      ) : practice ? (
        <StudentCodeEditor practice={practice} submission={submission} />
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-zinc-300 text-center">
          <p className="text-zinc-500 font-semibold">El instructor aún no ha configurado esta práctica.</p>
        </div>
      )}
    </div>
  );
}