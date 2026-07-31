import type { WelcomeCard } from '@/components/dashboard/WelcomeCarousel';

export const STUDENT_WELCOME_CARDS: WelcomeCard[] = [
  {
    icon: 'BookOpen',
    title: 'Talleres',
    description:
      'Elige un taller del catálogo y avanza lección por lección. Algunos quizzes hay que aprobarlos para desbloquear la siguiente lección.',
    accent: '#9BCCB1',
  },
  {
    icon: 'TrendingUp',
    title: 'Mi Progreso',
    description: 'Sigue tu avance por taller, con el porcentaje de lecciones completadas.',
    accent: '#9DB6D3',
  },
  {
    icon: 'Award',
    title: 'Mis Calificaciones',
    description: 'Revisa tus resultados de quizzes y de los ejercicios calificados por el instructor.',
    accent: '#D5615B',
  },
  {
    icon: 'Wrench',
    title: 'Herramientas',
    description: 'Directorio de programas y recursos recomendados para cada taller.',
    accent: '#C2D3E4',
  },
  {
    icon: 'Calendar',
    title: 'Eventos',
    description: 'Regístrate a charlas y encuentros de la comunidad.',
    accent: '#9BCCB1',
  },
  {
    icon: 'Users',
    title: 'Comunidad',
    description: 'Comparte dudas y avances con otros estudiantes.',
    accent: '#9DB6D3',
  },
  {
    icon: 'Trophy',
    title: 'Hackathon',
    description: 'Elige tu nivel, arma equipo (o únete a uno) y participa en el hackathon.',
    accent: '#D5615B',
  },
];
