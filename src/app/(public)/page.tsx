'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// aquí definimos los anuncios que queeremos mostrar
const upcomingEvents = [
  "Próximo evento: Hackathon CUTLAJO (invierno 2026)",
];

export default function HomePage() {
  return (
    <div className="relative w-full max-w-7xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden px-4 sm:px-6 lg:px-8">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-6 md:space-y-8 relative z-10 w-full flex flex-col items-center"
      >
        <div className="inline-block border border-brand-salmon/30 bg-brand-salmon/10 rounded-full px-3 py-1 md:px-4 md:py-1.5 text-[10px] sm:text-xs font-sans font-bold tracking-widest text-brand-salmon uppercase mb-2 md:mb-4 shadow-sm">
          Inserte alguna leyenda épica aquí
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight leading-tight text-brand-dark">
          El futuro es hoy <br className="hidden sm:block" /> 
          <span className="text-brand-ieee italic block sm:inline mt-2 sm:mt-0">oíste viejo.</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-brand-brown max-w-2xl mx-auto leading-relaxed font-serif px-2 sm:px-0">
          Aprende programación y tópicos selectos de la tecnología junto con otros estudiantes sin importar tu experiencia previa.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full pt-6 md:pt-8 pb-8 md:pb-12 font-sans px-4 sm:px-0">
          <Link href="/register" className="group relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white bg-brand-ieee rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
            <span className="relative z-10">Explorar Talleres</span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
          
          <Link href="/blog" className="text-brand-dark font-bold hover:text-brand-salmon transition-colors flex items-center justify-center gap-2 group w-full sm:w-auto py-2 md:py-0">
            Leer Artículos <span className="text-brand-salmon group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* anuncios kawais */}
        <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-brand-steel/30 bg-brand-ieee/5 backdrop-blur-md relative py-2 md:py-3 shadow-inner">
          {/* Sombras */}
          <div className="absolute top-0 left-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-brand-beige to-transparent z-10"></div>
          <div className="absolute top-0 right-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-brand-beige to-transparent z-10"></div>
          
          <motion.div
            className="flex whitespace-nowrap w-max"
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ 
              duration: 25, // Tiempo que tarda en dar la vuelta, subir si va muy rápido
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {/* Dupliccion del arreglo*/}
            {[...upcomingEvents, ...upcomingEvents].map((event, index) => (
              <div key={index} className="flex items-center px-4 md:px-6">
                <span className="font-sans font-bold text-xs md:text-sm text-brand-ieee uppercase tracking-widest">
                  {event}
                </span>
                <span className="mx-4 md:mx-6 text-brand-salmon text-base md:text-lg font-black">
                  ✦
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      

      </motion.div>
    </div>
  );
}