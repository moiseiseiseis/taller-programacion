# Taller de Algoritmia
### Temario basado en "Algorithms to Live By"

**Fuente base:** *Algorithms to Live By* (Brian Christian y Tom Griffiths, 2016).
El libro toma algoritmos reales de ciencias de la computación —optimización,
estructuras de datos, teoría de la probabilidad— y muestra que son, literalmente,
las mismas herramientas que usamos (bien o mal) para tomar decisiones cotidianas:
cuándo dejar de buscar pareja, qué guardar en tu clóset, cómo organizar tu bandeja
de entrada. Cada uno de sus 11 capítulos centrales se convierte en una unidad;
el capítulo de cierre del libro ("Computational Kindness") se convierte en el
proyecto integrador del taller.

Este taller es distinto a tu Módulo 1 (lógica sin código, basado en CS
Unplugged): ahí el foco era construir las habilidades básicas del pensamiento
computacional. Aquí el foco es mostrar que esas habilidades, llevadas a su
forma más rigurosa, ya están resolviendo decisiones humanas reales — es un
paso más avanzado y más directamente aplicable a la vida del alumno.

---

## Marco narrativo: el simulador de decisiones

Cada unidad presenta primero un dilema cotidiano reconocible (buscar
departamento, decidir qué restaurante probar, organizar un clóset) **antes**
de nombrar el algoritmo que lo resuelve formalmente — nunca al revés. La
práctica de cada unidad pide aplicar la estrategia óptima a una versión
simulada del dilema, y después trasladarla a una decisión real de la vida del
alumno. El proyecto de cierre (Unidad 12) no es un problema más — es rediseñar
un proceso real propio para que le facilite la vida a otra persona, usando
como mínimo tres algoritmos del taller.

---

## Unidad 1 — El problema de la secretaria: cuándo dejar de buscar

**Concepto:** parada óptima (*optimal stopping*) — la regla del 37%

**Dilema de entrada:** buscar departamento, pareja, o incluso estacionamiento:
¿en qué momento dejas de "seguir viendo opciones" y te quedas con la que tienes enfrente?

**Teoría:** por qué existe un punto matemáticamente óptimo entre "explorar
opciones para calibrar qué esperar" y "decidir ya" — la regla del 37% del
tiempo/opciones disponibles como punto de corte

**Práctica:** simulación con una secuencia de "candidatos" con valores
ocultos — el alumno decide cuándo detenerse siguiendo la regla, y se compara
contra detenerse antes o después, para ver por qué la regla gana en promedio

---

## Unidad 2 — Explorar vs. explotar

**Concepto:** el dilema explorar/explotar, el índice de Gittins

**Dilema de entrada:** ¿pruebas un restaurante nuevo o vuelves al que ya sabes
que te gusta? ¿Cuándo deja de valer la pena "probar cosas nuevas"?

**Teoría:** por qué la respuesta correcta depende del horizonte de tiempo
restante — probar cosas nuevas vale más cuando queda mucho tiempo para
aprovechar lo que descubras, y menos cuando el tiempo se acaba

**Práctica:** simulación tipo "bandido multi-brazo" simplificada — el alumno
elige entre opciones con recompensas desconocidas a lo largo de varias rondas,
y observa cómo cambia su propia estrategia conforme se acaban las rondas

---

## Unidad 3 — Ordenar: cuánto esfuerzo vale la pena

**Concepto:** algoritmos de ordenamiento y su costo

**Dilema de entrada:** ¿vale la pena organizar alfabéticamente tu librero, o
es más eficiente dejarlo desordenado y buscar cuando lo necesites?

**Teoría:** el costo de ordenar crece más rápido que el costo de buscar en
una lista pequeña o poco consultada — ordenar solo vale la pena cuando vas a
buscar muchas veces en esa misma colección

**Práctica:** calcular (de forma intuitiva, sin fórmulas complejas) el punto
de equilibrio entre "tiempo de ordenar" y "tiempo de buscar sin ordenar" para
distintos escenarios personales del alumno (correos, libros, archivos)

---

## Unidad 4 — Caché: qué guardar y qué desechar

**Concepto:** algoritmos de caché, política LRU (menos usado recientemente)

**Dilema de entrada:** tu clóset, tu escritorio, tu bandeja de entrada tienen
espacio limitado — ¿qué decides mantener a la mano y qué guardas lejos?

**Teoría:** la política "descarta lo que menos has usado recientemente" como
estrategia comprobadamente casi óptima, sin necesidad de predecir el futuro

**Práctica:** ejercicio con un "clóset" simulado de tamaño fijo y un flujo de
"usos" simulados — aplicar la política LRU y comparar contra desechar al azar

---

## Unidad 5 — Programar el tiempo: qué hacer primero

**Concepto:** algoritmos de planificación (scheduling), precrastinación

**Dilema de entrada:** tienes 5 pendientes con distintas urgencias y
duraciones — ¿por cuál empiezas?

**Teoría:** estrategias de planificación (la tarea más corta primero, la de
fecha límite más próxima primero) y cuándo cada una es mejor; qué es la
"precrastinación" (hacer lo fácil primero solo porque se siente productivo,
aunque no sea lo más urgente)

**Práctica:** dado un conjunto de pendientes con duración y fecha límite, el
alumno ordena su lista con cada estrategia y compara cuál minimiza el
"arrepentimiento" total

---

## Unidad 6 — Regla de Bayes: predecir con poca información

**Concepto:** probabilidad bayesiana, tasas base

**Dilema de entrada:** una película lleva 20 minutos y ya te aburre — ¿cuánto
falta probablemente para que mejore? ¿Vale la pena seguir viéndola?

**Teoría:** cómo combinar lo que ya sabes en general (tasa base) con la
evidencia nueva que tienes enfrente, en vez de predecir solo con una o con otra

**Práctica:** ejercicios de predicción con tasas base dadas (duración típica
de proyectos, de relaciones, de procesos) combinadas con evidencia parcial,
comparando la predicción bayesiana contra la intuición inicial del alumno

---

## Unidad 7 — Sobreajuste: cuándo dejar de pensar

**Concepto:** overfitting, navaja de Occam, parada temprana

**Dilema de entrada:** preparar una respuesta demasiado específica para una
entrevista (que falla en cuanto te preguntan algo distinto) vs. una respuesta
más general y flexible

**Teoría:** qué es "ajustar demasiado" una solución a un caso particular, por
qué eso la hace peor en la práctica, y por qué "más simple" suele ganarle a
"más detallado" cuando hay incertidumbre sobre lo que viene después

**Práctica:** el alumno identifica, en ejemplos dados (una rutina de estudio,
un currículum, un plan de viaje), dónde hay sobreajuste a un solo escenario y
propone una versión más generalizable

---

## Unidad 8 — Relajación: resolver una versión más fácil del problema

**Concepto:** relajación de restricciones

**Dilema de entrada:** un objetivo se siente imposible de planear ("quiero
cambiar de carrera") — ¿por dónde se empieza?

**Teoría:** la técnica de quitar temporalmente una restricción difícil del
problema (tiempo, dinero, certeza) para encontrar una solución aproximada, y
usar esa solución como punto de partida real

**Práctica:** el alumno toma un objetivo personal genuinamente complejo,
identifica qué restricción "relajaría" primero para encontrar un primer paso
concreto, y lo compara con intentar resolver el problema completo de una vez

---

## Unidad 9 — Aleatoriedad: cuándo dejar algo al azar

**Concepto:** algoritmos aleatorizados, recocido simulado (*simulated annealing*)

**Dilema de entrada:** llevas horas atorado decidiendo entre dos opciones casi
idénticas — ¿en qué momento lanzar una moneda es, literalmente, la mejor estrategia?

**Teoría:** por qué introducir algo de aleatoriedad ayuda a escapar de
decisiones estancadas o de óptimos locales, y por qué eso no es "rendirse",
es una estrategia formal con base matemática

**Práctica:** ejercicio de decisión simulada donde el alumno compara una
estrategia puramente determinista contra una con algo de aleatoriedad
introducida a propósito, viendo en qué casos la segunda encuentra mejores resultados

---

## Unidad 10 — Redes: cómo nos comunicamos

**Concepto:** protocolos de red, retroceso exponencial (*exponential backoff*)

**Dilema de entrada:** le escribiste a alguien y no te ha respondido — ¿cuándo
insistes, y con qué frecuencia, sin ser molesto ni desaparecer?

**Teoría:** cómo los sistemas de red resuelven el mismo problema (evitar
saturar una conexión) esperando cada vez más tiempo entre reintentos, y por
qué ese patrón es una estrategia razonable también para comunicación humana

**Práctica:** el alumno diseña su propio "calendario de seguimiento" para una
situación real (buscar trabajo, pedir información) usando el principio de
espera creciente entre intentos

---

## Unidad 11 — Teoría de juegos: decidir considerando a otros

**Concepto:** equilibrio de Nash, diseño de incentivos

**Dilema de entrada:** repartir tareas de casa, negociar un precio, decidir
quién cede en un desacuerdo — decisiones donde el resultado depende de lo que
la otra persona decida también

**Teoría:** qué es un equilibrio (nadie puede mejorar cambiando su decisión
en solitario) y por qué un equilibrio no siempre es el mejor resultado
posible para ambas partes — la diferencia entre "estable" y "óptimo"

**Práctica:** escenarios simples de decisión conjunta (tipo dilema del
prisionero simplificado) donde el alumno juega ambos roles y observa por qué
la estrategia "racional" individual no siempre da el mejor resultado colectivo

---

## Unidad 12 — Cierre: bondad computacional

**Fuente:** capítulo de conclusión del libro ("Computational Kindness")

**Concepto:** diseñar decisiones y sistemas que reducen la carga cognitiva de
otras personas, no solo la propia

**Teoría:** ejemplos del libro (dar opciones concretas en vez de preguntas
abiertas como "¿cuándo quieres que nos veamos?", que obligan a la otra
persona a hacer todo el cálculo) — la idea de que un buen algoritmo social no
solo te ayuda a ti, ayuda a quien interactúa contigo

**Proyecto integrador:** el alumno rediseña un proceso real de su vida
(cómo pide ayuda, cómo agenda reuniones, cómo delega tareas) aplicando al
menos tres algoritmos del taller a la vez, con el criterio explícito de que
la nueva versión debe facilitarle la vida a la otra persona involucrada, no
solo a él mismo

- No lleva quiz — lleva entrega de "antes y después" del proceso rediseñado,
  con justificación de qué algoritmos se usaron y por qué

---

## Resumen de progresión

| Unidad | Dilema cotidiano | Algoritmo/concepto |
|---|---|---|
| 1 | Buscar departamento/pareja | Parada óptima (37%) |
| 2 | Restaurante nuevo vs. conocido | Explorar/explotar |
| 3 | Organizar el librero | Costo de ordenar |
| 4 | Qué guardar en el clóset | Caché (LRU) |
| 5 | Qué pendiente hacer primero | Planificación |
| 6 | ¿Sigo viendo la película? | Regla de Bayes |
| 7 | Respuesta de entrevista muy específica | Sobreajuste |
| 8 | Objetivo que se siente imposible | Relajación |
| 9 | Atorado entre dos opciones | Aleatoriedad |
| 10 | No me responden el mensaje | Redes/backoff |
| 11 | Repartir tareas de casa | Teoría de juegos |
| 12 | Rediseñar un proceso propio | Síntesis: bondad computacional |

---

### Notas de diseño para la implementación

- **El orden del libro es también el orden pedagógico correcto aquí** — a
  diferencia de otros talleres donde reordenamos el material fuente, los
  capítulos de *Algorithms to Live By* ya están secuenciados por Christian y
  Griffiths de forma que cada uno se apoya ligeramente en el anterior
  (parada óptima y explorar/explotar comparten lógica de decisión secuencial,
  por ejemplo) — no hay necesidad de reordenar.
- **La Unidad 12 es el punto de mayor conexión entre todos tus talleres del
  "core primigenio"** — Lógica (razonamiento riguroso), Metacognición (cómo
  piensas sobre tu propio proceso) y Algoritmia (cómo decides) convergen
  naturalmente en "diseña un sistema que ayude a otros a decidir mejor". Vale
  la pena, si más adelante quieres un proyecto que cierre los cuatro talleres
  de golpe, construirlo a partir de esta unidad en vez de crear uno nuevo desde cero.
- **A diferencia del taller de Metacognición, aquí sí tiene sentido un
  componente de respuesta "correcta"** en varias unidades (la regla del 37%
  tiene un óptimo matemático real, igual que LRU o Bayes) — pero cada
  práctica se cierra igual con una aplicación personal abierta, para no
  perder el mismo espíritu reflexivo que ya estableciste en Lógica y Metacognición.
