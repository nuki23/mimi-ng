# Plan de desarrollo de Mimi

## Cómo usar este plan

Este plan es la lista de trabajo. Lo que es verdad del producto (API, tokens, reglas) está en `docs/spec.md`; cómo se trabaja, en `CLAUDE.md`. Lo terminado está resumido al final («Terminado») y con su texto completo en `docs/historial/`.

**Dónde está cada tarea (desde el 03/11/2026).** Este archivo es el **índice**: una línea por tarea pendiente, con su estado, versión, tamaño, dependencias y el enlace a su detalle, y «Terminado» con una línea por tarea hecha. El detalle está en `docs/plan/`:

- Una tarea con la plantilla completa tiene su propio archivo, con el ID como nombre: `docs/plan/grupo-2/G2.1.md`, `docs/plan/grupo-2/5.17.md`. Las hijas de una tarea paraguas van dentro del archivo de la madre (G2.4a y G2.4b en `G2.4.md`; 5.17a y 5.17b en `5.17.md`).
- Las tareas de una línea van juntas en el archivo de su bloque: `mantenimiento.md`, `grupo-3-blocks.md`, `grupo-4.md`, `mimi-effects.md`, `grupo-5.md`, `plataforma.md` y `version-1.0.md`. Cuando una se detalla, se le crea su archivo propio con la misma regla (por ejemplo, `docs/plan/grupo-3/G3.1.md`) y se actualiza su enlace en el índice.
- Las decisiones abiertas, las «Decididas» y el índice de lo que está «PENDIENTE DE DECIDIR» están en `docs/plan/decisiones.md`.
- Para encontrar una tarea por su ID (por ejemplo, «plan, G1.5b»): el índice de este archivo, o `grep -rn "G2.7" docs/plan/`; si ya está hecha, en `docs/historial/`.

**La casilla de estado** (`[ ]`, `[~]`, `[x]`) vive en el archivo de detalle, que es la fuente de verdad; el índice la copia. Al cambiar el estado de una tarea, se cambia **en los dos sitios** en el mismo cambio. (Lo comprobará el script `check-plan`, tarea M.10; hasta entonces, a mano.)

**Reglas**

1. Una tarea por vez. Antes de escribir código, se propone un plan breve y se espera la aprobación (`CLAUDE.md`, «Forma de trabajar»), salvo en modo autónomo (`CLAUDE.md`, «Modo autónomo»).
2. Antes de empezar, se leen de la tarea: «Leer antes», «Depende de», «Trampas conocidas» y «Criterios de hecho». Si una dependencia no está hecha, no se empieza.
3. «PENDIENTE DE DECIDIR: …» significa que falta una decisión del usuario: se pregunta, no se supone, salvo en modo autónomo (ver «Decidido por defecto», abajo).
4. Los IDs no se renumeran ni se reutilizan: el código y la spec los citan (por ejemplo, «plan, G1.5b» o «tarea 5.3»). Tampoco se reutilizan los de Theme Studio (T.2 a T.5, en `docs/futuro/theme-studio.md`). Una tarea nueva toma el siguiente número libre de su grupo; el mantenimiento sin grupo usa `M.<n>`; la puerta de cada grupo es `G<n>.P`.
5. «Depende de» cita IDs. Para los componentes, la fuente de las dependencias es la tabla de su grupo en la spec 4, «Hoja de ruta»: si el plan y la spec no coinciden, se avisa al usuario en vez de elegir (en modo autónomo se decide por la spec y se registra como «Decidido por defecto»). Excepciones aprobadas por el usuario (dependencias de trabajo, no de componentes, que no van a la tabla de la spec 4): G2.7 y G2.8 dependen de G2.1 solo por el resultado del spike de la convención de valor; G2.1 depende de 5.17a (revisión móvil del Grupo 1); G2.8 depende de M.2 (provisional, por #33974).
6. «Diseño:» indica el archivo de `docs/design/` sin el prefijo `Mimi ` ni la extensión `.dc.html` (los Blocks se llaman `Block <nombre>`).
7. Lo que un componente haga distinto del diseño, o sin diseño, se anota en `docs/design/correcciones-pendientes.md` (tarea D6). Una decisión que sigue vigente va a la spec, no solo al plan.

**Estados**

- `[ ]` pendiente.
- `[~]` en curso: además, una fila en «En curso».
- `[x]` hecha: solo cuando se cumplen **todos** sus «Criterios de hecho». Al cerrarla, su texto completo pasa a `docs/historial/plan-grupo-<n>.md` (o al archivo del historial que corresponda) y aquí queda una línea en «Terminado».
- Con el plan dividido: al cerrar una tarea, su línea del índice pasa a «Terminado» y su archivo de `docs/plan/` se borra cuando su texto ya está en el historial (o, si va junto con su grupo, en la puerta del grupo).
- En modo autónomo (`CLAUDE.md`, «Modo autónomo», A6): `[~]` con la nota «a falta de comprobación del usuario» cuando el criterio principal es manual (cuenta como hecha para las dependencias en ese modo), y `[x]` con la nota «pendiente de comprobación manual» cuando lo manual es un criterio menor.

**Decidido por defecto.** En modo autónomo (`CLAUDE.md`), una «PENDIENTE DE DECIDIR» se resuelve sola, con la «Recomendación» de la tarea o, si no la hay, con la opción más simple y coherente con la spec. Se escribe en la tarea como «Decidido por defecto (DD/MM/AAAA), pendiente de revisión del usuario» y se registra en `docs/auto/decisiones-por-defecto.md`, con «RUPTURA» si cambia algo publicado. **No cuenta como PENDIENTE DE DECIDIR:** sale del índice de `docs/plan/decisiones.md` y no bloquea la tarea ni las siguientes. Si el usuario la cambia al revisarla, la fila se marca «Cambiada» y la corrección es una tarea nueva (`M.<n>`) o va en la tarea que corresponda.

**Tamaños:** S, menos de una sesión; M, una sesión; L, más de una sesión o con un spike previo.

**Plantilla de tarea** (la usa cada tarea pendiente que se detalla; los campos que no aplican dicen «No aplica»):

```markdown
- [ ] ID Nombre
  - Versión · Tamaño (S/M/L) · Depende de: IDs · Bloquea: IDs
  - Estado: (solo mientras está en curso: rama, quién, desde)
  - Leer antes: secciones de la spec y tareas hechas de referencia.
  - Diseño: archivo(s) de docs/design/ y la sección dentro del archivo.
  - Objetivo: 1 o 2 frases.
  - Alcance: incluye / NO incluye (lo que se deja fuera a propósito).
  - Base técnica: @angular/aria, @angular/cdk o ninguna, y por qué (spec 4, «Base técnica»). Patrón WAI-ARIA. Si hace falta un spike, dilo.
  - API pública propuesta: selector, inputs, outputs, model, contenido proyectado; class / panelClass según la regla de la spec 4.
  - Formularios: FormValueControl / FormCheckboxControl o campo nativo con directiva (spec 8); prueba con [formField], formControlName y ngModel.
  - Tokens: tabla en la spec 13 (existen / faltan); qué registrar en theme/types.ts, COMPONENT_PREFIX y component-tokens.ts.
  - Teclado y accesibilidad: teclas, foco, roles, lector de pantalla; qué se prueba en test y qué a mano.
  - Ejemplos del showcase: la lista de estados que muestra la página.
  - CLI: dependencias de npm, otros archivos de ui-core, @import de CSS, entrada de registry.json.
  - Textos: si lleva textos propios, provideMimi…Text con su versión _ES.
  - Trampas conocidas: de tareas parecidas ya hechas y de la spec.
  - Criterios de hecho: lista verificable.
  - Preguntas abiertas: PENDIENTE DE DECIDIR.
```

**Puerta del grupo** (`G<n>.P`, la última tarea de cada grupo; la recorre `/cerrar-grupo` cuando exista):

1. La spec al día: sección 4 (catálogo y archivos), 13 (tokens), 2 (versiones), 12 (compatibilidad).
2. `CHANGELOG.md` con la sección de la versión y, si cambia algo de lo publicado, cómo actualizar desde la anterior.
3. Showcase: Fundamentos (`FOUNDATION_PACKAGES` y la tabla de paquetes), `INTRODUCTION_COMPONENTS` de Introducción, la landing y el README de la CLI (lista de componentes); `x-prompt` de `packages/cli/src/ui/schema.json`.
4. `registry.json` y las pruebas de la CLI.
5. Prueba real con el `.tgz` en 4 escenarios: npm nuevo, pnpm nuevo, actualización desde la versión anterior sin cambios y con un archivo modificado. En Windows, los proyectos de prueba en una ruta corta (el límite de 260 caracteres rompió `ng serve` con pnpm en la 0.2.0).
6. Presupuestos de bundle (spec 10): JS inicial y CSS global, crudo y gzip, antes y después.
7. `docs/design/correcciones-pendientes.md` (D6) al día con lo del grupo.
8. Mover el texto de las tareas hechas del grupo a `docs/historial/`.
9. Checklist de release, que ejecuta el usuario: `npm publish`, etiqueta, release de GitHub, despliegue y prueba desde npm.

Los comandos del punto 9 (y los 4 escenarios del punto 5) están en `docs/proceso/release.md`. La puerta la recorre el comando `/cerrar-grupo`; las tareas, `/componente` y `/tarea`, con el protocolo de `CLAUDE.md`, «Forma de trabajar».

**Historial:** `docs/historial/plan-fase-0-3.md`, `plan-0.1.x.md`, `plan-grupo-1.md` (incluye la Fase 4 y la publicación de la 0.2.0), `plan-plataforma.md` y `decisiones.md`.

## En curso

Nada en curso. Formato de cada fila: `- ID · rama · quién · desde (DD/MM/AAAA)`.

## Mantenimiento

Detalle: [docs/plan/mantenimiento.md](plan/mantenimiento.md). Sin versión propia: salen en la siguiente versión que se publique.

- [ ] M.1 Confirm con acción asíncrona · sin versión · — · depende: G1.6, G1.7 · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.2 Alinear Angular en la 22.2.x · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.3 Revisar rodeos con aria 22.2 · sin versión · — · depende: M.2 · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.4 Aviso de la CLI con un cdk anterior a `^22.2.0` · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.5 Pasada con NVDA por los componentes con overlays · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.6 Select: saltar a una opción con una letra estando cerrado · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.7 Íconos de Lucide en los chunks del showcase · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.8 La CLI y los bloqueos de «todo o nada» · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.9 Migrar Select a las utilidades de lista del Combobox · sin versión · — · depende: G2.8 · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.10 Script `check-plan` (casillas del índice y del detalle, enlaces, IDs) · sin versión · — · depende: la reorganización del plan (PASO 4) · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] 0.1.1-3 `pnpm publish` da 404 con pnpm 12 · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)

## Diseño

- [ ] D6 Correcciones de diseño pendientes (Claude Design). La lista está en `docs/design/correcciones-pendientes.md`: cada componente nuevo agrega ahí lo que hizo distinto del diseño o sin diseño, y se resuelve en Claude Design cuando se decida, sin bloquear ningún grupo. Quién: el usuario resuelve en Claude Design; Claude Code anota.

## Grupo 2 → v0.3.0: entradas avanzadas

Componentes de la spec 4 («Hoja de ruta», tabla del Grupo 2). Orden recomendado (respeta las dependencias): G2.0 → G2.0b → 5.17a → G2.1 → 5.2 → G2.10 → G2.2 → G2.3 → G2.4a → G2.4b → G2.5 → G2.6 → G2.7 → G2.8 → G2.9 → G2.11 → G2.12 → 5.17b → G2.P. La 5.17a (revisión móvil del Grupo 1) va antes de G2.1 por decisión del usuario (03/11/2026; ver 5.17a); no depende de G2.0 ni de G2.0b y puede hacerse antes que ellas. Con las dependencias cumplidas, el orden entre G2.2 a G2.5 se puede cambiar.

Detalle: un archivo por tarea en `docs/plan/grupo-2/` (el nombre es el ID). G2.4a y G2.4b están dentro de `G2.4.md`; 5.17a y 5.17b, dentro de `5.17.md`.

- [x] G2.0 Catálogo de tokens del Grupo 2 en la spec 13 (pendiente de comprobación manual: aprobación de las tablas) · v0.3.0 · M · depende: — · [docs/plan/grupo-2/G2.0.md](plan/grupo-2/G2.0.md)
- [x] G2.0b Tokens globales del Grupo 2 en el tema · v0.3.0 · M · depende: G2.0 · [docs/plan/grupo-2/G2.0b.md](plan/grupo-2/G2.0b.md)
- [ ] G2.1 Toggle Group · v0.3.0 · M · depende: G2.0, G2.0b, 5.17a · [docs/plan/grupo-2/G2.1.md](plan/grupo-2/G2.1.md)
- [ ] 5.2 Página «Tema» sencilla · v0.3.0 · M · depende: G2.1, G2.0b · [docs/plan/grupo-2/5.2.md](plan/grupo-2/5.2.md)
- [ ] G2.2 Number Input · v0.3.0 · M · depende: G2.0, G2.0b · [docs/plan/grupo-2/G2.2.md](plan/grupo-2/G2.2.md)
- [ ] G2.3 Password · v0.3.0 · M · depende: G2.0, G2.0b, 2.2 · [docs/plan/grupo-2/G2.3.md](plan/grupo-2/G2.3.md)
- [ ] G2.4 Input Mask (paraguas de G2.4a y G2.4b) · v0.3.0 · paraguas · depende: las de G2.4a y G2.4b · [docs/plan/grupo-2/G2.4.md](plan/grupo-2/G2.4.md)
- [ ] G2.4a Input Mask: máscara de dígitos · v0.3.0 · M · depende: G2.0, G2.0b, 2.2 · [docs/plan/grupo-2/G2.4.md](plan/grupo-2/G2.4.md)
- [ ] G2.4b Input Mask: marcador, prefijo e ícono · v0.3.0 · S · depende: G2.4a · [docs/plan/grupo-2/G2.4.md](plan/grupo-2/G2.4.md)
- [ ] G2.5 Input OTP · v0.3.0 · M · depende: G2.0, G2.0b · [docs/plan/grupo-2/G2.5.md](plan/grupo-2/G2.5.md)
- [ ] G2.6 Tags Input · v0.3.0 · M · depende: G2.0, G2.0b, 2.4, 2.2 · [docs/plan/grupo-2/G2.6.md](plan/grupo-2/G2.6.md)
- [ ] G2.7 Slider (rango doble) · v0.3.0 · L · depende: G2.0, G2.0b, G1.2, G2.1 · [docs/plan/grupo-2/G2.7.md](plan/grupo-2/G2.7.md)
- [ ] G2.8 Combobox/Autocomplete · v0.3.0 · L · depende: G2.0, G2.0b, G1.1, G1.5, G2.6, G2.1, M.2 (provisional) · [docs/plan/grupo-2/G2.8.md](plan/grupo-2/G2.8.md)
- [ ] G2.9 Date Picker y Date Range · v0.3.0 · L · depende: G2.0, G2.0b, G1.1, 2.1 · [docs/plan/grupo-2/G2.9.md](plan/grupo-2/G2.9.md)
- [ ] G2.10 Progress · v0.3.0 · M · depende: G2.0, G2.0b · [docs/plan/grupo-2/G2.10.md](plan/grupo-2/G2.10.md)
- [ ] G2.11 File Upload · v0.3.0 · M · depende: G2.0, G2.0b, 2.1, G2.10 · [docs/plan/grupo-2/G2.11.md](plan/grupo-2/G2.11.md)
- [ ] G2.12 Color Picker · v0.3.0 · M · depende: G2.0, G2.0b, G1.1, G2.7, 2.2 · [docs/plan/grupo-2/G2.12.md](plan/grupo-2/G2.12.md)
- [ ] 5.17 Revisión móvil (paraguas de 5.17a y 5.17b) · v0.3.0 · paraguas · depende: las de 5.17a y 5.17b · [docs/plan/grupo-2/5.17.md](plan/grupo-2/5.17.md)
- [ ] 5.17a Revisión móvil del Grupo 1 (antes de G2.1) · v0.3.0 o 0.2.1 · M · depende: — · [docs/plan/grupo-2/5.17.md](plan/grupo-2/5.17.md)
- [ ] 5.17b Revisión móvil del Grupo 2 · v0.3.0 · M · depende: 5.17a, G2.1 a G2.12 · [docs/plan/grupo-2/5.17.md](plan/grupo-2/5.17.md)
- [ ] G2.P Puerta del Grupo 2 · v0.3.0 · L · depende: G2.0 a G2.12, 5.2, 5.17a, 5.17b · [docs/plan/grupo-2/G2.P.md](plan/grupo-2/G2.P.md)

## Grupo 3 y Blocks → v0.4.0: datos y pantallas

Detalle: [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md) (tareas de una línea; cada una tendrá su archivo cuando se detalle).

- [ ] G3.1 Tree · v0.4.0 · — · depende: G2.P, 2.10 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] G3.2 Sortable List · v0.4.0 · — · depende: G2.P · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] G3.3 Command (⌘K) · v0.4.0 · — · depende: G2.P, G1.6, G2.8 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] G3.4 Data Table · v0.4.0 · — · depende: G2.P, 2.10, G1.3, G1.11, 2.2 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] B.1 Ítems de tipo `block` en el registro · v0.4.0 · — · depende: G2.P · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] B.2 `login-01` · v0.4.0 · — · depende: B.1 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] B.3 `login-02` · v0.4.0 · — · depende: B.1 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] B.4 `signup-01` · v0.4.0 · — · depende: B.1 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] B.5 `otp-01` · v0.4.0 · — · depende: B.1, G2.5 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] B.6 `settings-01` · v0.4.0 · — · depende: B.1 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] B.7 `pricing-01` · v0.4.0 · — · depende: B.1 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] B.8 `dashboard-01` · v0.4.0 · — · depende: B.1, G3.4 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] B.9 `table-01` · v0.4.0 · — · depende: B.1, G3.4 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)
- [ ] G3.P Puerta del Grupo 3 y Blocks · v0.4.0 · — · depende: G3.1 a G3.4, B.1 a B.9 · [docs/plan/grupo-3-blocks.md](plan/grupo-3-blocks.md)

## Grupo 4 → v0.5.0: estructura

Detalle: [docs/plan/grupo-4.md](plan/grupo-4.md).

- [ ] G4.1 Accordion · v0.5.0 · — · depende: G3.P · [docs/plan/grupo-4.md](plan/grupo-4.md)
- [ ] G4.2 Sheet/Drawer · v0.5.0 · — · depende: G3.P, G1.6 · [docs/plan/grupo-4.md](plan/grupo-4.md)
- [ ] G4.3 Stepper · v0.5.0 · — · depende: G3.P, 2.1, G2.10 · [docs/plan/grupo-4.md](plan/grupo-4.md)
- [ ] G4.P Puerta del Grupo 4 · v0.5.0 · — · depende: G4.1 a G4.3 · [docs/plan/grupo-4.md](plan/grupo-4.md)

## Mimi Effects (sin versión asignada)

Detalle: [docs/plan/mimi-effects.md](plan/mimi-effects.md). La versión se decide en la G4.P.

- [ ] E.1 Animated Theme Toggler · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.2 Terminal · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.3 Toggler y Terminal en el showcase · sin versión · — · depende: E.1, E.2 · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.4 Marquee · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.5 Bento Grid · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.6 Number Ticker · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.7 Border Beam / Shine Border · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.8 Magic Card · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.9 Blur Fade · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.10 Text Animate · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.11 Animated List · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.12 Confetti · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.13 Ripple · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.14 Fondos: Grid y Dot Pattern · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.15 Marcos Safari e iPhone · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.16 File Tree · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.17 Code Comparison · sin versión · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)

## Grupo 5: según lo que pidan los usuarios (sin versión asignada)

Detalle: [docs/plan/grupo-5.md](plan/grupo-5.md). Sin orden fijo ni versión.

- [ ] G5.1 Sidebar de dashboard · sin versión · — · depende: G4.2, G1.2 · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.2 Time Picker · sin versión · — · depende: G1.1 · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.3 Carousel · sin versión · — · depende: — · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.4 Image Preview · sin versión · — · depende: G1.6 · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.5 Timeline · sin versión · — · depende: — · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.6 Resizable · sin versión · — · depende: — · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.7 Hover Card · sin versión · — · depende: G1.1 · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.8 Rating · sin versión · — · depende: — · [docs/plan/grupo-5.md](plan/grupo-5.md)

## Plataforma y experiencia

Detalle: [docs/plan/plataforma.md](plan/plataforma.md). La 5.2 y la 5.17 están en el Grupo 2.

- [ ] 5.1 Schematic `theme` · sin versión · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.3 Comando `mimi` · sin versión · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.4 `mimi update` · sin versión · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.5 Página «Migrar desde PrimeNG / NG-ZORRO» · sin versión · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.6 Documentación en español e inglés · sin versión · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.8 Buscador ⌘K del showcase · sin versión · — · depende: G3.3 · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.9 Selector ES/EN en el header · sin versión · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.10 Navegación superior del header · sin versión · — · depende: 5.2, 5.8 · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.12 GitHub Actions: pruebas de la CLI · sin versión · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.13 Tabla de compatibilidad en la documentación · sin versión · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.14 Prerender del showcase · sin versión · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.15 Badge interactivo · sin versión · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.16 Landing v2 · sin versión · — · depende: E.2, E.4 (si se usan) · [docs/plan/plataforma.md](plan/plataforma.md)

## Versión 1.0

Detalle: [docs/plan/version-1.0.md](plan/version-1.0.md).

- [ ] 1.0-1 Quitar alias `destructive-soft` y renombrar `destructive-soft-bg` · v1.0.0 · — · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-2 Quitar los atajos de variante de Button y Badge · v1.0.0 · — · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-3 Dejar de aceptar `"style": "vivid"` en `mimi.json` · v1.0.0 · — · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-4 Quitar los nombres de tokens de la 0.1.0 · v1.0.0 · — · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)

## Decisiones pendientes

Las decisiones abiertas, las «Decididas» del Grupo 2 y el índice de lo que está «PENDIENTE DE DECIDIR» están en [docs/plan/decisiones.md](plan/decisiones.md).

## Terminado

Una línea por tarea. La fecha es la del «Hecho» del plan cuando la tenía y, si no, la del commit de la tarea. El texto completo está en `docs/historial/`.

**Fases 0 a 3** (`docs/historial/plan-fase-0-3.md`)

- [x] 0.1 Instalar Node.js, pnpm y git (sin fecha registrada).
- [x] 0.2 Diseños de Claude Design en `docs/design/` (22/09/2026).
- [x] 0.3 Estilo del MVP: un solo tema base, Mimi (sin fecha registrada).
- [x] 0.4 `git init` y primer commit (22/09/2026).
- [x] 1.1 Monorepo (22/09/2026).
- [x] 1.2 `apps/docs` y `packages/ui-core` (22/09/2026).
- [x] 1.3 Tokens en `theme-base.css` (22/09/2026).
- [x] 1.4 Utils `cn.ts` y `control-styles.ts` (22/09/2026).
- [x] 1.4b Workspace de Angular en la raíz (23/09/2026).
- [x] 1.5 Tema: `types.ts` y `provideMimiTheme()` (23/09/2026).
- [x] 1.6 Layout del showcase (23/09/2026).
- [x] 1.7 `CodePreview` (23/09/2026).
- [x] 2.1 Button (24/09/2026).
- [x] 2.2 Input (24/09/2026).
- [x] 2.3 Textarea (24/09/2026).
- [x] 2.4 Badge (24/09/2026).
- [x] 2.5 Card (24/09/2026).
- [x] 2.6 Separator (25/09/2026).
- [x] 2.7 Skeleton (25/09/2026).
- [x] 2.8 Avatar (28/09/2026).
- [x] 2.9 Switch (28/09/2026).
- [x] 2.10 Checkbox (28/09/2026).
- [x] 2.11 FormField y FormError (29/09/2026).
- [x] 2.12 Landing del showcase (29/09/2026).
- [x] 3.1 `packages/cli` y `registry.json` (29/09/2026).
- [x] 3.2 Build de las plantillas de la CLI (29/09/2026).
- [x] 3.3 Schematic `init` (29/09/2026).
- [x] 3.4 Schematic `ng-add` (29/09/2026).
- [x] 3.5 Schematic `ui` (29/09/2026).
- [x] 3.6 `schematicCollections` (29/09/2026).
- [x] 3.7 Prueba de la CLI en proyectos limpios (29/09/2026).
- [x] 3.8 Versión del showcase desde `@mimi-ng/cli` (29/09/2026).
- [x] 3.9 Instalación revisada contra la CLI real (29/09/2026).

**Versiones 0.1.0 y 0.1.1** (`docs/historial/plan-0.1.x.md`)

- [x] L.1 READMEs (29/09/2026).
- [x] L.2 `package.json` de la CLI (sin fecha registrada).
- [x] L.3 Documentación en Cloudflare Workers (30/09/2026).
- [x] L.3b Comando `ng g mimi` (30/09/2026).
- [x] L.4 Dry-run del paquete (30/09/2026).
- [x] L.5 Quitar `"private": true` (30/09/2026).
- [x] L.6 Después de publicar la 0.1.0 (30/09/2026).
- [x] 0.1.1-1 `ng add --icons=false` (04/10/2026).
- [x] 0.1.1-2 `minimumReleaseAge` de pnpm (04/10/2026).

**Fase 4 y Grupo 1, v0.2.0** (`docs/historial/plan-grupo-1.md`; publicada el 21/10/2026)

- [x] D1 Diseño de tokens, Grupo 1 y mimi-toolbar (01/10/2026).
- [x] 4.3 Evaluar `@angular/aria` frente a `@angular/cdk` (01/10/2026).
- [x] 4.4 Páginas /dev fuera del build de producción (04/10/2026).
- [x] T.0 Catálogo de tokens en la spec 13 (01/10/2026).
- [x] T.0b Tokens propios de los componentes existentes (06/10/2026).
- [x] T.1 Tokens nuevos de `tokens-mimi.css` (01/10/2026).
- [x] V.1 Variante y tono en Button y Badge (01/10/2026).
- [x] V.2 Quitar el nombre «Vivid» del código (04/10/2026).
- [x] G1.1 Popover (06/10/2026).
- [x] G1.2 Tooltip (07/10/2026).
- [x] G1.3 Dropdown Menu (12/10/2026).
- [x] G1.4 Context Menu (13/10/2026).
- [x] G1.5 Select (13/10/2026).
- [x] G1.5b Revisión de aria después del Select (13/10/2026). La lista de rodeos de aria está ahora en la spec 4, «Base técnica», subsección «Rodeos de aria»; el resto, en el historial.
- [x] G1.6 Dialog (13/10/2026).
- [x] G1.7 Confirm (14/10/2026).
- [x] G1.8 Toast (14/10/2026).
- [x] G1.9 Tabs (15/10/2026).
- [x] G1.10 mimi-toolbar (20/10/2026).
- [x] G1.11 Pagination (20/10/2026). PENDIENTE: el informe de cierre de la G1.11 («Comprobado en Chrome real: ver el informe de cierre») no está en el repo; lo tiene el usuario en el chat.
- [x] G1.12 Página «Fundamentos» (20/10/2026).

**Tandas de diseño** (texto completo en la línea)

- [x] D2 Diseño: Grupo 2 y Theme Studio. Archivos: `F3 Archivos Tags Toggle Color` (con `Color Picker`), `F3 Combobox Fechas Hora`, `F3 Slider OTP Numero Mascara` y `Theme Studio`; variables en `mimi-variables-fase3.css` (en `tokens-mimi.css`). La hoja de tokens todavía no tiene tablas para estos componentes: se agregan antes de construirlos. (Theme Studio pasó a ser un proyecto aparte: `docs/futuro/theme-studio.md`.)
- [x] D3 Diseño: Grupo 3. Archivos: `F4 Command Tree Sortable`, `F4 Data Table y Pagination` (con `Data Table`) y `F4 Panel admin` (composición de referencia).
- [x] D4 Diseño: Grupo 4, Grupo 5 y Mimi Effects. Archivos: `F5 Estructura`, `F5 Dashboard y Media` y `F5 Effects`.
- [x] D5 Diseño: Blocks. Archivos: `F6 Blocks` (índice) y `Block <nombre>` de cada uno.

**Plataforma** (`docs/historial/plan-plataforma.md`)

- [x] 5.7 Publicar `@mimi-ng/cli` en npm (30/09/2026, en la 0.1.0).
- [x] 5.11 CodePreview e InstallCommand con `<mimi-tabs>` (20/10/2026).
