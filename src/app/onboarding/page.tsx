import { completeProfile } from './actions';
import SubmitButton from '@/components/ui/SubmitButton';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-zinc-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">
            Completa tu perfil
          </h2>
          <p className="text-zinc-500">
            Antes de inscribirte a los talleres, necesitamos conocer un poco más sobre ti.
          </p>
        </div>

        <form action={completeProfile} className="space-y-6">
          {/* Campo de Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-zinc-900 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
              placeholder="Ej. Ana García"
            />
          </div>

          {/* Campo de Carrera */}
          <div>
            <label htmlFor="career" className="block text-sm font-semibold text-zinc-900 mb-1">
              Carrera
            </label>
            <select
              name="career"
              id="career"
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors bg-white"
            >
              <option value="">Selecciona tu programa académico...</option>
              <option value="Ingeniería Biomédica">Ingeniería Biomédica</option>
              <option value="Ingeniería Mecatrónica">Ingeniería Mecatrónica</option>
              <option value="Enfermería">Enfermería</option>
              <option value="Terapia Física">Terapia Física</option>
              <option value="Médico Cirujano y Partero">Médico Cirujano y Partero</option>
              <option value="Otra">Otra</option>
            </select>
          </div>

          {/* Botón de Submit */}
          <SubmitButton
            pendingText="Guardando"
            className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Guardar y entrar a la plataforma
          </SubmitButton>
        </form>
        
      </div>
    </div>
  );
}