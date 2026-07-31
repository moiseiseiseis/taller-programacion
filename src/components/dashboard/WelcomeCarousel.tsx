'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, BookOpen, TrendingUp, Award, Wrench, Calendar, Users, Trophy, ClipboardCheck, FileText } from 'lucide-react';

// Los íconos se resuelven acá adentro, no se reciben como prop: un componente
// de ícono (función) no es serializable cruzando el límite Server -> Client,
// así que welcomeCards.ts solo manda el nombre como string.
const ICONS = {
  BookOpen,
  TrendingUp,
  Award,
  Wrench,
  Calendar,
  Users,
  Trophy,
  ClipboardCheck,
  FileText,
};

export type WelcomeIconName = keyof typeof ICONS;

export type WelcomeCard = {
  icon: WelcomeIconName;
  title: string;
  description: string;
  accent: string;
};

export default function WelcomeCarousel({
  storageKey,
  title,
  subtitle,
  cards,
}: {
  storageKey: string;
  title: string;
  subtitle: string;
  cards: WelcomeCard[];
}) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(storageKey) === '1');
  }, [storageKey]);

  // null = todavía no se leyó localStorage (evita el flash de contenido que
  // se cierra solo); true = ya lo cerró antes.
  if (dismissed !== false) return null;

  function go(nextIndex: number) {
    setDirection(nextIndex > index ? 1 : -1);
    setIndex((nextIndex + cards.length) % cards.length);
  }

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (info.offset.x < -60) go(index + 1);
    else if (info.offset.x > 60) go(index - 1);
  }

  function dismiss() {
    window.localStorage.setItem(storageKey, '1');
    setDismissed(true);
  }

  const card = cards[index];
  const Icon = ICONS[card.icon];

  return (
    <div className="relative bg-brand-terminal-panel border border-brand-terminal-border rounded-2xl p-6 sm:p-8">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar bienvenida"
        className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#6f6f68] hover:text-brand-beige transition-colors z-10"
      >
        <X size={18} />
      </button>

      <div className="mb-6 pr-8">
        <h2 className="font-mono text-lg sm:text-xl font-bold text-brand-beige">{title}</h2>
        <p className="text-sm text-[#9c9c94] mt-1">{subtitle}</p>
      </div>

      <div className="min-h-[6rem] sm:min-h-[5.5rem]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            initial={{ x: direction > 0 ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -60 : 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex items-start gap-4 cursor-grab active:cursor-grabbing"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-black/30 border border-brand-terminal-border flex items-center justify-center shrink-0"
              style={{ boxShadow: `0 0 20px ${card.accent}33` }}
            >
              <Icon size={22} style={{ color: card.accent }} />
            </div>
            <div className="min-w-0 pt-1">
              <h3 className="font-bold text-brand-beige mb-1">{card.title}</h3>
              <p className="text-sm text-[#9c9c94] leading-relaxed">{card.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-terminal-border">
        <div className="flex items-center gap-2">
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ir a la tarjeta ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-brand-mint' : 'w-1.5 bg-[#4a4a44]'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Tarjeta anterior"
            className="p-1.5 rounded-lg border border-brand-terminal-border text-[#9c9c94] hover:text-brand-mint hover:border-brand-mint/40 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Siguiente tarjeta"
            className="p-1.5 rounded-lg border border-brand-terminal-border text-[#9c9c94] hover:text-brand-mint hover:border-brand-mint/40 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
