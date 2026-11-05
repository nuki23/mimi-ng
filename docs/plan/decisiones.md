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

Una línea por pregunta, con la tarea donde está escrita completa (opciones y recomendación). Se actualiza al terminar cada tanda del plan y cada vez que se decide algo (la línea se borra y la decisión queda en su tarea con la fecha). Al 03/11/2026 (respuestas a la tanda E): 74 preguntas, 70 en (b) y 4 en (c); se quitó la división de la 5.17, que decidió el usuario. Antes, en la tanda E: 75 preguntas, 71 en (b) y 4 en (c). Cuentas: la tanda D dejó 74; el usuario decidió cinco (convención de valor, globales por preset, `mimi-indet`, chip compartido y lo que se comparte con Tags Input; ver «Decididas»), y la tanda E suma cuatro de la 5.17 y dos de la G2.P. La pregunta de las tablas de tokens de Date Picker pasó de (a) a (b), al inicio de la G2.9, y la del presupuesto, de (a) a (c), para cuando un componente se acerque al error. No cuenta las referencias «la base técnica (ver arriba)» ni «PENDIENTE DE DECIDIR en preguntas», que remiten a otra de la lista.

**(a) Compartidas: se deciden antes de empezar el grupo o la primera tarea que las usa.**

- Ninguna por ahora: las siete compartidas se decidieron el 03/11/2026 (ver «Decididas»).

**(b) Se deciden al empezar su tarea.**

- G2.9 (pregunta escrita en la G2.0): Date Picker y Date Range, ¿una tabla de tokens o dos? (el usuario la dejó para el inicio de la G2.9).

- M.4: con un cdk anterior a `^22.2.0`, ¿la CLI solo avisa o también actualiza el rango?
- 5.2: el modo claro/oscuro de la vista previa, ¿cambia todo el sitio o solo el contenedor?
- G2.2: base técnica (`input type="text"` con `role="spinbutton"` o `type="number"` nativo).
- G2.2: nombres de la API.
- G2.2: el campo vacío, ¿es `null` o vuelve a `min`/0?
- G2.2: rueda del mouse, mantener pulsado, Re Pág/Av Pág e Inicio/Fin.
- G2.2: ¿los botones −/+ son paradas de Tab?
- G2.3: nombres de la API.
- G2.3: cómo se calcula el medidor (heurística del diseño y función del usuario, solo función, o biblioteca).
- G2.3: ¿las reglas del medidor se configuran o son fijas?
- G2.3: la API (contenedor que proyecta el input o directiva `input[mimiPassword]`).
- G2.4: ¿el modelo guarda el valor con máscara o sin ella? (decide si G2.4a es directiva o control propio).
- G2.4: nombres de la API (dependen de la pregunta anterior).
- G2.4: ¿más símbolos que `0` (letras, alfanumérico)?
- G2.4: Ctrl+Z después de un reformateo: comportamiento del navegador o pila propia.
- G2.4: marca de tarjeta, Luhn y fecha: ¿validadores de Mimi o solo ejemplos?
- G2.5: nombres de la API.
- G2.5: un input real con casillas visuales o un input por casilla.
- G2.5: ¿solo dígitos o también letras?
- G2.6: navegación con el teclado entre etiquetas (sin flechas, flechas con `FocusKeyManager`, u otra).
- G2.6: nombres de la API.
- G2.6: ¿la normalización del diseño (minúsculas y sin `#`) es la de Mimi por defecto?
- G2.6: pegado de varias etiquetas, ¿se separan y se agregan todas?
- G2.7: base técnica (`input type="range"` nativo, dos nativos superpuestos, pulgares propios con `role="slider"` o un nativo invisible por pulgar como Angular Material).
- G2.7: nombres de la API.
- G2.7: orientación vertical y RTL.
- G2.7: ¿dividir en G2.7a (un valor) y G2.7b (rango doble)?
- G2.8: dónde viven las utilidades nuevas de lista (ítem compartido de la CLI o `utils/`) y qué incluyen.
- G2.8: nombres de la API.
- G2.8: crear un valor nuevo, ¿`creatable` con `(create)` o lo hace el usuario?
- G2.8: Escape con el panel cerrado, ¿borra lo escrito o no hace nada?
- G2.8: ¿dividir en G2.8a (simple) y G2.8b (múltiple con chips)?
- G2.9: la cuadrícula (`ngGrid` de aria o propia con `FocusKeyManager`).
- G2.9: nombres de la API.
- G2.9: cómo se guarda la fecha (`Date`, cadena ISO, `Temporal.PlainDate` o un adaptador).
- G2.9: cómo se localiza (`Intl.DateTimeFormat` con `LOCALE_ID` y `locale`, o `DatePipe` con datos registrados).
- G2.9: ¿Date Range es un componente aparte o un modo del Date Picker?
- G2.9: ¿un `mimi-calendar` suelto?
- G2.9: ¿se puede escribir la fecha a mano?
- G2.9: en el rango, ¿el modelo cambia con solo el inicio elegido?
- G2.9: ¿atajos por defecto en el rango o solo los del usuario?
- G2.9: ¿dividir en G2.9a (calendario y una fecha) y G2.9b (rango)?
- G2.10: base técnica (`div` con `role="progressbar"` o `<progress>` nativo).
- G2.10: nombres de la API.
- G2.10: ¿un componente con `shape` o dos?
- G2.10: ¿el texto y el valor de arriba de la barra son parte del componente?
- G2.10: con movimiento reducido, ¿el círculo indeterminado deja de girar o «late»?
- G2.11: nombres y forma de la API.
- G2.11: hasta dónde llega Mimi y cómo recibe el estado de la subida (un componente, dos piezas o una función `upload`).
- G2.11: un archivo rechazado, ¿entra en el valor marcado como error o queda fuera?
- G2.11: la zona de soltar, ¿`div` con `role="button"` o `<button>` nativo?
- G2.11: ¿el ícono y el color por tipo de archivo son del componente o del ejemplo?
- G2.12: nombres de la API.
- G2.12: el formato del valor (siempre hex, el formato elegido o un objeto).
- G2.12: los espacios de color (HSV como el diseño u OKLCH).
- G2.12: el disparador (panel y disparador, solo disparador o solo panel).
- G2.12: ¿el tono usa el Slider de Mimi o un control propio?
- G2.12: el área de dos dimensiones, ¿un `role="slider"` o dos?
- G2.12: el borde y las sombras fijos de los pulgares: ¿excepción documentada o tokens del componente?
- G2.12: ¿paleta por defecto o solo la del usuario?
- G2.12: la paleta y los recientes, ¿una parada de Tab por muestra o un grupo con flechas?
- G2.P: ¿la M.9 entra en la 0.3.0 o en una versión siguiente?
- G2.P: ¿dónde queda la tabla acumulada del CSS (esta tarea e historial, o la spec 10)?

**(c) Se deciden solo si se llega a esa parte.**

- G2.7: distancia mínima entre pulgares, ¿entrada `minRange` o validador del formulario? (solo con el rango doble).
- Grupo 2 (cualquier tarea o la G2.P): si un componente deja el CSS global cerca del error (145 kB) o el `initial` cerca de 505 kB, qué se hace (reducir o subir un techo); decide el usuario con la tabla acumulada y el gzip real (spec 10, «Grupo 2: medir primero»).
- 5.17: ¿qué cambios de API exige la revisión móvil y a qué versión van (en la 5.17a: 0.3.0 o 0.2.1)? (solo si la revisión los encuentra).
