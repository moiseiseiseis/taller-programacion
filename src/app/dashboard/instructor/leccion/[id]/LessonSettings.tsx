'use client';

import { updateLessonMetadata, deleteLesson } from '../../actions';

export default function LessonSettings({ lesson }: { lesson: any }) {
  return (
    <div className="bg-brand-terminal-panel p-8 rounded-2xl border border-brand-terminal-border mb-8">
      <div className="mb-6 border-b border-brand-terminal-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-beige">Ajustes Generales</h2>
          <p className="text-[#9c9c94] text-sm">Cambia el nombre, el tipo de contenido o elimina la lección.</p>
        </div>

        {/* Botón de Elimina  */}
        <form action={deleteLesson} onSubmit={(e) => {
          if (!window.confirm('¿Estás seguro de que deseas eliminar esta lección? Se borrará todo su contenido y no se puede deshacer.')) {
            e.preventDefault();
          }
        }}>
          <input type="hidden" name="lesson_id" value={lesson.id} />
          <input type="hidden" name="module_id" value={lesson.module_id} />
          <button type="submit" className="text-brand-salmon bg-brand-salmon/10 hover:bg-brand-salmon/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Eliminar Lección
          </button>
        </form>
      </div>

      <form action={updateLessonMetadata} className="space-y-4">
        <input type="hidden" name="lesson_id" value={lesson.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Título de la lección</label>
            <input
              type="text"
              name="title"
              defaultValue={lesson.title}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-beige mb-1">Tipo de lección</label>
            <select
              name="type"
              defaultValue={lesson.type}
              required
              className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none"
            >
              <option value="theory">Teoría</option>
              <option value="practice">Práctica</option>
              <option value="challenge">Desafío</option>
              <option value="terminal">Minijuego de terminal</option>
              <option value="python">Ejercicios de Python</option>
              <option value="logic">Acertijo de lógica</option>
              <option value="reflection">Ejercicio reflexivo</option>
              <option value="algorithm_sim">Simulación de Algoritmia</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-beige mb-1">
            Abstract de la lección (opcional)
          </label>
          <textarea
            name="description"
            defaultValue={lesson.description || ''}
            rows={2}
            placeholder="Resumen corto que ve el alumno arriba del contenido de la lección."
            className="w-full rounded-lg border border-brand-terminal-border bg-black/30 px-4 py-3 text-brand-beige focus:border-brand-mint focus:ring-1 focus:ring-brand-mint outline-none placeholder:text-[#6f6f68]"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" className="py-2.5 px-6 rounded-lg text-sm font-bold text-brand-beige bg-black/30 hover:bg-black/40 transition-colors border border-brand-terminal-border">
            Actualizar Ajustes
          </button>
        </div>
      </form>
    </div>
  );
}