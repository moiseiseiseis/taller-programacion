'use client';

import { useEffect, useRef, useState } from 'react';

export type TerminalLine = {
  prompt: string;
  command: string;
  output: string;
  isError: boolean;
};

export default function Terminal({
  lines,
  currentPrompt,
  onSubmit,
  disabled,
}: {
  lines: TerminalLine[];
  currentPrompt: string;
  onSubmit: (command: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const pastCommands = lines.map((l) => l.command).filter(Boolean);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value);
    setValue('');
    setHistoryIndex(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pastCommands.length === 0) return;
      const nextIndex = historyIndex === null ? pastCommands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setValue(pastCommands[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= pastCommands.length) {
        setHistoryIndex(null);
        setValue('');
      } else {
        setHistoryIndex(nextIndex);
        setValue(pastCommands[nextIndex]);
      }
    }
  }

  return (
    <div
      className="bg-black rounded-xl overflow-hidden border border-brand-terminal-border flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="bg-black/40 px-4 py-2.5 flex items-center gap-2 border-b border-brand-terminal-border">
        <span className="w-3 h-3 rounded-full bg-brand-salmon" />
        <span className="w-3 h-3 rounded-full bg-brand-highlight" />
        <span className="w-3 h-3 rounded-full bg-brand-mint" />
      </div>

      <div ref={scrollRef} className="p-4 h-72 overflow-y-auto font-mono text-sm space-y-1">
        {lines.map((line, i) => (
          <div key={i}>
            <div className="text-brand-mint">
              <span className="text-[#6f6f68]">{line.prompt}</span> {line.command}
            </div>
            {line.output && (
              <div className={line.isError ? 'text-brand-salmon whitespace-pre-wrap' : 'text-[#c8c8c0] whitespace-pre-wrap'}>
                {line.output}
              </div>
            )}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-[#6f6f68]">{currentPrompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-brand-mint outline-none disabled:opacity-50"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
