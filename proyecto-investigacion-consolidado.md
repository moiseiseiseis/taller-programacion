# Proyecto de investigación — Ansiedad tecnológica y gestión educativa en la plataforma de talleres de programación

**Institución:** Centro Universitario de Tlajomulco (CUTLAJO), Universidad de Guadalajara / IEEE Student Branch
**Estado:** en desarrollo — MVP de 5 talleres, primera cohorte piloto (20+ estudiantes interesados)
**Última actualización:** julio 2026

---

## 1. Contexto y motivación

La plataforma de talleres de programación fue diseñada con un énfasis pedagógico explícito en reducir el miedo y la percepción de inaccesibilidad hacia lo técnico, dirigida a estudiantes que en muchos casos no tienen experiencia previa alguna con computadoras. Esa intención de diseño hoy no está respaldada por evidencia medible: no existe instrumentación que confirme si el miedo efectivamente cambia a lo largo del recorrido del estudiante, ni documentación formal de las decisiones de diseño curricular que sostienen esa intención.

Este documento consolida el trabajo de fundamentación realizado hasta ahora y define los objetivos, alcance y hoja de ruta del proyecto de investigación que corre en paralelo al desarrollo de la plataforma.

## 2. Objetivos

### Objetivo general

Generar evidencia y documentación rigurosa, en dos frentes complementarios, que permitan sostener contribuciones académicas publicables a partir del diseño, implementación y operación de la plataforma: (a) un estudio de caso de gestión educativa institucional, y (b) el desarrollo y validación preliminar de un instrumento de medición de ansiedad tecnológica y hacia la programación, propio y en español, para poblaciones de principiantes absolutos.

### Objetivos específicos

1. Documentar de forma explícita y citable las decisiones de diseño curricular de la plataforma (secuenciación, metáforas estructurales por taller), actualmente existentes solo como conocimiento tácito del equipo.
2. Diseñar, validar en contenido, y aplicar en piloto un instrumento breve de ansiedad tecnológica/de programación, ajustado a una población heterogénea (estudiantes de cualquier carrera de CUTLAJO, no solo ingenierías).
3. Documentar el modelo de gobernanza y coordinación institucional entre la Universidad de Guadalajara e IEEE Student Branch que sostiene el desarrollo y operación de la plataforma.
4. Establecer la infraestructura técnica mínima (esquema de datos, disparadores de aplicación) necesaria para recolectar evidencia de forma sostenida a lo largo de las siguientes cohortes.
5. Explorar, según la evidencia que se acumule durante el año, la viabilidad de un estudio de efecto preliminar sobre el cambio en ansiedad asociado al recorrido por los talleres.

## 3. Líneas de contribución académica identificadas

Del análisis inicial se identificaron varias direcciones posibles; se decidió priorizar dos, que son independientes en insumos pero se refuerzan mutuamente:

- **Gestión educativa institucional** — estudio de caso (n=1 institución) sobre cómo una universidad pública y una organización profesional coordinan gobernanza, contenido y tecnología para sostener un modelo de enseñanza no tradicional, sin depender de plataformas comerciales. Contribución de tipo cualitativo, no depende de datos de estudiantes ni de tamaño de muestra.
- **Instrumento de medición** — desarrollo y validación preliminar de una escala en español para ansiedad tecnológica y de programación en principiantes absolutos, combinando dos tradiciones de investigación (ansiedad tecnológica general y ansiedad de programación específica) que no se encontraron combinadas en la literatura revisada para este perfil de población.

Otras direcciones quedaron identificadas pero no priorizadas por ahora: paper de diseño curricular para venues de CS education (SIGCSE/ICER/IEEE FIE-EDUCON), paper metodológico sobre metáforas estructurales generalizables, y posible ruta de tesis si aplica a futuro.

## 4. Gaps identificados en la auditoría técnica (resumen)

La auditoría de la plataforma (realizada con Claude Code) identificó los siguientes gaps, ordenados por costo de resolución:

| Gap | Estado | Costo de resolución |
|---|---|---|
| Justificación pedagógica de decisiones de diseño no existe en ningún artefacto del repositorio (solo en conversaciones pasadas) | Crítico | Bajo — es trabajo de documentación, no de ingeniería |
| No existe instrumentación de percepción/encuesta en el esquema de datos | Confirmado | Medio — requiere una tabla nueva y lógica de disparo |
| No existe grupo de comparación/línea base para afirmaciones de efecto | Confirmado | Alto — requiere meses y variantes de contenido |
| No existe población real de estudiantes (solo cuentas de desarrollo) | Confirmado | Depende del calendario institucional, no de ingeniería |
| Dos talleres en producción sin documentar y con evaluación incompleta | Hallazgo colateral | Prioridad operativa, fuera del alcance de este documento |

## 5. Por qué se decidió construir un instrumento propio en vez de traducir uno existente

Se revisaron dos familias de instrumentos ya validados:

- **Programming Anxiety Scale** (Yıldırım y Özdener, 2022) — validada con 392 estudiantes universitarios turcos con experiencia previa programando; mide ansiedad frente a comparación con compañeros más hábiles y manejo de errores de código ya escrito. No cubre el momento anterior a escribir la primera línea de código.
- **Short Computer Anxiety Scale** (Lester, Yang y James, 2005) y literatura sobre tecnofobia en poblaciones sin experiencia previa (p. ej. Older Adults' Technophobia Scale, N=42) — mide un constructo más amplio, más cercano al perfil real de la población (estudiantes que pueden no haber usado una computadora antes).

Dado que la cohorte real combina ambos perfiles (desde estudiantes sin experiencia técnica hasta estudiantes de ingeniería con exposición previa), se optó por un instrumento propio compuesto de dos bloques, siguiendo la recomendación metodológica estándar de que adaptar/reutilizar instrumentos existentes es preferible a crear uno nuevo *salvo* cuando ninguno se ajusta al contexto o población objetivo (Streiner, Norman y Cairney, 2015).

## 6. Estructura del instrumento

**Bloque A — Ansiedad tecnológica general** (6 ítems). Aplica a cualquier estudiante desde su primer contacto con la plataforma, incluso sin experiencia técnica previa.

**Bloque B — Ansiedad específica de programación** (8 ítems + 1 opcional pendiente de decisión). Aplica una vez que el estudiante ha completado su primer taller de código.

Escala de respuesta: Likert de 5 puntos (1 = Totalmente en desacuerdo — 5 = Totalmente de acuerdo). Ambos bloques incluyen ítems en sentido inverso para reducir respuesta automática.

### 6.1 Ítems — Bloque A (ansiedad tecnológica general)

| # | Ítem |
|---|---|
| A1 | Me pongo nervioso/a cuando tengo que usar una computadora para hacer algo que no conozco. |
| A2 | Siento que podría "romper algo" si toco el botón equivocado en una computadora. |
| A3 | Evito usar programas o aplicaciones nuevas por miedo a cometer un error grave. |
| A4 | Me siento incómodo/a pidiendo ayuda cuando no sé cómo usar un programa. |
| A5 *(inv.)* | Me siento cómodo/a explorando una computadora aunque no sepa exactamente qué hace cada botón. |
| A6 | Prefiero que otra persona haga por mí las tareas que requieren usar una computadora. |

### 6.2 Ítems — Bloque B (ansiedad específica de programación)

| # | Ítem |
|---|---|
| B1 | Me preocupa no entender las instrucciones cuando tengo que programar algo. |
| B2 | Siento que no soy capaz de aprender a programar, sin importar cuánto me esfuerce. |
| B3 | Cuando mi código no funciona, siento que es porque no sirvo para esto, más que por un error normal de aprendizaje. |
| B4 | Me pongo ansioso/a cuando aparece un mensaje de error que no entiendo. |
| B5 | Me da miedo mostrar mi código a otra persona (compañero/a o instructor/a). |
| B6 *(inv.)* | Siento que puedo pedir ayuda cuando algo en mi código no funciona, sin sentirme mal por eso. |
| B7 | Me preocupa que mis compañeros/as piensen que soy torpe con la tecnología. |
| B8 *(inv.)* | Aunque cometa errores al programar, siento que es parte normal de aprender. |
| B9 *(opcional, pendiente)* | Me siento menos capaz cuando veo que otros compañeros programan con más facilidad que yo. |

### 6.3 Ítem adicional de validez concurrente (fuera de la escala Likert, aplicado junto al Bloque A en T0)

> "¿Cuánta experiencia previa tienes con computadoras y/o programación?" — Escala 1 (Ninguna) a 5 (Mucha).

## 7. Diseño de aplicación — basado en eventos, no en calendario

Dado que los estudiantes toman los talleres en el orden que eligen, la aplicación se activa por eventos de la experiencia individual:

| Momento | Disparador | Qué se aplica |
|---|---|---|
| T0 | Primer inicio de sesión en la plataforma, sin importar el taller elegido | Bloque A + ítem de experiencia previa |
| T1 | Primera vez que el estudiante completa un taller de código (Python o Algoritmia) | Bloque A + Bloque B |
| T2 | Fecha de cierre del periodo del MVP (fecha fija a definir con la institución) | Bloque A + Bloque B |

Los talleres de Fundamentos de Computación, Lógica y Metacognición no requieren punto propio de aplicación, ya que no introducen código.

## 8. Validación de contenido (previo a cualquier aplicación)

Panel de 3-5 expertos (docentes del área, idealmente con formación en educación o psicología), usando el método de Razón de Validez de Contenido (CVR) de Lawshe (1975):

1. Cada experto califica cada ítem como Esencial (E), Útil pero no esencial (U), o No necesario (N).
2. `CVR = (ne − N/2) / (N/2)`, donde *ne* = número de expertos que califican el ítem como esencial, *N* = total de expertos.
3. Umbrales de referencia: N=3 requiere acuerdo total; N=5 ≈ 0.49; N=7 ≈ 0.71; N=9 ≈ 0.78.
4. Ítems por debajo del umbral se revisan en redacción o se eliminan antes de aplicar a la primera cohorte.

## 9. Qué se espera de la primera cohorte (20-30 estudiantes) — límites honestos

**Alcanzable:**
- Confiabilidad interna preliminar (alfa de Cronbach) del instrumento completo y de cada bloque.
- Identificación de ítems con baja correlación ítem-total.
- Comparación descriptiva entre perfiles de carrera (técnica vs. no técnica).
- Primer vistazo al cambio T0→T1→T2 dentro de cada estudiante.

**No alcanzable todavía:**
- Análisis factorial confirmatorio robusto (requiere 100-400 personas).
- Afirmaciones causales sólidas sobre el efecto del taller.

Este piloto se reporta explícitamente como **validación preliminar**, con la intención de acumular muestra combinada de cohortes futuras para una validación exploratoria más robusta hacia el cierre del año.

## 10. Requerimientos técnicos derivados (para la siguiente fase de desarrollo)

- Tabla nueva en el esquema de datos, tipo `anxiety_survey_responses` (user_id, momento [T0/T1/T2], carrera/facultad, respuestas en formato jsonb, timestamp).
- Bandera booleana por taller (`is_code_workshop`) para disparar automáticamente el Bloque B la primera vez que el estudiante completa un taller marcado como tal.
- Regla de backend: si el usuario completa por primera vez un taller con `is_code_workshop = true` y no ha respondido el Bloque B todavía → mostrar el cuestionario.
- Documentación pedagógica explícita por taller (ADR o README), pendiente como tarea prioritaria independiente de la parte técnica de la encuesta.

## 11. Consideraciones éticas

Aplicación voluntaria, con consentimiento informado explícito: los datos se usan con fines de investigación educativa y mejora del taller, las respuestas no afectan la calificación del estudiante, y la participación puede rechazarse sin consecuencia alguna. Datos anonimizados para cualquier análisis o reporte externo a la institución.

## 12. Hoja de ruta tentativa (horizonte de un año)

- **Meses 1-2:** validación de contenido del instrumento con panel de expertos; documentación pedagógica por taller (ADRs); avance en el paper de gestión educativa institucional (entrevistas con contraparte de UdeG/IEEE, recopilación de evidencia de gobernanza).
- **Meses 3-6:** implementación técnica de la infraestructura de encuesta; lanzamiento con la primera cohorte real; aplicación T0/T1; primeros datos piloto.
- **Meses 6-8:** aplicación T2 al cierre del MVP; análisis preliminar (confiabilidad, comparación por carrera); borrador del paper de instrumento (validación preliminar).
- **Meses 8-12:** aplicación en cohortes adicionales si el calendario institucional lo permite, para ampliar la muestra combinada; cierre del paper de gestión educativa institucional; evaluación de viabilidad de un estudio de efecto preliminar con la evidencia acumulada.

## 13. Pendientes abiertos

- Confirmar contra el artículo original de Yıldırım y Özdener (DOI: 10.21585/ijcses.v5i3.140) el número definitivo de ítems de la versión final publicada — fuentes secundarias citan tanto 14 como 11 ítems.
- Decidir con el panel de expertos si se incluye el ítem opcional B9 (comparación con compañeros más hábiles).
- Definir tamaño final del panel de expertos (se recomienda al menos 5, dado el umbral más permisivo frente a un panel de 3).
- Definir la fecha fija de cierre del MVP para el punto de aplicación T2.
- Resolver el estado de los dos talleres no documentados detectados en la auditoría técnica (fuera del alcance directo de este documento, pero con impacto en la credibilidad institucional del proyecto).

## Referencias

- Di Giacomo, D., Ranieri, J., D'Amico, M., Guerra, F., & Passafiume, D. (2019). Psychological Barriers to Digital Living in Older Adults: Computer Anxiety as Predictive Mechanism for Technophobia. *Behavioral Sciences*, 9(9), 96.
- Lawshe, C. H. (1975). A quantitative approach to content validity. *Personnel Psychology*, 28(4), 563–575.
- Lester, D., Yang, B., & James, S. (2005). A short computer anxiety scale. *Perceptual and Motor Skills*, 100(3), 964–968.
- Streiner, D. L., Norman, G. R., & Cairney, J. (2015). *Health Measurement Scales: A Practical Guide to Their Development and Use* (5th ed.). Oxford University Press.
- Yıldırım, O. G., & Özdener, N. (2022). Development and validation of the Programming Anxiety Scale. *International Journal of Computer Science Education in Schools*, 5(3), 17–34.
