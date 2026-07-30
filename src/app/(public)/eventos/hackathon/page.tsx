'use client';

import { motion } from 'framer-motion';
import { Code, Users, Trophy } from 'lucide-react';
import TerminalWindow from '@/components/layout/TerminalWindow';

const HIGHLIGHTS = [
  {
    icon: Users,
    title: 'Tres niveles',
    description: 'Principiante, Medio y Avanzado — elegís el tuyo por menú informativo o con un test de 15 preguntas.',
  },
  {
    icon: Code,
    title: 'Equipos de hasta 6',
    description: 'Armá tu equipo o unite a uno ya existente dentro de tu mismo nivel.',
  },
  {
    icon: Trophy,
    title: 'Premiación por nivel',
    description: 'Cada nivel compite y se premia por separado — nadie compite fuera de su liga.',
  },
];

export default function HackathonLandingPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-block font-mono text-[13px] text-brand-steel">
            <span className="text-brand-mint mr-2">$</span>cat hackathon.log
          </div>
          <h1 className="font-mono text-4xl md:text-6xl font-bold leading-snug tracking-tight text-brand-beige">
            Hackathon
          </h1>
          <p className="text-lg md:text-xl text-[#9c9c94] max-w-2xl mx-auto font-sans">
            Tres días para construir algo real, sin importar de dónde arranques.
          </p>
        </motion.div>

        <TerminalWindow label="registro.sh" className="shadow-lg">
          <div className="p-6 md:p-10 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {HIGHLIGHTS.map((item) => (
                <div key={item.title} className="text-center sm:text-left">
                  <item.icon className="w-8 h-8 text-brand-mint mx-auto sm:mx-0 mb-3" />
                  <h2 className="font-bold text-brand-beige mb-1">{item.title}</h2>
                  <p className="text-sm text-[#9c9c94]">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center border-t border-brand-terminal-border pt-8">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 font-mono font-bold text-[#0f1a15] bg-brand-mint rounded-md transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Inscribirme →
              </a>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}
