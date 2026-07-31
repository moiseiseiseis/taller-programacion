# Taller de Algoritmia — Versión fusionada
### Algorithms to Live By (base original) + Grokking Algorithms (rigor formal)

**Regla de fusión aplicada:** el contenido pedagógico de las 12 unidades
originales (dilema, teoría, práctica) no se modifica. Donde un capítulo de
Grokking Algorithms encaja temáticamente con una unidad existente, se le
agrega una sección nueva ("Mecánica formal") al final de esa misma unidad.
Donde no hay equivalente, se crea una unidad nueva completa, con la misma
estructura de las originales: gancho cotidiano (estilo Christian/Griffiths)
+ teoría + práctica basada en los ejercicios de Grokking Algorithms.

**Resultado:** 16 unidades totales — 8 sin cambios, 4 enriquecidas, 4 nuevas.

---

## Mapeo de traslapes (Grokking → unidad existente)

| Capítulo de Grokking Algorithms | Se fusiona con |
|---|---|
| 1. Introducción a algoritmos (Big-O) + 2. Selection sort + 4. Quicksort | Unidad 3 — Ordenar |
| 5. Hash tables | Unidad 4 — Caché |
| 10. Algoritmos voraces | Unidad 5 — Planificación |
| 12. k-vecinos más cercanos | Unidad 6 — Bayes |

## Capítulos de Grokking sin equivalente (unidades nuevas)

| Capítulo de Grokking Algorithms | Unidad nueva |
|---|---|
| 3. Recursión | Nueva — Recursión |
| 7-8. Árboles y árboles balanceados | Nueva — Árboles |
| 6. Búsqueda en anchura + 9. Dijkstra | Nueva — Grafos |
| 11. Programación dinámica | Nueva — Programación dinámica |

---

## Orden propuesto de las 16 unidades

Reordené para que las 4 unidades nuevas queden donde tienen más sentido
conceptual (recursión justo después de ver Quicksort, que es recursivo;
árboles después de recursión porque son su extensión natural; grafos después
de árboles; programación dinámica después de caché porque es, en esencia,
"cachear soluciones a subproblemas"). **El contenido de las 12 unidades
originales no cambia — solo su posición en la secuencia**, y las 4 que
reciben contenido nuevo lo reciben como sección adicional, no como reemplazo.

Si prefieres que el orden original se mantenga intacto (unidades viejas en
su posición 1-12, unidades nuevas todas al final antes del cierre), es un
cambio de orden simple — dímelo y lo ajusto.

---

### Unidad 1 — Parada óptima
*(sin cambios — contenido original)*

### Unidad 2 — Explorar vs. explotar
*(sin cambios — contenido original)*

### Unidad 3 — Ordenar: cuánto esfuerzo vale la pena
*(contenido original sin cambios, + sección nueva)*

**+ Mecánica formal (Grokking, caps. 1, 2, 4):**
- Qué es la notación Big-O y por qué "ordenar cuesta más que buscar" ahora
  se puede expresar de forma precisa (O(n log n) vs. O(n²))
- Selection sort: el algoritmo de ordenamiento más intuitivo, y por qué es lento
- Quicksort: el algoritmo recursivo que resuelve el mismo problema mucho más
  rápido — primer contacto con recursión, que se profundiza en la Unidad 4

**+ Ejercicio Grokking:** ordenar una lista pequeña a mano con selection sort
contando cada paso, y comparar contra la cantidad de pasos que tomaría quicksort

---

### Unidad 4 — Recursión *(NUEVA)*

**Fuente:** Grokking Algorithms, cap. 3

**Dilema de entrada:** cómo le explicas a alguien dónde estás parado en una
fila usando solo a la persona que tienes justo enfrente — definir algo en
términos de una versión más pequeña de sí mismo, en vez de explicarlo todo de una vez

**Teoría:** qué es un caso base, qué es una llamada recursiva, por qué toda
función recursiva necesita ambos para no repetirse infinitamente. Conexión
explícita con la Unidad 10 de tu Taller de Lógica (el testigo que se
contradice a sí mismo): la recursión bien construida es autorreferencia con
salida; una recursión sin caso base es la misma paradoja que ya vieron ahí,
sin forma de resolverse

**Práctica:** ejercicios clásicos de Grokking — escribir la función factorial,
buscar un elemento en una lista usando recursión, dibujar a mano el "árbol de
llamadas" de una recursión simple para visualizar cómo se resuelve paso a paso

---

### Unidad 5 — Árboles *(NUEVA)*

**Fuente:** Grokking Algorithms, caps. 7-8

**Dilema de entrada:** un árbol genealógico, la estructura de carpetas de una
computadora, un organigrama de empresa — jerarquías con un origen y ramas

**Teoría:** qué es un árbol como estructura (raíz, nodos hijos, hojas), por
qué es una extensión natural de la recursión de la Unidad 4 (cada rama de un
árbol es, en sí misma, un árbol más pequeño), noción de árbol balanceado vs.
desbalanceado y por qué afecta qué tan rápido se encuentra algo

**Práctica:** recorrer un árbol genealógico dado y responder preguntas
(¿cuántas generaciones hay?, ¿quién es el ancestro común de dos personas?),
ejercicio de Grokking sobre por qué un árbol desbalanceado es tan lento como
buscar en una lista sin ordenar

---

### Unidad 6 — Grafos: modelar relaciones y encontrar el mejor camino *(NUEVA)*

**Fuente:** Grokking Algorithms, cap. 6 (búsqueda en anchura) + cap. 9 (Dijkstra)

**Dilema de entrada:** ¿cuántos "grados de separación" hay entre tú y una
persona famosa? ¿Cuál es la ruta más rápida entre dos ciudades cuando cada
camino tarda distinto?

**Teoría:** qué es un grafo (nodos y conexiones, sin la jerarquía obligatoria
de un árbol), búsqueda en anchura para encontrar la distancia más corta
cuando todas las conexiones "cuestan" lo mismo, algoritmo de Dijkstra cuando
las conexiones tienen costos distintos

**Práctica:** ejercicio de grados de separación en una red social simulada
(búsqueda en anchura), ejercicio de ruta más barata en un mapa simplificado
con costos distintos por tramo (Dijkstra) — ambos adaptados de Grokking

---

### Unidad 7 — Caché: qué guardar y qué desechar
*(contenido original sin cambios, + sección nueva)*

**+ Mecánica formal (Grokking, cap. 5):**
- Qué es una hash table y por qué te permite encontrar algo en un solo paso,
  en vez de revisar elemento por elemento
- Es la estructura que hace posible que un caché funcione rápido en la
  práctica — sin ella, "guardar lo más usado recientemente" no serviría de
  mucho si encontrarlo sigue siendo lento

**+ Ejercicio Grokking:** construir a mano una hash table simple (función de
"hash" rudimentaria) y comparar el tiempo de búsqueda contra una lista sin indexar

---

### Unidad 8 — Programación dinámica: no resolver lo mismo dos veces *(NUEVA)*

**Fuente:** Grokking Algorithms, cap. 11

**Dilema de entrada:** planear un viaje con presupuesto y tiempo limitado, y
decidir qué combinación de actividades cabe sin desperdiciar ni un peso ni
una hora — el clásico "problema de la mochila"

**Teoría:** cómo dividir un problema grande en subproblemas que se repiten,
y por qué guardar la solución de cada subproblema (en vez de recalcularla
cada vez) ahorra una cantidad enorme de trabajo. Conexión explícita con la
Unidad 7 (Caché): "esto es cachear soluciones a problemas, no solo datos"

**Práctica:** el problema de la mochila simplificado con pocos elementos,
resuelto primero por fuerza bruta (probar todas las combinaciones) y después
con la tabla de programación dinámica, comparando cuántos pasos ahorra el
segundo método

---

### Unidad 9 — Programar el tiempo: qué hacer primero
*(contenido original sin cambios, + sección nueva)*

**+ Mecánica formal (Grokking, cap. 10):**
- Las estrategias de planificación que ya viste (la más corta primero, la de
  fecha límite más próxima primero) son ejemplos de **algoritmos voraces**:
  elegir lo que se ve mejor en cada paso, sin replantear decisiones pasadas
- Cuándo esta estrategia garantiza el resultado óptimo, y cuándo solo da una
  buena aproximación

**+ Ejercicio Grokking:** el problema clásico de selección de actividades
(cubrir la mayor cantidad posible de tareas que no se traslapan en tiempo),
resuelto con estrategia voraz

---

### Unidad 10 — Regla de Bayes: predecir con poca información
*(contenido original sin cambios, + sección nueva)*

**+ Mecánica formal (Grokking, cap. 12):**
- k-vecinos más cercanos como otra forma de predecir lo desconocido: en vez
  de combinar una tasa base con evidencia nueva (como en Bayes), miras qué
  les pasó a los casos más parecidos al tuyo y asumes que a ti te va a pasar algo similar

**+ Ejercicio Grokking:** dado un pequeño conjunto de datos con "vecinos"
conocidos, predecir la categoría de un caso nuevo usando k-vecinos más
cercanos, y comparar esa predicción contra la que se haría con Bayes

---

### Unidad 11 — Sobreajuste: cuándo dejar de pensar
*(sin cambios — contenido original)*

### Unidad 12 — Relajación: resolver una versión más fácil del problema
*(sin cambios — contenido original)*

### Unidad 13 — Aleatoriedad: cuándo dejar algo al azar
*(sin cambios — contenido original)*

### Unidad 14 — Redes: cómo nos comunicamos
*(sin cambios — contenido original)*

### Unidad 15 — Teoría de juegos: decidir considerando a otros
*(sin cambios — contenido original)*

### Unidad 16 — Cierre: bondad computacional
*(sin cambios — contenido original, se mantiene como cierre final)*

---

## Resumen de la fusión

| # | Unidad | Estado |
|---|---|---|
| 1 | Parada óptima | Sin cambios |
| 2 | Explorar/explotar | Sin cambios |
| 3 | Ordenar | Enriquecida (+ Big-O, selection sort, quicksort) |
| 4 | Recursión | **Nueva** |
| 5 | Árboles | **Nueva** |
| 6 | Grafos | **Nueva** |
| 7 | Caché | Enriquecida (+ hash tables) |
| 8 | Programación dinámica | **Nueva** |
| 9 | Planificación | Enriquecida (+ algoritmos voraces) |
| 10 | Bayes | Enriquecida (+ k-NN) |
| 11 | Sobreajuste | Sin cambios |
| 12 | Relajación | Sin cambios |
| 13 | Aleatoriedad | Sin cambios |
| 14 | Redes | Sin cambios |
| 15 | Teoría de juegos | Sin cambios |
| 16 | Cierre | Sin cambios |

---

### Notas de implementación

- **Estás en el desarrollo de la Unidad 11 original** (Teoría de juegos, en
  la numeración vieja) — con la nueva numeración eso corresponde a la
  **Unidad 15**. Vale la pena confirmar en qué unidad exacta ibas antes de
  reordenar nada en el sistema real, para no perder tu progreso de desarrollo.
- **Las 4 unidades nuevas quedan agrupadas en dos parejas** (Recursión→Árboles→Grafos
  como una progresión de estructuras, y Caché→Programación Dinámica como una
  progresión de "guardar soluciones") — esto no fue accidental, ambas parejas
  cuentan una historia de "un concepto lleva naturalmente al siguiente"
- **El cierre (Unidad 16) sigue funcionando igual de bien** — de hecho ahora
  "bondad computacional" tiene más algoritmos disponibles para el proyecto
  integrador (recursión, grafos, programación dinámica se suman a los 11 originales)
