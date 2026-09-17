// Ítems de la encuesta de experiencia de usuario (UX). A diferencia del
// instrumento de ansiedad tecnológica (src/lib/anxietySurvey/items.ts), este
// mide fricción/claridad de la interfaz de cada taller, no ansiedad. Cada
// momento tiene su propio set de ítems (no son bloques que se combinan).

export type UxSurveyItem = {
  id: string;
  text: string;
};

export const FIRST_LESSON_ITEMS: UxSurveyItem[] = [
  { id: 'primera_leccion_facil', text: 'Entender qué tenía que hacer en este primer ejercicio fue fácil.' },
  { id: 'instrucciones_suficientes', text: 'Las instrucciones fueron suficientes para empezar sin sentirme perdido/a.' },
  { id: 'plataforma_comoda', text: 'Me sentí cómodo/a usando la plataforma en esta primera lección.' },
];
export const FIRST_LESSON_COMMENT_LABEL = '¿Qué fue lo más confuso al empezar? (opcional)';

export const WORKSHOP_COMPLETE_ITEMS: UxSurveyItem[] = [
  { id: 'dificultad', text: 'Este taller me resultó difícil de resolver.' },
  { id: 'claridad_instrucciones', text: 'Las instrucciones y ejemplos de los ejercicios fueron claros y suficientes para saber qué hacer.' },
  { id: 'tiempo_razonable', text: 'El tiempo que me tomó resolver este taller me pareció razonable.' },
  { id: 'intencion_continuar', text: 'Después de esta experiencia, tengo ganas de seguir con el siguiente taller.' },
];
export const WORKSHOP_COMPLETE_COMMENT_LABEL = '¿Qué fue lo más difícil o confuso de este taller? (opcional)';

export const PATH_COMPLETE_ITEMS: UxSurveyItem[] = [
  { id: 'dificultad_general_adecuada', text: 'En general, la ruta completa tuvo una dificultad adecuada para mi nivel.' },
  { id: 'transicion_entre_talleres', text: 'Pude avanzar de un taller a otro sin confundirme sobre qué debía hacer.' },
  { id: 'recomendaria', text: 'En general, recomendaría este programa a otra persona que quiere aprender a programar.' },
];
export const PATH_COMPLETE_COMMENT_LABEL = '¿Qué mejorarías de la experiencia completa? (opcional)';
