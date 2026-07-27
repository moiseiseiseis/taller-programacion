'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Coffee, BookOpen, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const upcomingEvents = [
  { time: '10:42', category: 'evento', accent: '#9BCCB1', text: 'Primera sesión de Ctrl+Café' },
  { time: '10:42', category: 'aviso', accent: '#D5615B', text: 'Taller de Programación pospuesto para Agosto 2026' },
  { time: '10:42', category: 'hackathon', accent: '#9DB6D3', text: 'Hackathon CUTLAJO (invierno) 2026' },
];

const HEADLINE = 'El futuro es hoy, ';

// Titular con efecto de escritura. Respeta prefers-reduced-motion.
function TypedHeadline() {
  const [charCount, setCharCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setCharCount(HEADLINE.length);
      setFinished(true);
      return;
    }
    const start = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setCharCount(i);
        if (i >= HEADLINE.length) {
          clearInterval(interval);
          setFinished(true);
        }
      }, 34);
    }, 350);
    return () => clearTimeout(start);
  }, []);

  return (
    <h1 className="font-mono text-3xl sm:text-5xl md:text-6xl font-bold leading-snug tracking-tight text-brand-beige min-h-[2.6em] sm:min-h-[1.35em]">
      {HEADLINE.slice(0, charCount)}
      {!finished && (
        <span
          className="inline-block w-2 sm:w-2.5 h-7 sm:h-9 bg-brand-mint align-middle ml-0.5"
          style={{ boxShadow: '0 0 12px rgba(155,204,177,0.7)' }}
        />
      )}
      {finished && (
        <>
          <span
            className="text-brand-mint"
            style={{ textShadow: '0 0 24px rgba(155,204,177,0.55)' }}
          >
            oíste viejo
          </span>
          <span
            className="inline-block w-2 sm:w-2.5 h-7 sm:h-9 bg-brand-mint align-middle ml-1"
            style={{ boxShadow: '0 0 12px rgba(155,204,177,0.7)', animation: 'blink 1s step-end infinite' }}
          />
        </>
      )}
    </h1>
  );
}

// Tres puntos de "barra de título" de terminal, usando los colores de marca en vez del rojo/amarillo/verde genérico
function TitlebarDots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-brand-salmon" />
      <span className="w-2.5 h-2.5 rounded-full bg-brand-highlight" />
      <span className="w-2.5 h-2.5 rounded-full bg-brand-mint" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative w-full">
      {/* textura sutil de scanlines sobre toda la sección */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full flex flex-col items-center space-y-6 md:space-y-8"
        >
          {/* ---- Ticker como log de terminal ---- */}
          <div
            className="w-full max-w-3xl overflow-hidden rounded-lg border border-brand-terminal-border relative flex items-stretch"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.15))',
              boxShadow: 'inset 0 1px 0 rgba(155,204,177,0.25)',
            }}
          >
            {/* Etiqueta fija, no se mueve con el scroll */}
            <div className="flex items-center gap-2 px-3.5 md:px-4 py-3 bg-brand-mint shrink-0 z-20">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#0f1a15] shrink-0"
                style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }}
              />
              <span className="font-mono text-[11px] md:text-xs font-bold text-[#0f1a15] tracking-wide whitespace-nowrap">
                PRÓXIMO
              </span>
            </div>

            <div className="relative overflow-hidden flex-1">
              <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-brand-terminal-panel to-transparent z-10" />
              <div className="absolute top-0 right-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-brand-terminal to-transparent z-10" />

              <motion.div
                className="flex whitespace-nowrap w-max font-mono text-xs md:text-sm py-3"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              >
                {[...upcomingEvents, ...upcomingEvents].map((event, index) => (
                  <div key={index} className="flex items-center px-5 md:px-6 gap-2.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: event.accent, boxShadow: `0 0 6px ${event.accent}` }}
                    />
                    <span
                      className="uppercase text-[10px] md:text-[11px] font-bold tracking-wide shrink-0"
                      style={{ color: event.accent }}
                    >
                      {event.category}
                    </span>
                    <span className="text-[#4a4a44] text-[11px] md:text-xs">[{event.time}]</span>
                    <span className="text-[#c8c8c0] font-medium">{event.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* ---- Ventana de terminal envolviendo el hero ---- */}
          <div className="w-full max-w-3xl rounded-xl border border-brand-terminal-border bg-brand-terminal-panel overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-terminal-border bg-black/20">
              <TitlebarDots />
              <span className="font-mono text-[11px] text-[#6f6f68] ml-1.5">bienvenida.sh</span>
            </div>

            <div className="px-6 sm:px-10 py-8 sm:py-12 text-left">
              <div className="inline-block font-mono text-[13px] text-brand-steel mb-5">
                <span className="text-brand-mint mr-2">$</span>whoami
              </div>

              <TypedHeadline />

              <p className="mt-6 text-sm sm:text-base text-[#a8a8a0] max-w-xl leading-relaxed font-sans">
                Aprende programación y tópicos selectos de la tecnología junto con otros estudiantes sin importar tu experiencia previa.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-8 font-sans">
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-[#0f1a15] bg-brand-mint rounded-md transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ boxShadow: '0 0 0 rgba(155,204,177,0)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 22px rgba(155,204,177,0.5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 0 rgba(155,204,177,0)')}
                >
                  Unirse a la Comunidad
                </Link>

                <Link
                  href="/blog"
                  className="font-mono text-[13.5px] text-[#b8b8b0] hover:text-brand-mint transition-colors flex items-center gap-2 group border-b border-transparent hover:border-brand-mint pb-0.5"
                >
                  leer_artículos <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ---- Ctrl+Café, mismo chrome de ventana que el hero ---- */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-3xl rounded-xl border border-brand-terminal-border bg-brand-terminal-panel overflow-hidden mt-4"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-terminal-border bg-black/20">
              <TitlebarDots />
              <span className="font-mono text-[11px] text-[#6f6f68] ml-1.5">evento_semanal.log</span>
            </div>

            <div className="px-6 sm:px-10 py-8 flex flex-col md:flex-row items-center gap-8 text-left">
              <motion.div
                animate={{ y: [0, -6, 4, -4, 0], x: [0, -2, 2, -1, 0], rotate: [0, -4, 4, -2, 0] }}
                transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
                className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 bg-black/30 rounded-full flex items-center justify-center border border-brand-terminal-border"
              >
                <Coffee className="text-brand-mint w-12 h-12" />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-2 -right-2 bg-brand-salmon text-white p-2.5 rounded-full shadow-lg border-2 border-brand-terminal-panel"
                >
                  <MessageCircle className="w-4 h-4" />
                </motion.div>
              </motion.div>

              <div className="w-full space-y-4">
                <span className="font-mono text-xs text-brand-salmon block">// nuevo_evento_semanal</span>

                <h2 className="font-sans font-bold text-xl sm:text-2xl text-white">
                  Presentamos: Ctrl+Café
                </h2>

                <p className="text-[#9c9c94] font-sans text-sm leading-relaxed">
                  Mientras preparamos los motores para el gran taller en agosto de 2026, no queremos dejar de vernos. Únete a nuestras reuniones semanales donde compartimos una lectura breve, buen café y galletas para debatir el impacto de la tecnología.
                </p>

                <div className="flex flex-wrap gap-3 font-mono text-xs">
                  <span className="flex items-center gap-2 bg-black/30 border border-brand-terminal-border text-brand-steel px-3 py-1.5 rounded-md">
                    <BookOpen className="w-3.5 h-3.5" /> lectura_previa
                  </span>
                  <span className="flex items-center gap-2 bg-black/30 border border-brand-terminal-border text-brand-steel px-3 py-1.5 rounded-md">
                    <Coffee className="w-3.5 h-3.5" /> café_y_debate
                  </span>
                </div>

                <div className="pt-3">
                  <Link
                    href="/eventos"
                    className="font-mono text-sm font-bold text-brand-mint hover:brightness-110 transition-all inline-flex items-center gap-2"
                  >
                    ver_cartelera <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
