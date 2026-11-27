# Plan: decisiones pendientes

[← Índice del plan](../plan.md)

## Decisiones pendientes

Las abiertas. Las tomadas están en el historial: las del Grupo 2 («Decididas (03/11/2026)»), en `docs/historial/plan-grupo-2.md` desde el cierre del grupo (06/11/2026); las anteriores, en `docs/historial/decisiones.md`; las vigentes como regla, en la spec.

- [x] Versión de Mimi Effects y del Grupo 5: **decidido por el usuario el 23/11/2026**, después de la 1.0.0 (`docs/plan/version-1.0.md`).
- [ ] Cambios de API que pueda exigir la revisión móvil (5.17, en `docs/historial/grupo-2/5.17.md`; la comprobación en teléfonos sigue en la M.20).

### Índice de lo que está «PENDIENTE DE DECIDIR»

Una línea por pregunta, con la tarea donde está escrita completa (opciones y recomendación). Se actualiza al terminar cada tanda del plan y cada vez que se decide algo (la línea se borra y la decisión queda en su tarea con la fecha). Al 05/11/2026: se quitó de (c) la del presupuesto del CSS, que decidió el usuario (ver «Decididas»); las que se decidieron por defecto en el modo autónomo están en `docs/auto/decisiones-por-defecto.md`. Al 03/11/2026 (respuestas a la tanda E): 74 preguntas, 70 en (b) y 4 en (c); se quitó la división de la 5.17, que decidió el usuario. Antes, en la tanda E: 75 preguntas, 71 en (b) y 4 en (c). Cuentas: la tanda D dejó 74; el usuario decidió cinco (convención de valor, globales por preset, `mimi-indet`, chip compartido y lo que se comparte con Tags Input; ver «Decididas»), y la tanda E suma cuatro de la 5.17 y dos de la G2.P. La pregunta de las tablas de tokens de Date Picker pasó de (a) a (b), al inicio de la G2.9, y la del presupuesto, de (a) a (c), para cuando un componente se acerque al error. No cuenta las referencias «la base técnica (ver arriba)» ni «PENDIENTE DE DECIDIR en preguntas», que remiten a otra de la lista. Al 06/11/2026 (cierre del Grupo 2): «Decididas» pasó a `docs/historial/plan-grupo-2.md`; la pregunta de (c) sigue abierta, con la 5.17 en el historial y la comprobación en teléfonos en la M.20. Al 06/11/2026 (detalle de la 0.4.0, «Blocks 0.4.0»): 20 preguntas nuevas, todas con recomendación, 10 en (a), 9 en (b) y 1 en (c); con la de la 5.17, 21 en total. **Pedido del usuario: las revisa antes de ejecutar nada** (no se adoptan por defecto aunque la sesión sea en modo autónomo). **Al 07/11/2026: el usuario decidió las 20** (adoptó todas las recomendaciones, con una precisión en la B.3-a: un degradado neutro provisional sin `imageSrc`): salieron del índice y quedan en cada tarea como «Decidido por el usuario (07/11/2026…)» y en `docs/auto/decisiones-por-defecto.md` con la base «Decidido por el usuario». Queda 1 pregunta abierta, la de la 5.17, en (c).

**(a) Compartidas: se deciden antes de empezar el grupo o la primera tarea que las usa.**

- [ ] **P1 a P6 de la revisión de la API** (26/11/2026, tanda 2 de la 0.9.0; opciones y recomendación en `docs/spec/api-1.0.md`, sección 3): P1 `density` y `size` de Data Table (la 1.0-8); P2 `success` de Input OTP; P3 los nombres de eventos fuera de la regla (`datePick`, los participios); P4 `size` propio de Pagination y Progress; P5 las variables con abreviatura (`--mimi-btn-*`…); P6 `mimiButtonVariants` frente a `buttonVariants` (aplicada la regla; se puede volver). Antes de la 1.0: después son rupturas.

Ninguna otra abierta. (Playwright como devDependency del repo, para la M.18 y la CI: **decidido por el usuario el 23/11/2026**, `@playwright/test` solo como `devDependency` de la raíz; queda en la 1.0-5, `docs/plan/version-1.0.md`, y en la spec 2.)

**PD-9 la decidió el usuario el 14/11/2026** (opción (a)): `DocPage.tokens` acepta una lista de tablas (la primera, la del componente). Tags Input y Combobox muestran también la del chip; File Upload, la de Progress.

**PD-8 la decidió el usuario el 14/11/2026** (opción (a)): una sección opcional **«Servicio»** en la API (`api.service`, `id="service"`, `Miembro | Tipo | Descripción`), entre Piezas y Textos; la usa Dialog y la usarán Toast, Confirm y Command.

**PD-7 la decidió el usuario el 14/11/2026:** Dialog empieza por el servicio, con un ejemplo más corto (pedir un nombre y devolverlo) como demo; el diálogo en la plantilla pasa a Ejemplos. Cupo en 56 líneas entre sus dos archivos: no hizo falta la excepción hasta 80 que el usuario dejó aprobada para Dialog. Rama `auto/docs-paginas-2-2026-11-14`; el texto de la pregunta, en `docs/auto/decisiones-por-defecto.md`.

**PD-5 y PD-6 (de la limpieza «sin rediseño») las decidió el usuario el 14/11/2026**, las dos con la opción recomendada: PD-5, `group2-tokens.spec.ts` compara con los valores de hoy escritos en la prueba, sin leer `docs/design/`; PD-6, el degradado neutro de `login-02` es el definitivo. Hechas en la rama `auto/docs-paginas-2026-11-14`; el texto de las preguntas está en `docs/auto/decisiones-por-defecto.md`.

**PD-4 y PD-4c (la plantilla de las páginas) las decidió el usuario el 14/11/2026** y salieron de este índice: variante A; un componente común con configuración; la prueba falla desde DP.0 con la lista de pendientes que solo encoge; los textos de C.3 se aplican como están; cada excepción la aprueba el usuario. Quedan como «Decidido por el usuario» en [docs-paginas/plan.md](docs-paginas/plan.md), [docs-paginas/parte-c.md](docs-paginas/parte-c.md) y `docs/auto/decisiones-por-defecto.md`.

Las tres de gusto del plan de refinamiento (PD-1, PD-2 y PD-3) las **decidió el usuario el 09/11/2026** y salieron de este índice: PD-1 Card, opción B; PD-2 Table y Data Table, opción C; PD-3 mensajes de error de Form Field, opciones A + B. Quedan como «Decidido por el usuario» en [refinamiento/decisiones-usuario.md](refinamiento/decisiones-usuario.md), en las tareas R.14, R.19 y R.20 y en `docs/auto/decisiones-por-defecto.md`.

**(b) Se deciden al empezar su tarea.**

Ninguna abierta.

**(c) Se deciden solo si se llega a esa parte.**

- 5.17: ¿qué cambios de API exige la revisión móvil? (solo si los teléfonos los encuentran, en la M.20; la 0.3.0 ya está publicada: irían en la versión siguiente).
