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
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-zinc-900">Requisitos y Herramientas</h2>
        <p className="text-zinc-500 text-sm">Selecciona el hardware, software o lenguaje necesario para esta clase.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {availableTools.map((tool) => {
          const isSelected = selectedTools.includes(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                isSelected ? 'border-black bg-zinc-50 ring-1 ring-black' : 'border-zinc-200 hover:border-zinc-300 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-black border-black text-white' : 'border-zinc-300'}`}>
                {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M3 7.5L5.5 10L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 leading-tight">{tool.name}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{tool.category}</p>
              </div>
            </button>
          );
        })}
        {availableTools.length === 0 && (
          <p className="text-sm text-zinc-500 italic col-span-full">No has agregado herramientas a tu inventario aún.</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar Requisitos'}
        </button>
      </div>
    </div>
  );
}