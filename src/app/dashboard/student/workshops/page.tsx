import { getActiveWorkshops } from '@/lib/workshops/actions';
import { createClient } from '@/lib/supabase/server';
import EnrollButton from './EnrollButton';

export default async function StudentWorkshopsPage() {
  const workshops = await getActiveWorkshops();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Traemos los IDs de los talleres a los que este alumno ya está inscrito
  const { data: userEnrollments } = await supabase
    .from('enrollments')
    .select('workshop_id')
    .eq('user_id', user?.id);

  // Creamos un Set para buscar más rápido
  const enrolledWorkshopIds = new Set(userEnrollments?.map(e => e.workshop_id) || []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black font-sans text-brand-ieee">Talleres Disponibles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {workshops.map((workshop) => {
          // Verificamos si el usuario ya está en este taller específico
          const isEnrolled = enrolledWorkshopIds.has(workshop.id);

          return (
            <div key={workshop.id} className="bg-white border border-brand-steel/20 p-6 rounded-xl hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-brand-dark">{workshop.title}</h3>
                  {isEnrolled && (
                    <span className="bg-brand-mint/20 text-brand-dark text-xs font-bold px-2 py-1 rounded-full border border-brand-mint/50">
                      Inscrito
                    </span>
                  )}
                </div>
                <p className="text-brand-dark/70 text-sm mb-4 line-clamp-3">{workshop.description}</p>
              </div>
              
              {/* Aquí insertamos nuestro nuevo botón inteligente */}
              <EnrollButton workshopId={workshop.id} isEnrolled={isEnrolled} />
            </div>
          );
        })}

        {workshops.length === 0 && (
          <div className="col-span-full p-12 text-center border border-dashed border-zinc-300 rounded-xl">
            <p className="text-zinc-500 font-semibold">No hay talleres disponibles en este momento.</p>
          </div>
        )}

      </div>
    </div>
  );
}