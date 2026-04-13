'use client';

import { updateLessonMetadata, deleteLesson } from '../../actions';

export default function LessonSettings({ lesson }: { lesson: any }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm mb-8">
      <div className="mb-6 border-b border-zinc-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Ajustes Generales</h2>
          <p className="text-zinc-500 text-sm">Cambia el nombre, el tipo de contenido o elimina la lección.</p>
        </div>
        
        {/* Botón de Elimina  */}
        <form action={deleteLesson} onSubmit={(e) => {
          if (!window.confirm('¿Estás seguro de que deseas eliminar esta lección? Se borrará todo su contenido y no se puede deshacer.')) {
            e.preventDefault();
          }
        }}>
          <input type="hidden" name="lesson_id" value={lesson.id} />
          <input type="hidden" name="module_id" value={lesson.module_id} />
          <button type="submit" className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Eliminar Lección
          </button>
        </form>
      </div>

      <form action={updateLessonMetadata} className="space-y-4">
        <input type="hidden" name="lesson_id" value={lesson.id} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-1">Título de la lección</label>
            <input
              type="text"
              name="title"
              defaultValue={lesson.title}
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-black focus:ring-1 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-900 mb-1">Tipo de lección</label>
            <select
              name="type"
              defaultValue={lesson.type}
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-black focus:ring-1 outline-none bg-white"
            >
              <option value="theory">Teoría</option>
              <option value="practice">Práctica</option>
              <option value="challenge">Desafío</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button type="submit" className="py-2.5 px-6 rounded-lg text-sm font-bold text-black bg-zinc-100 hover:bg-zinc-200 transition-colors border border-zinc-200">
            Actualizar Ajustes
          </button>
        </div>
      </form>
    </div>
  );
}