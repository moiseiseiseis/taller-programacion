'use client';

export default function ChoiceCard({
  options,
  selected,
  onSelect,
}: {
  options: { id: string; label: string }[];
  selected: string | null;
  onSelect: (optionId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
            selected === option.id
              ? 'bg-brand-mint/10 border-brand-mint text-brand-mint'
              : 'border-brand-terminal-border bg-black/20 text-brand-beige hover:bg-black/40'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
