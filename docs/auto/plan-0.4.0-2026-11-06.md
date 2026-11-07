# Informe de modo autónomo: plan de la 0.4.0 (Blocks), rama `auto/plan-0.4.0-2026-11-06`

Rama creada el 06/11/2026 desde `main` actualizado (`8d6ae36`, la fusión del PR #5; contiene `docs/historial/grupo-2/` con sus 17 archivos, comprobado antes de crearla), sin upstream hacia `main`. `node -v`: **v24.18.0**. Un primer intento se detuvo porque `main` todavía no tenía el PR #5; el usuario lo fusionó y pidió seguir.

Pedido: detallar la 0.4.0 (B.1 a B.7 y la puerta B.P) **solo con documentación**, con la plantilla completa, un archivo por tarea, el índice al día y las preguntas indexadas; **parar al terminar la planificación** para que el usuario la revise antes de ejecutar. Por eso, aunque la sesión es en modo autónomo, **ninguna «PENDIENTE DE DECIDIR» se adoptó por defecto**: todas quedan abiertas con su recomendación, y no se agregaron filas a `docs/auto/decisiones-por-defecto.md`.

## Pendiente del usuario

1. **Revisar las 20 preguntas** de «Blocks 0.4.0» en `docs/plan/decisiones.md` (10 comunes en la B.1, 9 de tareas y 1 de la B.8). La más grande es la **B.1-a/b**: qué es un Block en la CLI y cómo se actualiza.
2. **La B.10** (Tabs con orientación vertical) es una tarea nueva que no estaba en el plan: cambia un componente publicado. Confirmar que entra en la 0.4.0 (B.10-a).
3. **pricing-01 depende de Border Beam** (Mimi Effects, E.7, sin versión), y **dashboard-01 (0.6.0) de Number Ticker (E.6) y Timeline (G5.5)**. Antes no estaba anotado. Las dos preguntas (B.7-a y B.8-a) recomiendan escribirlo estático dentro del Block.
4. **Diseños que faltan** (no bloquean; van a D6 cuando se haga cada Block): estados de error en `login-01` y `login-02` (credenciales y campos inválidos); una imagen o ilustración para `login-02` (el diseño tiene un hueco de la herramienta, B.3-a); el estado «válido» de un campo (signup-01); Tabs vertical (`F2 Toast Tabs Toolbar` no la tiene); la página de un Block en el sitio. Todos los Blocks de la 0.4.0 **tienen** su diseño en `docs/design/Block <nombre>.dc.html`, con escritorio, móvil, claro y oscuro (índice: `Mimi F6 Blocks.dc.html`).

## Plan breve

Leer los seis diseños y el índice F6 (con un script de solo lectura que quita los estilos), la spec 4 («Blocks»), la spec 5 (la CLI: todo o nada, bases, `mimi.json`, registro) y lo que ya existe (registro, Tabs, Separator, alias de `init`); escribir las ocho tareas con la plantilla de las del Grupo 2; índice, decisiones, spec 4 y M.20.

## Qué se hizo

- `docs/plan/blocks/` (nuevo): `B.1.md`, `B.2.md`, `B.3.md`, `B.4.md`, `B.5.md`, `B.6.md`, `B.7.md`, `B.10.md` y `B.P.md`, con la plantilla completa (Versión · Tamaño · Depende de · Bloquea, Estado, Leer antes, Diseño, Objetivo, Alcance, Base técnica, API pública, Formularios, Tokens, Teclado y accesibilidad, Ejemplos del showcase, CLI, Textos, Trampas, Criterios de hecho y Preguntas abiertas), más «Componentes que usa» en cada Block.
- `docs/plan.md`: la sección «Blocks» con los enlaces nuevos, tamaños, la B.10, el orden recomendado y el aviso del presupuesto; la línea de la M.20.
- `docs/plan/grupo-3-blocks.md`: la sección de la 0.4.0 apunta a los archivos nuevos; en la B.8, el hallazgo de Number Ticker y Timeline con la B.8-a.
- `docs/plan/decisiones.md`: las 20 preguntas indexadas («Blocks 0.4.0»).
- `docs/plan/mantenimiento.md`: en la M.20, el punto (9) con lo manual de cada tarea de la 0.4.0.
- `docs/spec.md` (4, «Blocks»): la precisión de Border Beam, Number Ticker, Timeline y Tabs vertical; la instalación queda pendiente de la B.1.

## Lo que pediste dejar claro

**Cómo se instala un Block (B.1-a, B.1-b, B.1-c).** Recomendación: un tipo nuevo `block` en el registro. Se instala con el mismo comando (`ng g mimi login-01`) y se copia a `aliases.blocks` de `mimi.json`: por defecto, la carpeta hermana de la de componentes (`src/app/blocks`). La CLI escribe ese alias la primera vez en los proyectos de la 0.3.0. Se registra en `mimi.json → blocks` y sus bases van a `.mimi/base/blocks/`. Sus `registryDependencies` son los componentes que usa, que traen sus utils, sus dependencias de npm y sus `@import`. La actualización es todo o nada, como con un componente:

- si el usuario lo modificó, se bloquea, con un aviso propio que no alarma (lo normal es editar un Block);
- se bloquea también si se bloquea uno de sus componentes (no compilaría);
- sus componentes sí se actualizan aunque él quede bloqueado;
- nada depende de un Block.

Las alternativas, con sus costos, están en la B.1: el Block como un componente más, o un schematic aparte.

**Componentes por Block** (todos publicados; ninguno depende de algo posterior, salvo lo marcado):

| Block                  | Componentes (`registryDependencies`)                                                        | Fuera de la 0.4.0                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `login-01`             | card, input, password, checkbox, button, form-field, separator                              | —                                                                                        |
| `login-02`             | input, button, form-field (y avatar si B.3-b)                                               | —                                                                                        |
| `signup-01`            | input, password, checkbox, button, form-field                                               | —                                                                                        |
| `otp-01`               | input-otp, button, card                                                                     | —                                                                                        |
| `settings-01`          | tabs, input, textarea, switch, avatar, badge, progress, button, card, separator, form-field | Tabs vertical → **B.10** (nueva, en la 0.4.0)                                            |
| `pricing-01`           | toggle-group, card, badge, button                                                           | **Border Beam (E.7)** → B.7-a: borde estático                                            |
| `dashboard-01` (0.6.0) | —                                                                                           | Sidebar (escrita dentro), Sheet (G4.2), **Number Ticker (E.6), Timeline (G5.5)** → B.8-a |

**Diseños:** los seis existen (`docs/design/Block login-01.dc.html`, etc.); lo que falta, en «Pendiente del usuario», punto 4.

**Presupuestos del sitio.** El CSS global está en 153,15 kB, con aviso en 160 y error en 175. Estimación por Block, en crudo:

| Block o parte          | kB            |
| ---------------------- | ------------- |
| login-01               | 1–1,5         |
| login-02               | 1–2           |
| signup-01              | 1–1,5         |
| otp-01                 | 0,5–1         |
| settings-01            | 2,5–3,5       |
| pricing-01             | 1,5–2,5       |
| sección y vista previa | 1–1,5         |
| **Total**              | **unos 9–14** |

Con los Blocks en el CSS global quedaría en **162–167 kB**:

- **El aviso salta hacia el tercer o cuarto Block, en cualquier orden.** Con settings-01 antes, salta antes.
- **Ningún orden llega al error.** Lo que cuenta es la suma.

La estimación usa la media del Grupo 2 (unos 2,8 kB por componente con su página) y supone que un Block reutiliza sobre todo utilidades que ya existen. **No está medida.**

La B.1-h recomienda sacar los Blocks del CSS global: una hoja aparte que solo carga la vista previa (`inject: false`), con un spike, y como plan B medir y aceptar el aviso. El JS inicial y `main` no deberían cambiar: las rutas de docs ya son diferidas desde la M.13. Ningún presupuesto se sube sin tu decisión.

**Criterios de hecho y manuales.** Cada tarea tiene su lista. Lo manual (gestores de contraseñas, NVDA, SMS en iOS y Android, teléfonos, Firefox y Safari, contraste del vidrio y movimiento reducido) está además en la M.20, punto (9).

## Criterios de esta tarea

- Un archivo por tarea con la plantilla completa: `docs/plan/blocks/` (9 archivos).
- Índice al día: `docs/plan.md`, «Blocks → v0.4.0».
- Preguntas indexadas, todas con «Recomendación»: `docs/plan/decisiones.md` (20).
- Sin código: `git diff --stat` solo muestra archivos de `docs/`.
- `pnpm format:check`: abajo. **`pnpm build` y `pnpm test`: no se corrieron**, porque no se tocó código. Es una excepción a la regla e de CLAUDE.md, justificada por ser solo documentación; se informa para que la veas.

## Alertas para el revisor

- **Ninguna decisión adoptada**, a pedido tuyo: hasta que las revises, la B.1 no se puede empezar (la regla 3 del plan; en modo autónomo se adoptarían).
- **Estimaciones de CSS sin medir**: salen de la media del Grupo 2. El spike de la B.1-h da los números reales.
- **Idioma de los Blocks (B.1-i):** recomiendo inglés, como los textos por defecto de los componentes, aunque el diseño y el sitio estén en español. Es la que más puede chocar con lo que esperas.
- **Selector `mimi-login-01` (B.1-d):** el archivo pasa a ser del usuario. La alternativa `app-login-01` es razonable.
- IDs: la B.10 es nueva (el siguiente número libre de los Blocks: la B.8 y la B.9 ya existían).

## Archivos

Nuevos: `docs/plan/blocks/B.1.md`, `B.2.md`, `B.3.md`, `B.4.md`, `B.5.md`, `B.6.md`, `B.7.md`, `B.10.md`, `B.P.md`, `docs/auto/plan-0.4.0-2026-11-06.md`. Modificados: `docs/plan.md`, `docs/plan/grupo-3-blocks.md`, `docs/plan/decisiones.md`, `docs/plan/mantenimiento.md`, `docs/spec.md`.

## Commit

`docs(plan): detalla la 0.4.0 (Blocks B.1 a B.7, B.10 y la puerta B.P) con sus preguntas abiertas`, con push solo de `auto/plan-0.4.0-2026-11-06`.
