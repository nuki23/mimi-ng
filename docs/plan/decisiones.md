# Plan: decisiones pendientes

[← Índice del plan](../plan.md)

## Decisiones pendientes

Primero las abiertas. Debajo, «Decididas», las del Grupo 2 tomadas hace poco (hasta que la G2.P las lleve a `docs/historial/plan-grupo-2.md`). Las anteriores están en `docs/historial/decisiones.md` y en la spec.

- [ ] Grupo 5: el criterio «según lo que pidan los usuarios» sigue abierto (antes, «se prioriza después de la 0.2.0»). Se revisa en la G2.P; la versión se decide en la G4.P.
- [ ] Blocks: todos en la v0.4.0, con el Grupo 3 (decidido el 03/11/2026). Se revisa en la G2.P.
- [ ] Versión de Mimi Effects: se decide en la G4.P.
- [ ] CLI y cdk anterior a `^22.2.0`: avisar o actualizar (ver M.4).
- [ ] Cambios de API que pueda exigir la revisión móvil (ver 5.17).

### Decididas (03/11/2026)

Decisiones tomadas por el usuario el 03/11/2026 sobre preguntas que estaban aquí o en las tareas del Grupo 2. Cada una queda escrita en su tarea; las que siguen vigentes como regla, en la spec. Pasan al historial al cerrar el grupo (G2.P), con el texto de las tareas del grupo (`docs/historial/plan-grupo-2.md`).

- [x] **Convención de valor simple/múltiple** (G2.1, G2.7 y G2.8). Decidió el usuario: opción (a), un solo `value` cuyo tipo cambia con el modo, con un spike de Signal Forms al empezar G2.1 (un campo `T` y otro `T[]` contra el mismo componente); si TypeScript no acepta la unión con `[formField]`, opción (c), dos selectores. El nombre del modo de rango del Slider se propone al empezar G2.7, dentro de la misma convención. Vive en la spec 8, «Valor simple o múltiple». Descartadas: (b) `value` y `values` (`[formField]` solo enlaza `value`) y (d) siempre arreglo (incómodo en simple y distinto de Select).
- [x] **Presupuesto del CSS global y del `initial` en el Grupo 2.** Decidió el usuario: medir primero y no subir ningún presupuesto ahora. El aviso (CSS global 130 kB, `initial` 475 kB) no rompe el build; solo el error (145 kB y 505 kB) lo rompe. Cuando un componente deje el CSS global cerca del error, el usuario decide con la tabla acumulada de la G2.P y el gzip real. Ningún presupuesto se sube sin su decisión. Vive en la spec 10, «Grupo 2: medir primero». Datos de partida (03/11/2026, `pnpm build:docs`): CSS global 120,08 / 17,67 kB, JS inicial 333,94 / 105,24 kB (crudo / gzip), `initial` 454,02 kB; estimación al cerrar el grupo: unos 164 kB de CSS global y unos 498 kB de `initial` (G2.0b). La política que el usuario propuso en la tanda D (subir los techos si el gzip se mantiene bajo) queda para cuando se llegue cerca del error, con los números reales.
- [x] **Presupuesto del CSS global y del `initial`: se suben (05/11/2026).** Decidido por el usuario (05/11/2026), solo en el sitio de documentación: CSS global, aviso de 130 a 160 kB y error de 145 a 175 kB; `initial`, aviso de 475 a 505 kB y error de 505 a 535 kB (los mismos +30 kB, porque incluye el CSS). Motivo: con la G2.7 el CSS global llegó a 140,98 / 20,50 kB (crudo / gzip), a 4,02 kB del error. Cada informe da además el peso de `theme-base.css` solo y cuánto del CSS global viene de los ejemplos; la G2.P repite la medición. Vive en la spec 10.
- [x] **Para la puerta G2.P (decidido por el usuario el 05/11/2026):** la M.9 no entra en la 0.3.0 (Select no se toca); la tabla del CSS: en la spec 10 solo los límites, y las mediciones con fecha van a `docs/historial/` (con el grupo, en la G2.P); no hay 0.2.1: el arreglo de la 5.17a va en la 0.3.0; la M.11 era un error (`--overwrite` sobrescribe siempre; corregida); los paneles altos a 360px (5.17b) son un criterio manual de la puerta (teléfono real) y, si se confirma, una tarea con un spike de las opciones del overlay (margen de viewport y empuje); aceptadas las versiones exactas de Angular (M.2) y `minDate`/`maxDate` en el Date Range; la tabla única de tokens de las fechas, anotada con su por qué y lo que se pierde (`docs/auto/decisiones-por-defecto.md`).
- [x] **Globales del Grupo 2 por preset** (G2.0b). Decidió el usuario: ningún global nuevo va por preset; todos solo en el CSS.
- [x] **`mimi-indet`** (G2.0 y G2.10). Decidió el usuario: global, en `theme-base.css`, como `mimi-caret`, `mimi-bob` y `mimi-shake`; entra en el alcance de la G2.0b. Vive en la spec 13, «Otros globales del diseño».
- [x] **Chip compartido** (G2.6 y G2.8). Decidió el usuario: un ítem `chip` de la CLI (como `menu`), que crea la G2.6 y usan Tags Input y el Combobox múltiple.
- [x] **Combobox y Select** (G2.8). Decidió el usuario: el Combobox usa utilidades nuevas (filtro, resaltado y lista); Select no se toca en la 0.3.0; la M.9 lo migra después.
- [x] **Combobox y Tags Input** (G2.6 y G2.8). Decidió el usuario: se comparten el chip y su lógica de quitar (Backspace y botón), en el ítem `chip`; los anuncios, con un util pequeño que usan los dos.
- No decidida a propósito: las tablas de tokens de Date Picker y Date Range (¿una o dos?) quedan para el inicio de la G2.9 (pregunta de la G2.0). Decidió el usuario (respuesta a la tanda E): mientras tanto, la G2.0 las escribe juntas y marcadas como provisionales.
- [x] **G2.7 y G2.8 dependen de G2.1** (respuesta a la tanda E). Decidió el usuario: «Depende de: G2.1» solo por el resultado del spike de la convención de valor, anotado como excepción en la regla 5 de «Cómo usar este plan»; la tabla de la spec 4 no cambia.
- [x] **Presupuesto: la intención se confirma** (respuesta a la tanda E). Decidió el usuario: que el aviso no rompe el build se comprueba la primera vez que salte un aviso, sin provocarlo (spec 10, «Grupo 2: medir primero»).
- [x] **5.17 dividida** (respuesta a la tanda E). Decidió el usuario: 5.17a (Grupo 1) y 5.17b (Grupo 2); la 5.17a se hace antes de G2.1, porque el comportamiento de los paneles en móvil es transversal (Combobox, Date Picker, Color Picker y la burbuja del Slider son overlays nuevos). Sus cambios de API van a la 0.3.0, o a una 0.2.1 si son correcciones graves (lo decide el usuario al ver los resultados). G2.1 depende de 5.17a; G2.P, de 5.17a y 5.17b.

### Índice de lo que está «PENDIENTE DE DECIDIR»

Una línea por pregunta, con la tarea donde está escrita completa (opciones y recomendación). Se actualiza al terminar cada tanda del plan y cada vez que se decide algo (la línea se borra y la decisión queda en su tarea con la fecha). Al 05/11/2026: se quitó de (c) la del presupuesto del CSS, que decidió el usuario (ver «Decididas»); las que se decidieron por defecto en el modo autónomo están en `docs/auto/decisiones-por-defecto.md`. Al 03/11/2026 (respuestas a la tanda E): 74 preguntas, 70 en (b) y 4 en (c); se quitó la división de la 5.17, que decidió el usuario. Antes, en la tanda E: 75 preguntas, 71 en (b) y 4 en (c). Cuentas: la tanda D dejó 74; el usuario decidió cinco (convención de valor, globales por preset, `mimi-indet`, chip compartido y lo que se comparte con Tags Input; ver «Decididas»), y la tanda E suma cuatro de la 5.17 y dos de la G2.P. La pregunta de las tablas de tokens de Date Picker pasó de (a) a (b), al inicio de la G2.9, y la del presupuesto, de (a) a (c), para cuando un componente se acerque al error. No cuenta las referencias «la base técnica (ver arriba)» ni «PENDIENTE DE DECIDIR en preguntas», que remiten a otra de la lista.

**(a) Compartidas: se deciden antes de empezar el grupo o la primera tarea que las usa.**

- Ninguna por ahora: las siete compartidas se decidieron el 03/11/2026 (ver «Decididas»).

**(b) Se deciden al empezar su tarea.**

- M.4: con un cdk anterior a `^22.2.0`, ¿la CLI solo avisa o también actualiza el rango?

**(c) Se deciden solo si se llega a esa parte.**

- 5.17: ¿qué cambios de API exige la revisión móvil? (solo si los teléfonos los encuentran; la versión ya está decidida: 0.3.0, sin 0.2.1).
