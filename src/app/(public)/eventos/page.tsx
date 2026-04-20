'use client';


import { motion, Variants } from 'framer-motion';
import { Calendar, Coffee, Rocket, Code, MapPin, Clock } from 'lucide-react';

const publicEvents = [
  {
    id: 1,
    title: "Ctrl+Café",
    date: "Sesiones Por definir",
    time: "Por definir",
    location: "Por Definir",
    description: "Nuestra reunión recurrente para debatir lecturas sobre el impacto de la tecnología, acompañados de buen café y galletas. Un espacio libre de código (o no) para hacer networking y formar comunidad.",
    icon: Coffee,
    color: "from-brand-salmon/20 to-transparent",
    iconColor: "text-brand-salmon",
    tag: "Próximamente"
  },
  {
    id: 2,
    title: "Inicio del Taller",
    date: "Agosto 2026",
    time: "Por Definir",
    location: "Por Definir",
    description: "El evento principal. Arrancamos formalmente con el Taller de Programación para no programadores. Prepárate para escribir tus primeras líneas de código.",
    icon: Rocket,
    color: "from-brand-ieee/20 to-transparent",
    iconColor: "text-brand-ieee",
    tag: "Evento Principal"
  },
  {
    id: 3,
    title: "Hackathon Invierno",
    date: "Invierno 2026",
    time: "Por Definir",
    location: "Por Definir",
    description: "Demuestra lo que has aprendido. Forma tu equipo, elige un problema real de tu comunidad y construye una solución tecnológica durante un fin de semana lleno de adrenalina, pizza y código.",
    icon: Code,
    color: "from-brand-dark/20 to-transparent",
    iconColor: "text-brand-dark",
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
      
      {/* Fondo decorativo abstracto */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand-salmon/5 blur-[120px]"></div>
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-ieee/5 blur-[120px]"></div>
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* Hero de Eventos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-salmon/20 shadow-sm text-sm font-bold text-brand-salmon uppercase tracking-widest mb-2">
            <Calendar size={16} /> Agenda 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-dark tracking-tight">
            Próximos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-ieee to-brand-salmon">Encuentros</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-brown/80 max-w-2xl mx-auto font-sans">
            Únete a nuestras actividades. Desde charlas relajadas hasta sesiones de código intenso.
          </p>
        </motion.div>

        {/* Lista de Eventos (Grid) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-8 md:gap-12"
        >
          {publicEvents.map((event) => {
            const IconComponent = event.icon;
            
            return (
              <motion.div 
                key={event.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="relative group bg-white/80 backdrop-blur-xl border border-brand-steel/30 rounded-[2rem] p-6 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12"
              >
                {/* Degradado de fondo específico por evento */}
                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${event.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0`}></div>

                {/* Columna Izquierda: Icono gigante */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-28 h-28 md:w-40 md:h-40 rounded-full bg-white border-8 border-white shadow-xl flex items-center justify-center relative overflow-hidden group-hover:rotate-6 transition-transform duration-500`}>
                    <div className={`absolute inset-0 bg-gradient-to-b ${event.color} opacity-50`}></div>
                    <IconComponent className={`w-12 h-12 md:w-16 md:h-16 ${event.iconColor} relative z-10`} />
                  </div>
                </div>

                {/* Columna Derecha: Información */}
                <div className="relative z-10 flex-1 w-full text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-brand-dark">
                      {event.title}
                    </h2>
                    <span className="inline-block px-3 py-1 bg-zinc-100 text-zinc-600 font-bold text-xs uppercase tracking-widest rounded-full whitespace-nowrap self-center md:self-auto">
                      {event.tag}
                    </span>
                  </div>

                  <p className="text-brand-brown/80 font-sans text-base md:text-lg mb-6 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 font-bold text-sm text-brand-dark">
                    <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-white shadow-sm">
                      <Calendar className={`w-4 h-4 ${event.iconColor}`} />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-white shadow-sm">
                      <Clock className={`w-4 h-4 ${event.iconColor}`} />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-white shadow-sm">
                      <MapPin className={`w-4 h-4 ${event.iconColor}`} />
                      {event.location}
                    </div>
                  </div>
                </div>
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
          <p className="text-brand-brown font-medium mb-6">
            ¿Ya eres parte de la comunidad?
          </p>
          <a href="/login" className="inline-flex items-center justify-center px-8 py-3.5 font-bold text-brand-dark bg-transparent border-2 border-brand-dark rounded-xl hover:bg-brand-dark hover:text-white transition-all shadow-sm active:scale-95">
            Ir a mi Dashboard
          </a>
        </motion.div>

      </div>
    </div>
  );
}