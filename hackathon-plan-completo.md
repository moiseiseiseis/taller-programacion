# Hackathon — Taller de Programación
### Documento de diseño consolidado — Universidad de Guadalajara / IEEE Student Branch

---

## 1. Visión general

Hackathon de tres días (miércoles a viernes) ligado al taller de programación para principiantes, diseñado con tres niveles autoseleccionables para acomodar distintos puntos de partida. El enfoque no es puramente competitivo: prioriza que cada estudiante construya algo real y pierda el miedo a lo técnico, mientras mantiene un componente de evaluación genuina en los niveles más avanzados.

**Instalaciones:** universidad, disponibles de 6:00 a.m. a 6:00 p.m., sin acceso nocturno. Se aprovechan espacios entre semana (miércoles–viernes) con apoyo de profesores para liberar horario de clases.

---

## 2. Estructura por niveles

### 2.1 Niveles y duración

| Nivel | Duración | Días | Naturaleza del reto |
|---|---|---|---|
| Principiante | Medio día (~9am–3pm) | Miércoles | Guiado, con scaffolding fuerte. Objetivo: que todos terminen algo funcional. |
| Medio | Un día completo | Miércoles y jueves | Semi-abierto, objetivo claro sin scaffolding. |
| Avanzado | Tres días | Miércoles a viernes | Abierto, cercano a un hackathon tradicional. |

Selección de nivel: autoseleccionable por el propio estudiante, ya sea por menú informativo o por un test de 15 preguntas que sugiere un nivel (ver sección 6).

### 2.2 Mentores y jurado

- Mentores fijos por nivel (no rotan): desarrollan más paciencia y mejores explicaciones para el perfil específico de su nivel.
- Jurado: se registra en la plataforma por nivel a calificar, con rol `instructor`.
- Premiación separada por nivel — evita que un principiante compita directamente contra un estudiante avanzado.

---

## 3. Cronograma

### 3.1 Principiante — Miércoles

| Fase | Momento |
|---|---|
| Kickoff conjunto (todos los niveles) | Miércoles, 30–45 min |
| Desarrollo con IA permitida | ~4 horas, con scaffolding y mentor fijo |
| Demo simple (sin live coding forzado) | 2–3 min por equipo, sin interrogatorio técnico |
| Evaluación | Se define el mismo día, no se anuncia hasta el viernes |

### 3.2 Medio — Miércoles y jueves

| Fase | Momento |
|---|---|
| Kickoff conjunto | Miércoles |
| Desarrollo con IA permitida | Resto de miércoles + jueves por la mañana |
| Live coding sin IA (pantalla proyectada) | Jueves por la tarde — 2 pedidos de dificultad media |
| Pitch corto | 3 min ante jueces de Medio |
| Evaluación | Jueves por la noche, no se anuncia aún |

### 3.3 Avanzado — Miércoles a viernes

| Fase | Momento |
|---|---|
| Kickoff conjunto | Miércoles |
| Desarrollo con IA permitida | Miércoles y jueves completos |
| Live coding sin IA (pantalla proyectada) | Viernes por la mañana — 3 pedidos de dificultad creciente, tiempo límite por pedido |
| Pitch + interrogatorio en vivo | 5 min pitch + preguntas de jueces sobre arquitectura |
| Evaluación | En vivo, el mismo día de la ceremonia |

### 3.4 Ceremonia de cierre — Viernes por la tarde (todos presentes)

- Pitches en vivo de Avanzado (momento de mayor energía del evento).
- Anuncio de resultados en orden: Principiante → Medio → Avanzado.
- Premiación y cierre.

---

## 4. Uso de IA durante el hackathon

**Regla central:** la IA generativa (cualquier asistente que genere código a partir de una instrucción en lenguaje natural — Claude Code, Copilot, ChatGPT, etc.) está permitida sin restricción durante la fase de desarrollo, y prohibida durante la fase de live coding. En vez de intentar diseñar retos "a prueba de IA", se cambia el momento en que se permite su uso.

### 4.1 Mecanismo de fiscalización

- Durante el live coding, el equipo conecta su computadora a un proyector o pantalla frente a jueces y compañeros.
- Regla explícita: todo lo que se use para resolver el reto debe estar visible en la pantalla proyectada, todo el tiempo — no solo el editor de código, sino cualquier terminal, navegador u otra ventana.
- Esto cubre el hueco de asistentes que corren en terminal (como Claude Code), no solo los que viven en un editor con interfaz visual.
- El celular u otro dispositivo fuera de la pantalla proyectada se asume, por regla explícita, que no se usa para resolver el reto — si se rompe esta regla, es un incumplimiento claro, no una zona gris.
- La visibilidad pública es en sí misma un disuasivo: usar una IA en vivo frente a jueces y compañeros conlleva un costo social además del reglamentario.

### 4.2 Diferenciación por nivel

La restricción de IA en vivo aplica a Medio y Avanzado. Principiante no tiene live coding forzado ni restricción de IA — su objetivo es quitar el miedo, no exponer bajo presión a quien recién empieza.

---

## 5. Rúbrica de evaluación

Escala: 1 a 10 en cada criterio, con anclas de referencia para mantener consistencia entre jueces. Los puntajes de los jueces de un mismo equipo se promedian (no se busca consenso en vivo, por rapidez). El total se normaliza sobre 100.

### 5.1 Anclas generales (aplican a cualquier criterio)

| Rango | Significado |
|---|---|
| 1–2 | No se intentó / completamente ausente |
| 3–4 | Intento visible pero con fallas importantes |
| 5–6 | Cumple lo mínimo esperado, sin más |
| 7–8 | Cumple bien, con algún detalle que destaca |
| 9–10 | Sobresaliente, va más allá de lo esperado |

### 5.2 Principiante — foco en completar y perder el miedo

| Criterio | Peso | Qué mide |
|---|---|---|
| Funcionalidad básica | 40% | ¿El proyecto hace lo mínimo que pedía el reto? |
| Esfuerzo y progreso visible | 25% | ¿Se nota avance desde el scaffolding inicial, aunque no esté perfecto? |
| Claridad al explicar qué hicieron | 20% | ¿Pueden contar, en sus palabras, qué construyeron? |
| Trabajo en equipo | 15% | ¿Se ve colaboración real, no una sola persona cargando todo? |

*Sin criterio de defensa técnica en este nivel — sería contraproducente para su objetivo.*

### 5.3 Medio — foco en comprensión funcional

| Criterio | Peso | Qué mide |
|---|---|---|
| Funcionalidad del proyecto | 30% | ¿Cumple el reto de forma completa? |
| Live coding (sin IA) | 30% | ¿Resolvieron los 2 pedidos? ¿Con cuánta ayuda del mentor vs. solos? |
| Pitch y claridad | 20% | ¿Explican decisiones básicas de diseño, no solo "qué hace"? |
| Calidad del código | 20% | Legibilidad y organización — buenas prácticas básicas, no arquitectura avanzada |

### 5.4 Avanzado — foco en dominio real y defensa técnica

| Criterio | Peso | Qué mide |
|---|---|---|
| Live coding (sin IA) | 35% | Criterio de mayor peso: revela si entendieron lo que construyeron |
| Interrogatorio de arquitectura | 25% | Respuestas a preguntas de jueces sobre decisiones tomadas |
| Funcionalidad y alcance del proyecto | 25% | Qué tan completo y ambicioso es lo logrado |
| Pitch | 15% | Claridad de comunicación, no solo dominio técnico |

### 5.5 Ejemplo de descriptor aplicado — "Live coding (sin IA)", nivel Avanzado

| Puntaje | Descriptor |
|---|---|
| 1–2 | No resolvió ningún pedido, o se quedó completamente bloqueado |
| 3–4 | Resolvió 1 de 3 pedidos, con ayuda significativa del mentor |
| 5–6 | Resolvió 2 de 3, navegando su código con algo de duda |
| 7–8 | Resolvió los 3, con soltura y explicando mientras codea |
| 9–10 | Resolvió los 3 rápido, explicó decisiones no obvias, manejó bien un pedido inesperado extra |

*Pendiente: construir un descriptor equivalente para cada criterio de cada nivel antes del evento, siguiendo este mismo formato.*

---

## 6. Criterio de desempate

Desempate en cascada, aplicado sin necesidad de reabrir la evaluación completa:

1. Gana el equipo con mayor puntaje en el criterio de mayor peso de ese nivel.
2. Si persiste el empate, gana quien tenga mayor puntaje en el segundo criterio de mayor peso.
3. Si el empate persiste (poco probable), el jurado del nivel tiene 5 minutos para decidir por consenso rápido, sin reabrir la evaluación completa.

| Nivel | 1er desempate | 2do desempate |
|---|---|---|
| Principiante | Funcionalidad básica (40%) | Esfuerzo y progreso visible (25%) |
| Medio | Live coding sin IA (30%)* | Funcionalidad del proyecto (30%) |
| Avanzado | Live coding sin IA (35%) | Interrogatorio de arquitectura (25%) |

*En Medio, Live coding y Funcionalidad empatan en peso (30% cada uno). Se prioriza Live coding como primer desempate por ser la señal menos influida por el uso de IA durante el desarrollo.*

---

## 7. Sistema de registro a eventos (reutilizable)

Diseñado como sistema genérico de inscripción a eventos desde el inicio, para reutilizarse en futuros eventos (por equipo o individuales), no solo este hackathon.

### 7.1 Modelo de datos

| Tabla | Propósito |
|---|---|
| `events` | id, nombre, slug, tipo (`team` / `individual` / `ambos`), tiene_niveles (bool), fecha_inicio, fecha_fin, estado |
| `event_levels` | event_id, nombre del nivel, descripción (contenido del menú informativo), orden |
| `teams` | event_id, nombre del equipo, level_id, creado_por, **máximo 6 miembros** (validado en Server Action) |
| `team_members` | team_id, user_id, rol (líder/miembro) |
| `event_registrations` | event_id, user_id, rol (`participant` / `judge` / `mentor`), level_id, team_id (nullable si es individual) |
| `level_quiz_questions` | question_id, **event_id** (específico de este evento por ahora; generalizar después es solo agregar preguntas para otro evento — no rediseñar tablas), texto, opciones, puntaje por opción hacia cada nivel |
| `level_quiz_responses` | user_id, event_id, respuestas, nivel_resultante (sugerido, editable) |
| `hackathon_submissions` | team_id, link (repo/deploy), submitted_at, editable hasta fecha límite |
| `hackathon_rubric_criteria` | nivel, nombre del criterio, peso — precargado desde la rúbrica (sección 5) |
| `hackathon_scores` | submission_id, judge_id, criterion_id, puntaje 1-10 |
| `level_change_requests` | id, user_id o team_id, event_id, nivel_actual, nivel_solicitado, estado (pendiente/aprobado/rechazado), revisado_por (instructor), revisado_at |

### 7.2 Flujo estudiante (equipo + nivel)

1. Entra a `/eventos/hackathon/registro`.
2. Elige cómo determinar su nivel: **(a)** menú informativo + autoselección, o **(b)** test de 15 preguntas.
3. Si toma el test: se calcula un nivel sugerido, pero se muestra como **sugerencia editable**, no como veredicto — puede autoseleccionar otro si no está de acuerdo.
4. Una vez definido el nivel, crea equipo o se une a uno existente **dentro de ese mismo nivel** (un equipo no puede mezclar niveles), respetando el máximo de 6 miembros.

### 7.3 Flujo instructor/juez

1. Entra a `/eventos/hackathon/registro-juez` (o mismo formulario con toggle de rol).
2. Selecciona el nivel que va a calificar.
3. Queda registrado en `event_registrations` con rol `judge` y su `level_id`.

### 7.4 Test de nivel (15 preguntas)

- Cada pregunta suma puntos hacia uno o más niveles (ej. "¿has usado control de versiones con Git?" suma fuerte a Medio/Avanzado, nada a Principiante).
- Al final, el nivel con mayor puntaje acumulado es la sugerencia.
- **Decisión:** específico de este hackathon por ahora (no un banco de preguntas genérico reutilizable) — se generalizará más adelante si se repite el formato en otros eventos.

### 7.5 Flujo de cambio de nivel

1. Estudiante ve un botón "Solicitar cambio de nivel" en su dashboard, después de registrarse.
2. Llena un motivo corto (opcional).
3. Se crea un registro `pendiente` en `level_change_requests`.
4. Un instructor ve una cola de solicitudes pendientes y aprueba/rechaza.
5. Si se aprueba: se actualiza `level_id` en `event_registrations`. **Si el estudiante tenía equipo, solo él sale del equipo** (el resto del equipo permanece en su nivel original) — debe unirse a un equipo del nuevo nivel o crear uno.

---

## 8. Dashboards

### 8.1 Dashboard Estudiante (por equipo)

- Ver su nivel asignado.
- Campo único: link del repo/deploy, editable hasta el cierre de esa fase.
- Estado: "no entregado" / "entregado — [fecha]" / "calificado" (una vez publicado).
- Botón "Solicitar cambio de nivel" (sujeto a aprobación de instructor).
- Después de la ceremonia: ver su puntaje desglosado por criterio + total.

### 8.2 Dashboard Instructor/Evaluador

- Filtro por nivel (solo ve equipos del nivel que le toca).
- Lista de equipos con su link de submission clickeable.
- Formulario de rúbrica: input 1-10 por criterio, con el descriptor de ancla visible (para no calificar a ojo).
- Cola de solicitudes de cambio de nivel pendientes de aprobar/rechazar.
- Guardar calificación — el promedio entre jueces se calcula automático cuando todos terminan.

### 8.3 Rol de evaluador

Los jueces se registran con el rol `instructor` ya existente en la plataforma — no se crea un rol nuevo. La UI diferencia entre un instructor "de taller" normal y uno actuando como juez de hackathon, ya sea con una sección adicional en el mismo dashboard o una ruta separada (`/instructor/hackathon`).

---

## 9. Pendientes (fuera de este documento)

- Presupuesto
- Souvenirs y premios concretos
- Plan de promoción e inscripción
- Diseño detallado de los retos técnicos por nivel (incluyendo los 2-3 pedidos de live coding por nivel)
- Descriptores completos de rúbrica para cada criterio de cada nivel (solo se ejemplificó uno)
- Wireframes/mockups concretos de las pantallas de registro y dashboards
- Esquema SQL de Supabase con políticas RLS
- Server Actions y lógica de negocio (validación de máximo de equipo, cálculo de nivel sugerido, promedio de calificaciones, etc.)
- Definición de las 15 preguntas del test de nivel y su tabla de puntajes por nivel
