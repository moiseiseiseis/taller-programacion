export function TitlebarDots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-brand-salmon" />
      <span className="w-2.5 h-2.5 rounded-full bg-brand-highlight" />
      <span className="w-2.5 h-2.5 rounded-full bg-brand-mint" />
    </div>
  );
}

export default function TerminalWindow({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border border-brand-terminal-border bg-brand-terminal-panel overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-terminal-border bg-black/20">
        <TitlebarDots />
        <span className="font-mono text-[11px] text-[#6f6f68] ml-1.5">{label}</span>
      </div>
      {children}
    </div>
  );
}
