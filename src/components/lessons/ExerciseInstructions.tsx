'use client';

import { ListChecks } from 'lucide-react';

export default function ExerciseInstructions({
  items,
  title = 'Cómo resolver este ejercicio',
}: {
  items: string[];
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="not-prose flex gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
      <ListChecks className="text-brand-beige/70 shrink-0 mt-0.5" size={18} />
      <div className="text-sm text-[#c8c8c0]">
        <p className="font-bold text-brand-beige mb-1">{title}</p>
        <ul className="list-disc pl-4 space-y-1 marker:text-brand-mint">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
