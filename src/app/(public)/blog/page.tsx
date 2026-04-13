'use client';

import { motion } from 'framer-motion';

// mocks estaticos en lo que publicamos entradas reales
const posts = [
  {
    id: 1,
    title: "¿Cómo saber si la IA me va a quitar mi trabajo? Realiza el siguiente test.",
    excerpt: "Análisis superficial de la inteligencia artificial desde el ojo de un paranoide con miedo al desempleo.",
    category: "IA y Sociedadd",
    date: "2 Abr 2026",
    delay: 0.1
  },
  {
    id: 2,
    title: "Construye tu primera aplicacion móvil desde cero",
    excerpt: "Guía paso a paso para construir una aplicación móvil más que seguramente nadie va a descargar.",
    category: "Desarrollo Móvil",
    date: "28 Mar 2026",
    delay: 0.2
  },
  {
    id: 3,
    title: "Guía definitiva para prender un led con Arduino (y no morir en el intento)",
    excerpt: "Aprende a encender un led con Arduino y presúmelo a todos tus contactos en Instagram.",
    category: "Hardware y Software",
    date: "14 Mar 2026",
    delay: 0.3
  }
];

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto relative z-10">
      
      {/* Encabezado del Blog */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 border-b border-brand-steel/20 pb-8 text-center md:text-left"
      >
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4 text-brand-dark">
          Blog & Notas
        </h1>
        <p className="text-brand-brown text-lg font-serif italic">
         (Próximamente) Investigaciones, tutoriales y reflexiones sobre tecnología y sus interacciones con la sociedad.
        </p>
      </motion.div>

      {/* Cuadrícula de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <motion.article 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: post.delay, duration: 0.5 }}
            className="group relative bg-white/60 backdrop-blur-sm border border-brand-steel/30 p-8 rounded-2xl hover:bg-white hover:border-brand-ieee/50 hover:shadow-xl hover:shadow-brand-ieee/5 transition-all cursor-pointer flex flex-col h-full"
          >
            {/* Etiquetas */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-sans font-bold text-brand-salmon bg-brand-salmon/10 px-3 py-1 rounded-full uppercase tracking-wider border border-brand-salmon/20">
                {post.category}
              </span>
              <span className="text-xs font-sans font-semibold text-brand-steel">
                {post.date}
              </span>
            </div>
            
            {/* Título del artículo*/}
            <h2 className="text-2xl font-serif font-bold mb-4 text-brand-dark group-hover:text-brand-ieee transition-colors leading-tight">
              {post.title}
            </h2>
            
            {/* Resumen*/}
            <p className="text-sm font-sans text-brand-brown/80 mb-8 flex-grow line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
            
            {/* Botón de lectura */}
            <div className="mt-auto flex items-center text-sm font-sans font-bold text-brand-ieee group-hover:gap-2 transition-all">
              Próximamente
              <span className="opacity-0 -translate-x-2 text-brand-salmon group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-1">
                →
              </span>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}