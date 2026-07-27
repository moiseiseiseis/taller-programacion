'use client';

import { motion, Variants } from 'framer-motion';
import { Calendar, Coffee, Rocket, Code, MapPin, Clock } from 'lucide-react';
import TerminalWindow from '@/components/layout/TerminalWindow';

const publicEvents = [
  {
    id: 1,
    file: "ctrl_cafe.log",
    title: "Ctrl+Café",
    date: "Sesiones Por definir",
    time: "Por definir",
    location: "Por Definir",
    description: "Nuestra reunión recurrente para debatir lecturas sobre el impacto de la tecnología, acompañados de buen café y galletas. Un espacio libre de código (o no) para hacer networking y formar comunidad.",
    icon: Coffee,
    accent: "#D5615B",
    iconColor: "text-brand-salmon",
    tag: "Próximamente"
  },
  {
    id: 2,
    file: "inicio_taller.log",
    title: "Inicio del Taller",
    date: "Agosto 2026",
    time: "Por Definir",
    location: "Por Definir",
    description: "El evento principal. Arrancamos formalmente con el Taller de Programación para no programadores. Prepárate para escribir tus primeras líneas de código.",
    icon: Rocket,
    accent: "#9BCCB1",
    iconColor: "text-brand-mint",
    tag: "Evento Principal"
  },
  {
    id: 3,
    file: "hackathon_invierno.log",
    title: "Hackathon Invierno",
    date: "Invierno 2026",
    time: "Por Definir",
    location: "Por Definir",
    description: "Demuestra lo que has aprendido. Forma tu equipo, elige un problema real de tu comunidad y construye una solución tecnológica durante un fin de semana lleno de adrenalina, pizza y código.",
    icon: Code,
    accent: "#9DB6D3",
    iconColor: "text-brand-steel",
    tag: "Competencia"
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function PublicEventsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">

      {/* textura sutil de scanlines, igual que en la home */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Hero de Eventos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24 space-y-4"
        >
          <div className="inline-block font-mono text-[13px] text-brand-steel">
            <span className="text-brand-mint mr-2">$</span>cat agenda_2026.log
          </div>
          <h1 className="font-mono text-4xl md:text-6xl font-bold leading-snug tracking-tight text-brand-beige">
            Próximos{' '}
            <span
              className="text-brand-mint"
              style={{ textShadow: '0 0 24px rgba(155,204,177,0.55)' }}
            >
              Encuentros
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#9c9c94] max-w-2xl mx-auto font-sans">
            Únete a nuestras actividades. Desde charlas relajadas hasta sesiones de código intenso.
          </p>
        </motion.div>

        {/* Lista de Eventos */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-8 md:gap-12"
        >
          {publicEvents.map((event) => {
            const IconComponent = event.icon;

            return (
              <motion.div key={event.id} variants={itemVariants}>
                <TerminalWindow
                  label={event.file}
                  className="shadow-lg hover:border-brand-mint/40 transition-colors duration-300"
                >
                  <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    {/* Columna Izquierda: ícono */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-black/30 border border-brand-terminal-border flex items-center justify-center transition-shadow duration-300"
                        style={{ '--glow': event.accent } as React.CSSProperties}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 24px ${event.accent}33`)}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                      >
                        <IconComponent className={`w-9 h-9 md:w-10 md:h-10 ${event.iconColor}`} />
                      </div>
                    </div>

                    {/* Columna Derecha: información */}
                    <div className="flex-1 w-full text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                        <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-beige">
                          {event.title}
                        </h2>
                        <span className="inline-flex items-center gap-2 self-center md:self-auto px-3 py-1.5 bg-black/30 border border-brand-terminal-border font-mono font-bold text-[11px] uppercase tracking-widest rounded-md whitespace-nowrap">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: event.accent, boxShadow: `0 0 6px ${event.accent}` }}
                          />
                          <span style={{ color: event.accent }}>{event.tag}</span>
                        </span>
                      </div>

                      <p className="text-[#9c9c94] font-sans text-base md:text-lg mb-6 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 font-mono text-xs md:text-[13px] text-brand-beige">
                        <div className="flex items-center gap-2 bg-black/30 px-3.5 py-2 rounded-md border border-brand-terminal-border">
                          <Calendar className={`w-3.5 h-3.5 ${event.iconColor}`} />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-2 bg-black/30 px-3.5 py-2 rounded-md border border-brand-terminal-border">
                          <Clock className={`w-3.5 h-3.5 ${event.iconColor}`} />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2 bg-black/30 px-3.5 py-2 rounded-md border border-brand-terminal-border">
                          <MapPin className={`w-3.5 h-3.5 ${event.iconColor}`} />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </TerminalWindow>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Cierre / Call to action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-[#9c9c94] font-mono text-sm mb-6">
            <span className="text-brand-mint mr-2">$</span>¿ya eres parte de la comunidad?
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3.5 font-mono font-bold text-[#0f1a15] bg-brand-mint rounded-md transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ boxShadow: '0 0 0 rgba(155,204,177,0)' }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 22px rgba(155,204,177,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 0 rgba(155,204,177,0)')}
          >
            ir_a_mi_dashboard →
          </a>
        </motion.div>

      </div>
    </div>
  );
}