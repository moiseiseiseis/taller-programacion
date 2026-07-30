// Instrumento propio de ansiedad tecnológica/de programación
// (proyecto-investigacion-consolidado.md, secciones 6.1-6.3). Los ítems
// están fijos porque son parte de un instrumento en proceso de validación
// de contenido (panel de expertos, CVR) — no son contenido de taller
// editable desde el panel de instructor.
//
// `reverse` marca los ítems en sentido inverso (sección 6): se guarda la
// respuesta cruda tal como la marca el alumno; la inversión para análisis
// es responsabilidad de quien procese los datos después, no de este código.

export type SurveyItem = {
  id: string;
  text: string;
  reverse?: boolean;
};

export const BLOCK_A: SurveyItem[] = [
  { id: 'A1', text: 'Me pongo nervioso/a cuando tengo que usar una computadora para hacer algo que no conozco.' },
  { id: 'A2', text: 'Siento que podría "romper algo" si toco el botón equivocado en una computadora.' },
  { id: 'A3', text: 'Evito usar programas o aplicaciones nuevas por miedo a cometer un error grave.' },
  { id: 'A4', text: 'Me siento incómodo/a pidiendo ayuda cuando no sé cómo usar un programa.' },
  { id: 'A5', text: 'Me siento cómodo/a explorando una computadora aunque no sepa exactamente qué hace cada botón.', reverse: true },
  { id: 'A6', text: 'Prefiero que otra persona haga por mí las tareas que requieren usar una computadora.' },
];

// Sin B9: la sección 6.2 del documento lo deja "opcional, pendiente de
// decisión" del panel de expertos, no confirmado todavía.
export const BLOCK_B: SurveyItem[] = [
  { id: 'B1', text: 'Me preocupa no entender las instrucciones cuando tengo que programar algo.' },
  { id: 'B2', text: 'Siento que no soy capaz de aprender a programar, sin importar cuánto me esfuerce.' },
  {
    id: 'B3',
    text: 'Cuando mi código no funciona, siento que es porque no sirvo para esto, más que por un error normal de aprendizaje.',
  },
  { id: 'B4', text: 'Me pongo ansioso/a cuando aparece un mensaje de error que no entiendo.' },
  { id: 'B5', text: 'Me da miedo mostrar mi código a otra persona (compañero/a o instructor/a).' },
  {
    id: 'B6',
    text: 'Siento que puedo pedir ayuda cuando algo en mi código no funciona, sin sentirme mal por eso.',
    reverse: true,
  },
  { id: 'B7', text: 'Me preocupa que mis compañeros/as piensen que soy torpe con la tecnología.' },
  { id: 'B8', text: 'Aunque cometa errores al programar, siento que es parte normal de aprender.', reverse: true },
];

// Ítem de validez concurrente, fuera de la escala Likert 1-5 de A/B
// (sección 6.3): escala propia 1 (Ninguna) a 5 (Mucha), aplicado junto al
// Bloque A en T0.
export const EXPERIENCE_ITEM: SurveyItem = {
  id: 'experiencia_previa',
  text: '¿Cuánta experiencia previa tienes con computadoras y/o programación?',
};
