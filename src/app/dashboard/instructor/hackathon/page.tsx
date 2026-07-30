import Link from 'next/link';

const LINKS = [
  {
    href: '/dashboard/instructor/hackathon/configuracion',
    title: 'Configuración',
    description: 'Datos del evento, niveles y preguntas del test de nivel.',
  },
  {
    href: '/dashboard/instructor/hackathon/juez',
    title: 'Registrarme como jurado',
    description: 'Elegí el nivel que vas a evaluar (o mentorear).',
  },
  {
    href: '/dashboard/instructor/hackathon/equipos',
    title: 'Ver equipos',
    description: 'Lista de equipos inscritos, filtrable por nivel.',
  },
  {
    href: '/dashboard/instructor/hackathon/calificar',
    title: 'Calificar equipos',
    description: 'Rúbrica ponderada de tu nivel — puntúa las entregas y mira el total agregado entre jueces.',
  },
  {
    href: '/dashboard/instructor/hackathon/cambios-nivel',
    title: 'Cambios de nivel',
    description: 'Aprueba o rechaza las solicitudes de cambio de nivel de los alumnos.',
  },
  {
    href: '/dashboard/instructor/hackathon/resultados',
    title: 'Resultados',
    description: 'Ranking por nivel con desempate en cascada — todos los niveles, no solo el tuyo.',
  },
];

export default function InstructorHackathonPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-mono text-3xl font-bold text-brand-beige">Hackathon</h1>
        <p className="text-[#9c9c94] mt-2">Panel de administración del hackathon.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-brand-terminal-panel p-6 rounded-2xl border border-brand-terminal-border hover:border-brand-mint/40 transition-colors"
          >
            <h2 className="text-lg font-bold text-brand-beige mb-2">{link.title}</h2>
            <p className="text-sm text-[#9c9c94]">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
