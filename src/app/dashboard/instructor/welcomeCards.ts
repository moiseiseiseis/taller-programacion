import type { WelcomeCard } from '@/components/dashboard/WelcomeCarousel';

export const INSTRUCTOR_WELCOME_CARDS: WelcomeCard[] = [
  {
    icon: 'BookOpen',
    title: 'Gestión de Talleres',
    description:
      'Crea talleres, módulos y lecciones. Cada lección puede ser teoría, práctica, quiz, minijuego de terminal, ejercicios de Python, acertijo de lógica o ejercicio reflexivo.',
    accent: '#9BCCB1',
  },
  {
    icon: 'Users',
    title: 'Alumnos Inscritos',
    description: 'Consulta quién está inscrito en cada uno de tus talleres.',
    accent: '#9DB6D3',
  },
  {
    icon: 'ClipboardCheck',
    title: 'Entregas Pendientes',
    description: 'Revisa y califica las prácticas y ejercicios reflexivos que envían los alumnos.',
    accent: '#D5615B',
  },
  {
    icon: 'FileText',
    title: 'Blog',
    description: 'Publica artículos con imágenes y video para la comunidad.',
    accent: '#C2D3E4',
  },
  {
    icon: 'Calendar',
    title: 'Eventos',
    description: 'Organiza charlas y encuentros, y consulta quién confirmó asistencia.',
    accent: '#9BCCB1',
  },
  {
    icon: 'Trophy',
    title: 'Hackathon',
    description: 'Configura niveles y rúbrica de evaluación, califica equipos y consulta los resultados.',
    accent: '#D5615B',
  },
  {
    icon: 'Wrench',
    title: 'Herramientas',
    description: 'Administra el inventario de herramientas recomendadas para los alumnos.',
    accent: '#9DB6D3',
  },
];
