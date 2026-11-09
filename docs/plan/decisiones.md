# Plan: decisiones pendientes

[← Índice del plan](../plan.md)

## Decisiones pendientes

Las abiertas. Las tomadas están en el historial: las del Grupo 2 («Decididas (03/11/2026)»), en `docs/historial/plan-grupo-2.md` desde el cierre del grupo (06/11/2026); las anteriores, en `docs/historial/decisiones.md`; las vigentes como regla, en la spec.

- [ ] Versión de Mimi Effects y del Grupo 5: se decide en la G4.P.
- [ ] Cambios de API que pueda exigir la revisión móvil (5.17, en `docs/historial/grupo-2/5.17.md`; la comprobación en teléfonos sigue en la M.20).

### Índice de lo que está «PENDIENTE DE DECIDIR»

Una línea por pregunta, con la tarea donde está escrita completa (opciones y recomendación). Se actualiza al terminar cada tanda del plan y cada vez que se decide algo (la línea se borra y la decisión queda en su tarea con la fecha). Al 05/11/2026: se quitó de (c) la del presupuesto del CSS, que decidió el usuario (ver «Decididas»); las que se decidieron por defecto en el modo autónomo están en `docs/auto/decisiones-por-defecto.md`. Al 03/11/2026 (respuestas a la tanda E): 74 preguntas, 70 en (b) y 4 en (c); se quitó la división de la 5.17, que decidió el usuario. Antes, en la tanda E: 75 preguntas, 71 en (b) y 4 en (c). Cuentas: la tanda D dejó 74; el usuario decidió cinco (convención de valor, globales por preset, `mimi-indet`, chip compartido y lo que se comparte con Tags Input; ver «Decididas»), y la tanda E suma cuatro de la 5.17 y dos de la G2.P. La pregunta de las tablas de tokens de Date Picker pasó de (a) a (b), al inicio de la G2.9, y la del presupuesto, de (a) a (c), para cuando un componente se acerque al error. No cuenta las referencias «la base técnica (ver arriba)» ni «PENDIENTE DE DECIDIR en preguntas», que remiten a otra de la lista. Al 06/11/2026 (cierre del Grupo 2): «Decididas» pasó a `docs/historial/plan-grupo-2.md`; la pregunta de (c) sigue abierta, con la 5.17 en el historial y la comprobación en teléfonos en la M.20. Al 06/11/2026 (detalle de la 0.4.0, «Blocks 0.4.0»): 20 preguntas nuevas, todas con recomendación, 10 en (a), 9 en (b) y 1 en (c); con la de la 5.17, 21 en total. **Pedido del usuario: las revisa antes de ejecutar nada** (no se adoptan por defecto aunque la sesión sea en modo autónomo). **Al 07/11/2026: el usuario decidió las 20** (adoptó todas las recomendaciones, con una precisión en la B.3-a: un degradado neutro provisional sin `imageSrc`): salieron del índice y quedan en cada tarea como «Decidido por el usuario (07/11/2026…)» y en `docs/auto/decisiones-por-defecto.md` con la base «Decidido por el usuario». Queda 1 pregunta abierta, la de la 5.17, en (c).

**(a) Compartidas: se deciden antes de empezar el grupo o la primera tarea que las usa.**

Tres, **del usuario, de gusto: no se adoptan por defecto** (aunque la sesión sea en modo autónomo), cada una con 2 o 3 opciones, ejemplos de código y recomendación en [refinamiento/decisiones-usuario.md](refinamiento/decisiones-usuario.md) (09/11/2026):

- **PD-1 Diseño de Card** (R.19, 0.7.0): A solo superficie `mimiCard`, B superficie + piezas opcionales como directivas, C un componente con entradas. Recomendación: B.
- **PD-2 API de Table y Data Table** (R.20, 0.7.0): A dos capas separadas, B columnas como directivas, C estado «headless» + directivas de estilo (la Data Table por datos queda como atajo). Recomendación: C.
- **PD-3 API de los mensajes de error de Form Field** (R.14, 0.6.0): A `[errors]` en el campo, B el mensaje viaja con el validador (`withMessage`; Signal Forms ya lo hace), C varios `mimi-form-error` por clave. Recomendación: A + B.

**(b) Se deciden al empezar su tarea.**

Ninguna abierta.

**(c) Se deciden solo si se llega a esa parte.**

- 5.17: ¿qué cambios de API exige la revisión móvil? (solo si los teléfonos los encuentran, en la M.20; la 0.3.0 ya está publicada: irían en la versión siguiente).
