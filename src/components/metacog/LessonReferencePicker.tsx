'use client';

export default function LessonReferencePicker({
  availableLessons,
  value,
  onChange,
  label,
}: {
  availableLessons: { id: string; label: string }[];
  value: string | null;
  onChange: (lessonId: string | null) => void;
  label?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-brand-beige mb-1">
        {label ?? 'Lección de otro taller que estás usando (opcional)'}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
      >
        <option value="">Sin referencia específica</option>
        {availableLessons.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
