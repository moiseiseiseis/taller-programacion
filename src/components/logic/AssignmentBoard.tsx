'use client';

import { Check } from 'lucide-react';
import type { AssignmentAnswer, AssignmentBoard as AssignmentBoardType } from '@/lib/logicPuzzle/types';

export default function AssignmentBoard({
  boards,
  answer,
  onToggle,
}: {
  boards: AssignmentBoardType[];
  answer: AssignmentAnswer;
  onToggle: (boardId: string, entityId: string, optionId: string) => void;
}) {
  return (
    <div className="space-y-6">
      {boards.map((board) => (
        <div key={board.id} className="space-y-2">
          {board.title && <h4 className="text-sm font-bold text-brand-beige">{board.title}</h4>}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left text-xs font-bold text-[#6f6f68] uppercase tracking-wider p-2"></th>
                  {board.options.map((option) => (
                    <th
                      key={option.id}
                      className="text-center text-xs font-bold text-[#9c9c94] p-2 whitespace-nowrap"
                    >
                      {option.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {board.entities.map((entity) => (
                  <tr key={entity.id} className="border-t border-brand-terminal-border">
                    <td className="text-sm font-semibold text-brand-beige p-2 whitespace-nowrap">
                      {entity.label}
                    </td>
                    {board.options.map((option) => {
                      const assigned = answer[board.id]?.[entity.id] === option.id;
                      return (
                        <td key={option.id} className="text-center p-2">
                          <button
                            type="button"
                            onClick={() => onToggle(board.id, entity.id, option.id)}
                            aria-label={`${entity.label}: ${option.label}`}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center mx-auto transition-colors ${
                              assigned
                                ? 'bg-brand-mint text-[#0f1a15] border-brand-mint'
                                : 'border-brand-terminal-border bg-black/20 hover:bg-black/40 text-transparent'
                            }`}
                          >
                            <Check size={14} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
