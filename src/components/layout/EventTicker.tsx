'use client';

import { motion } from 'framer-motion';

const upcomingEvents = [
  "Próximo evento: Hackathon cutlajo (invierno 2026)",
];

export default function EventTicker() {
  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-brand-terminal-border bg-black/30 relative py-2.5 my-6">
      <div className="absolute top-0 left-0 bottom-0 w-10 md:w-16 bg-gradient-to-r from-brand-terminal to-transparent z-10"></div>
      <div className="absolute top-0 right-0 bottom-0 w-10 md:w-16 bg-gradient-to-l from-brand-terminal to-transparent z-10"></div>

      <motion.div
        className="flex whitespace-nowrap w-max font-mono text-xs md:text-sm"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {[...upcomingEvents, ...upcomingEvents].map((event, index) => (
          <div key={index} className="flex items-center px-5 md:px-6 gap-2.5 text-[#c8c8c0]">
            <span
              className="w-1.5 h-1.5 rounded-full bg-brand-mint shrink-0"
              style={{ boxShadow: '0 0 6px rgba(155,204,177,0.8)', animation: 'pulse-dot 1.8s ease-in-out infinite' }}
            />
            {event}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
