# Plan: decisiones pendientes

[← Índice del plan](../plan.md)

## Decisiones pendientes

Las abiertas. Las tomadas están en el historial: las del Grupo 2 («Decididas (03/11/2026)»), en `docs/historial/plan-grupo-2.md` desde el cierre del grupo (06/11/2026); las anteriores, en `docs/historial/decisiones.md`; las vigentes como regla, en la spec.

- [ ] Versión de Mimi Effects y del Grupo 5: se decide en la G4.P.
- [ ] Cambios de API que pueda exigir la revisión móvil (5.17, en `docs/historial/grupo-2/5.17.md`; la comprobación en teléfonos sigue en la M.20).

### Índice de lo que está «PENDIENTE DE DECIDIR»

Una línea por pregunta, con la tarea donde está escrita completa (opciones y recomendación). Se actualiza al terminar cada tanda del plan y cada vez que se decide algo (la línea se borra y la decisión queda en su tarea con la fecha). Al 05/11/2026: se quitó de (c) la del presupuesto del CSS, que decidió el usuario (ver «Decididas»); las que se decidieron por defecto en el modo autónomo están en `docs/auto/decisiones-por-defecto.md`. Al 03/11/2026 (respuestas a la tanda E): 74 preguntas, 70 en (b) y 4 en (c); se quitó la división de la 5.17, que decidió el usuario. Antes, en la tanda E: 75 preguntas, 71 en (b) y 4 en (c). Cuentas: la tanda D dejó 74; el usuario decidió cinco (convención de valor, globales por preset, `mimi-indet`, chip compartido y lo que se comparte con Tags Input; ver «Decididas»), y la tanda E suma cuatro de la 5.17 y dos de la G2.P. La pregunta de las tablas de tokens de Date Picker pasó de (a) a (b), al inicio de la G2.9, y la del presupuesto, de (a) a (c), para cuando un componente se acerque al error. No cuenta las referencias «la base técnica (ver arriba)» ni «PENDIENTE DE DECIDIR en preguntas», que remiten a otra de la lista. Al 06/11/2026 (cierre del Grupo 2): «Decididas» pasó a `docs/historial/plan-grupo-2.md`; la pregunta de (c) sigue abierta, con la 5.17 en el historial y la comprobación en teléfonos en la M.20. Al 06/11/2026 (detalle de la 0.4.0, «Blocks 0.4.0»): 20 preguntas nuevas, todas con recomendación, 10 en (a), 9 en (b) y 1 en (c); con la de la 5.17, 21 en total. **Pedido del usuario: las revisa antes de ejecutar nada** (no se adoptan por defecto aunque la sesión sea en modo autónomo).

**(a) Compartidas: se deciden antes de empezar el grupo o la primera tarea que las usa.**

Blocks 0.4.0 (las decisiones comunes, en la B.1; las usan todos los Blocks):

- B.1-a: qué es un Block en el registro y dónde se copia. Recomendación: tipo nuevo `block`, carpeta `aliases.blocks` (por defecto, hermana de la de componentes) y clave `blocks` en `mimi.json`.
- B.1-b: cómo se actualiza (todo o nada). Recomendación: como un componente; bloqueado si el usuario lo modificó o si se bloquea uno de sus componentes; nada depende de un Block.
- B.1-c: ¿los Blocks en el menú de `ng g mimi` (`x-prompt`)? Recomendación: sí, después de los componentes.
- B.1-d: selector y clase. Recomendación: `mimi-login-01` y `Login01`.
- B.1-e: cuánta API tiene un Block. Recomendación: mínima (entradas de estado y enlaces, salidas de acciones).
- B.1-f: sistema de formularios de los Blocks. Recomendación: Signal Forms.
- B.1-g: cómo se muestra en el sitio. Recomendación: `iframe` con la ruta `/preview/blocks/<nombre>` sin el shell, con ancho escritorio/móvil y modo oscuro.
- B.1-h: CSS global (153,15 kB; aviso 160, error 175; los Blocks sumarían unos 9–14 kB). Recomendación: una hoja aparte para la vista previa (`inject: false`), con spike; plan B: medir y aceptar el aviso.
- B.1-i: idioma de los textos de los Blocks. Recomendación: inglés, como los textos por defecto de los componentes.
- B.1-j: íconos de los Blocks. Recomendación: SVG en línea con los trazos de Lucide (sin dependencia).

**(b) Se deciden al empezar su tarea.**

Blocks 0.4.0:

- B.3-a: `login-02` sin imagen. Recomendación: panel de marcador sin archivo binario.
- B.3-b: iniciales del testimonio. Recomendación: `mimi-avatar`.
- B.4-a: cuándo se muestran los mensajes del registro. Recomendación: al salir del campo; la confirmación, también al escribir una vez tocada.
- B.5-a: cuándo verifica el código. Recomendación: al completar y con el botón, una sola vez por código.
- B.6-a: «Eliminar cuenta» con `mimi-confirm` o solo la salida. Recomendación: solo la salida.
- B.6-b: ¿Toast al guardar? Recomendación: no.
- B.7-a: Border Beam de la tarjeta destacada (E.7 sin versión). Recomendación: borde estático en la 0.4.0.
- B.10-a: Tabs vertical como tarea propia o dentro de la B.6. Recomendación: tarea propia (B.10).
- B.P-a: ¿la landing muestra los Blocks? Recomendación: un enlace a la sección, sin rediseñar la landing.

**(c) Se deciden solo si se llega a esa parte.**

- B.8-a (al detallar la B.8, v0.6.0): `dashboard-01` usa también Number Ticker (E.6) y Timeline (G5.5), sin versión. Recomendación: números estáticos y la actividad como lista dentro del Block.

- 5.17: ¿qué cambios de API exige la revisión móvil? (solo si los teléfonos los encuentran, en la M.20; la 0.3.0 ya está publicada: irían en la versión siguiente).
