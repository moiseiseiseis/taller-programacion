'use client';

import { useState } from 'react';
import { updateLessonTools } from '../../actions';

export default function ToolSelector({ lessonId, availableTools, initialSelected }: { lessonId: string, availableTools: any[], initialSelected: string[] }) {
  const [selectedTools, setSelectedTools] = useState<string[]>(initialSelected);
  const [isSaving, setIsSaving] = useState(false);

  // Función para marcar o desmarcar una herramienta
  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLessonTools(lessonId, selectedTools);
      alert('¡Requisitos actualizados correctamente!');
    } catch (error) {
      alert('Hubo un error al guardar las herramientas.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-brand-beige">Requisitos y Herramientas</h2>
        <p className="text-[#9c9c94] text-sm">Selecciona el hardware, software o lenguaje necesario para esta clase.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {availableTools.map((tool) => {
          const isSelected = selectedTools.includes(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                isSelected ? 'border-brand-mint bg-brand-mint/10 ring-1 ring-brand-mint' : 'border-brand-terminal-border hover:border-brand-mint/40 bg-black/20'
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-brand-mint border-brand-mint text-[#0f1a15]' : 'border-brand-terminal-border'}`}>
                {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M3 7.5L5.5 10L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div>
                <p className="text-sm font-bold text-brand-beige leading-tight">{tool.name}</p>
                <p className="text-[10px] text-[#9c9c94] uppercase tracking-wider mt-0.5">{tool.category}</p>
              </div>
            </button>
          );
        })}
        {availableTools.length === 0 && (
          <p className="text-sm text-[#9c9c94] italic col-span-full">No has agregado herramientas a tu inventario aún.</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-mint text-[#0f1a15] px-6 py-2 rounded-lg font-bold hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {isSaving ? 'Guardando...' : 'Guardar Requisitos'}
        </button>
      </div>
    </div>
  );
}