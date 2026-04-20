'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Coffee, BookOpen, MessageCircle } from 'lucide-react'; // Necesitarás instalar lucide-react si no lo tienes, o usar tus propios íconos

// Actualizamos los anuncios para reflejar la nueva iniciativa
const upcomingEvents = [
  "Próximo evento: ☕ Primera sesión de Ctrl+Café",
  "Taller de Programación pospuesto para Agosto 2026",
  "Próximo evento: Hackathon CUTLAJO  (invierno) 2026",
];

export default function HomePage() {
  return (
    <div className="relative w-full max-w-7xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-6 md:space-y-8 relative z-10 w-full flex flex-col items-center"
      >
        <div className="inline-block border border-brand-salmon/30 bg-brand-salmon/10 rounded-full px-3 py-1 md:px-4 md:py-1.5 text-[10px] sm:text-xs font-sans font-bold tracking-widest text-brand-salmon uppercase mb-2 md:mb-4 shadow-sm">
          Formando comunidad antes de compilar
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight leading-tight text-brand-dark">
          El futuro es hoy <br className="hidden sm:block" /> 
          <span className="text-brand-ieee italic block sm:inline mt-2 sm:mt-0">oíste viejo.</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-brand-brown max-w-2xl mx-auto leading-relaxed font-serif px-2 sm:px-0">
          Aprende programación y tópicos selectos de la tecnología junto con otros estudiantes sin importar tu experiencia previa.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full pt-6 pb-4 font-sans px-4 sm:px-0">
          <Link href="/register" className="group relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white bg-brand-ieee rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
            <span className="relative z-10">Unirse a la Comunidad</span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
          
          <Link href="/blog" className="text-brand-dark font-bold hover:text-brand-salmon transition-colors flex items-center justify-center gap-2 group w-full sm:w-auto py-2 md:py-0">
            Leer Artículos <span className="text-brand-salmon group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Anuncios kawais */}
        <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-brand-steel/30 bg-brand-ieee/5 backdrop-blur-md relative py-2 md:py-3 shadow-inner">
          <div className="absolute top-0 left-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#FDFBF7] to-transparent z-10"></div> {/* Asumiendo un fondo claro base */}
          <div className="absolute top-0 right-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#FDFBF7] to-transparent z-10"></div>
          
          <motion.div
            className="flex whitespace-nowrap w-max"
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
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

        {/* café programático */}

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="group relative w-full max-w-5xl mt-12 bg-gradient-to-br from-white/90 to-white/50 border border-brand-salmon/30 rounded-[2rem] p-8 sm:p-10 text-left flex flex-col md:flex-row items-center gap-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden backdrop-blur-md"
        >
          {/* Destellos de luz de fondo (solo visibles al hacer hover) */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-salmon/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-ieee/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <div className="w-full md:w-1/3 flex justify-center md:justify-start relative z-10">
      {/* Animación modo "Demasiada Cafeína" */}
            <motion.div 
              animate={{ 
                y: [0, -6, 4, -4, 0], 
                x: [0, -2, 2, -1, 0],
                rotate: [0, -4, 4, -2, 0] 
              }}
              transition={{ 
                duration: 0.3, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="relative w-40 h-40 bg-gradient-to-b from-brand-ieee/10 to-transparent rounded-full flex items-center justify-center border-8 border-white shadow-xl"
            >
              <Coffee className="text-brand-ieee w-16 h-16 group-hover:text-brand-salmon group-hover:scale-110 transition-all duration-300" />
              
              {/* Burbuja palpitante */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-2 -right-2 bg-brand-salmon text-white p-3.5 rounded-full shadow-lg border-2 border-white"
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
          
          <div className="w-full md:w-2/3 space-y-5 relative z-10">
            <div className="inline-block bg-gradient-to-r from-brand-salmon to-brand-salmon/80 text-white text-[10px] sm:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
              Nuevo Evento Semanal
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-dark leading-tight">
              Presentamos: <br className="sm:hidden"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-ieee to-brand-salmon">Ctrl+Café</span>
            </h2>
            
            <p className="text-brand-brown/80 font-sans text-sm sm:text-base md:text-lg leading-relaxed">
              Mientras preparamos los motores para el gran taller en agosto de 2026, no queremos dejar de vernos. Únete a nuestras reuniones semanales donde compartimos una lectura breve, buen café y galletas para debatir el impacto de la tecnología.
            </p>
            
            <div className="pt-2 flex flex-wrap gap-3 font-sans text-sm font-bold text-brand-dark">
              <motion.span whileHover={{ scale: 1.05, y: -2 }} className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-brand-salmon/20 shadow-sm cursor-default text-brand-salmon transition-colors hover:border-brand-salmon text-xs sm:text-sm">
                <BookOpen className="w-4 h-4" /> Lectura previa
              </motion.span>
              <motion.span whileHover={{ scale: 1.05, y: -2 }} className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-brand-ieee/20 shadow-sm cursor-default text-brand-ieee transition-colors hover:border-brand-ieee text-xs sm:text-sm">
                <Coffee className="w-4 h-4" /> Café y debate
              </motion.span>
            </div>

            {/* El super botón */}
            <div className="pt-6">
              <Link href="/eventos" className="group/btn relative inline-flex items-center justify-center px-8 py-3.5 font-bold text-white bg-brand-dark rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-salmon/30 active:scale-95">
                <span className="relative z-10 flex items-center gap-2">
                  Ver cartelera de sesiones <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-salmon to-brand-ieee opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </motion.div>
        </motion.div>
    </div>
  );
} 