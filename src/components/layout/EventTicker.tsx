'use client';

import { motion } from 'framer-motion';

const upcomingEvents = [
  "Próximo evento: Hackathon cutlajo (invierno 2026)",
];

export default function EventTicker() {
  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-brand-steel/30 bg-brand-ieee/5 backdrop-blur-md relative py-3 shadow-inner my-8">
      <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-brand-beige to-transparent z-10"></div>
      <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-brand-beige to-transparent z-10"></div>
      
      <motion.div
        className="flex whitespace-nowrap w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {[...upcomingEvents, ...upcomingEvents].map((event, index) => (
          <div key={index} className="flex items-center px-6">
            <span className="font-sans font-bold text-sm text-brand-ieee uppercase tracking-widest">
              {event}
            </span>
            <span className="mx-6 text-brand-salmon text-lg font-black">✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}