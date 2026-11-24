# Plan de desarrollo de Mimi

## Cómo usar este plan

Este plan es la lista de trabajo. Lo que es verdad del producto (API, tokens, reglas) está en `docs/spec.md`; cómo se trabaja, en `CLAUDE.md`. Lo terminado está resumido al final («Terminado») y con su texto completo en `docs/historial/`.

**Dónde está cada tarea (desde el 03/11/2026).** Este archivo es el **índice**: una línea por tarea pendiente, con su estado, versión, tamaño, dependencias y el enlace a su detalle, y «Terminado» con una línea por tarea hecha. El detalle está en `docs/plan/`:

- Una tarea con la plantilla completa tiene su propio archivo, con el ID como nombre, en la carpeta de su grupo: así estaban `docs/plan/grupo-2/G2.1.md` y `docs/plan/grupo-2/5.17.md` (hoy en `docs/historial/grupo-2/`, con el grupo cerrado). Las hijas de una tarea paraguas van dentro del archivo de la madre (G2.4a y G2.4b en `G2.4.md`; 5.17a y 5.17b en `5.17.md`).
- Las tareas de una línea van juntas en el archivo de su bloque: `mantenimiento.md`, `mimi-effects.md`, `grupo-5.md`, `plataforma.md` y `version-1.0.md`. Cuando una se detalla, se le crea su archivo propio con la misma regla (por ejemplo, `docs/plan/grupo-3/G3.1.md`) y se actualiza su enlace en el índice.
- Las decisiones abiertas, las «Decididas» y el índice de lo que está «PENDIENTE DE DECIDIR» están en `docs/plan/decisiones.md`.
- Para encontrar una tarea por su ID (por ejemplo, «plan, G1.5b»): el índice de este archivo, o `grep -rn "G2.7" docs/plan/`; si ya está hecha, en `docs/historial/`.

**La casilla de estado** (`[ ]`, `[~]`, `[x]`) vive en el archivo de detalle, que es la fuente de verdad; el índice la copia. Al cambiar el estado de una tarea, se cambia **en los dos sitios** en el mismo cambio. (Lo comprobará el script `check-plan`, tarea M.10; hasta entonces, a mano.)

**Reglas**

1. Una tarea por vez. Antes de escribir código, se propone un plan breve y se espera la aprobación (`CLAUDE.md`, «Forma de trabajar»), salvo en modo autónomo (`CLAUDE.md`, «Modo autónomo»).
2. Antes de empezar, se leen de la tarea: «Leer antes», «Depende de», «Trampas conocidas» y «Criterios de hecho». Si una dependencia no está hecha, no se empieza.
3. «PENDIENTE DE DECIDIR: …» significa que falta una decisión del usuario: se pregunta, no se supone, salvo en modo autónomo (ver «Decidido por defecto», abajo).
4. Los IDs no se renumeran ni se reutilizan: el código y la spec los citan (por ejemplo, «plan, G1.5b» o «tarea 5.3»). Tampoco se reutilizan los de Theme Studio (T.2 a T.5, en `docs/futuro/theme-studio.md`). Una tarea nueva toma el siguiente número libre de su grupo; el mantenimiento sin grupo usa `M.<n>`; la puerta de cada grupo es `G<n>.P`.
5. «Depende de» cita IDs. Para los componentes, la fuente de las dependencias es la tabla de su grupo en la spec 4, «Hoja de ruta»: si el plan y la spec no coinciden, se avisa al usuario en vez de elegir (en modo autónomo se decide por la spec y se registra como «Decidido por defecto»). Excepciones aprobadas por el usuario (dependencias de trabajo, no de componentes, que no van a la tabla de la spec 4): G2.7 y G2.8 dependen de G2.1 solo por el resultado del spike de la convención de valor; G2.1 depende de 5.17a (revisión móvil del Grupo 1); G2.8 depende de M.2 (provisional, por #33974).
6. «Diseño:» indica el archivo de `docs/design/` sin el prefijo `Mimi ` ni la extensión `.dc.html` (los Blocks se llaman `Block <nombre>`). **Desde el 14/11/2026 es solo una referencia de forma** (decidido por el usuario: no hay rediseño global y la fuente de verdad del diseño es el código: `theme-base.css`, `utils/field-styles.ts` y `/docs/states`; ver `docs/design/LEEME.md`).
7. Lo nuevo de aspecto que haga un componente (sin precedente en el tema) se documenta en la spec. Una decisión que sigue vigente va a la spec, no solo al plan. (Hasta el 14/11/2026 se anotaba en `docs/design/correcciones-pendientes.md`, tarea D6, hoy cerrada y en historial.)

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
  - Diseño: archivo(s) de docs/design/ y la sección dentro del archivo, como referencia de forma (los valores salen del código: regla 6).
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
7. Lo nuevo de aspecto del grupo, documentado en la spec (desde el 14/11/2026 ya no se compara con Claude Design ni se anota en D6).
8. Mover el texto de las tareas hechas del grupo a `docs/historial/`.
9. Checklist de release, que ejecuta el usuario: `npm publish`, etiqueta, release de GitHub, despliegue y prueba desde npm.

Los comandos del punto 9 (y los 4 escenarios del punto 5) están en `docs/proceso/release.md`. La puerta la recorre el comando `/cerrar-grupo`; las tareas, `/componente` y `/tarea`, con el protocolo de `CLAUDE.md`, «Forma de trabajar».

**Historial:** `docs/historial/plan-fase-0-3.md`, `plan-0.1.x.md`, `plan-grupo-1.md` (incluye la Fase 4 y la publicación de la 0.2.0), `plan-grupo-2.md` (índice del Grupo 2, con la 5.2, la 5.17 y la publicación de la 0.3.0; el texto de cada tarea, en `docs/historial/grupo-2/`), `plan-blocks.md` (índice de los Blocks de la 0.4.0; el texto de cada tarea, en `docs/historial/blocks/`), `plan-grupo-3.md` (índice del Grupo 3 y de B.9 y B.11 de la 0.5.0; el texto, en `docs/historial/grupo-3/` y `docs/historial/blocks/B.11.md`), `plan-refinamiento-0.6.0.md` (índice del refinamiento de la 0.6.0; el texto, en `docs/historial/refinamiento/R-0.6.0.md`), `plan-refinamiento-0.7.0.md` (índice de la 0.7.0; el texto, en `docs/historial/refinamiento/R-0.7.0.md`), `plan-grupo-4.md` (el Grupo 4 de la 0.8.0; la R.34 y la B.8, en `docs/historial/grupo-4/`), `plan-plataforma.md` y `decisiones.md`.

**Al cerrar un grupo** (desde el Grupo 2): los archivos de sus tareas pasan tal cual de `docs/plan/<grupo>/` a `docs/historial/<grupo>/` (con `git mv`, sin reescribirlos), y `docs/historial/plan-<grupo>.md` lleva el índice, el registro de la publicación y lo que se movió de otros lugares (por ejemplo, «Decididas» de `docs/plan/decisiones.md`). Lo manual que quede pendiente no se deja solo en el historial: va a una tarea abierta (por ejemplo, la M.20).

## En curso

Formato de cada fila: `- ID · rama · quién · desde (DD/MM/AAAA)`.

- M.30 · `auto/0.9.0-tanda1-2026-11-23` · Claude Code (modo autónomo) · 23/11/2026
- M.31 · `auto/0.9.0-tanda1-2026-11-23` · Claude Code (modo autónomo) · 23/11/2026

(La 0.8.0 se publicó el 23/11/2026; registro en `docs/historial/plan-grupo-4.md`.)

(DP.2 a DP.5, hechas el 14/11/2026; la siguiente del plan de páginas es DP.6, Blocks y portada, y la puerta DP.P.)

## Mantenimiento

Detalle: [docs/plan/mantenimiento.md](plan/mantenimiento.md). Desde el 23/11/2026, cada una abierta tiene su versión en el plan hasta la 1.0 ([docs/plan/version-1.0.md](plan/version-1.0.md), decidido por el usuario).

- [ ] M.1 Confirm con acción asíncrona · v0.9.0 (tanda 2) · — · depende: G1.6, G1.7 · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.2 Alinear Angular en la 22.2.x · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.3 Revisar rodeos con aria 22.2 · v0.9.0 (tanda 2) · — · depende: M.2 · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.4 Aviso de la CLI con un cdk o aria anteriores a 22.2.4 (solo avisa) · v0.3.0 · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.5 Pasada con NVDA por los componentes con overlays (la hace el usuario, con la M.20) · v0.9.x · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.6 Select: saltar a una opción con una letra estando cerrado · v0.9.0 (tanda 2) · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.7 Íconos de Lucide en los chunks del showcase · v0.9.x · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.8 La CLI y los bloqueos de «todo o nada» (un Block que no se puede instalar no deja sus dependencias copiadas a medias; a la tanda 2, decidido por el usuario el 23/11/2026) · v0.9.0 (tanda 2) · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.9 (cerrada el 16/11/2026 en la R.P7: `ng g mimi select` en proyectos reales con el `.tgz`) Migrar Select a las utilidades de lista del Combobox (lo que faltaba de la R.15) · v0.7.0 · — · depende: G2.8 · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.10 Script `check-plan` (casillas del índice y del detalle, enlaces, IDs) · v0.9.x · — · depende: la reorganización del plan (PASO 4) · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.11 La CLI y `--overwrite` con la misma versión (era un error; corregido) · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.12 (hecha el 23/11/2026: 20 de 20 corridas con la máquina cargada; queda anotado el arranque en frío de la CLI) Pruebas deterministas con temporizadores y animaciones (Dialog, Toast, docs bajo carga; la parte de docs, hecha el 05/11/2026; la necesita la CI) · v0.9.0 (tanda 1) · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.13 Bajar `main` del showcase (rutas de docs diferidas y menú móvil al abrir; hecha el 06/11/2026: `main` 142,64 → 135,40 kB) · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.14 Color Picker: exponer los dos ejes del área · v0.9.0 (tanda 2) · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.15 (hecha el 23/11/2026: 59 páginas en claro y oscuro y 9 paneles abiertos, sin violaciones; una regla desactivada con su motivo) Pruebas de accesibilidad con axe sobre las páginas del showcase (axe-core aprobado solo como devDependency del repo; en la CI) · v0.9.0 (tanda 1) · — · depende: G2.P · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.16 Auditoría de `readonly`, `aria-labelledby` y `aria-describedby` en todos los controles · v0.9.0 (tanda 2) · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.17 (hecha el 23/11/2026: `apps/docs/src/test-setup.ts`; verde con Node 24.18.0 y 26.13.1) Pruebas de docs independientes del `localStorage` de Node 26 · v0.9.0 (tanda 1) · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.18 (hecha el 23/11/2026: `apps/docs/e2e/`, con la auditoría a 360 px y los guiones de las puertas) Guardar en el repo el script de medición a 360 px (y los guiones de Playwright que usará la CI) · v0.9.0 (tanda 1) · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.19 Excluir `.mimi/` del escaneo de Tailwind (`init` la escribe; `ng g mimi` avisa) · sin versión (sale en la 0.4.0) · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.20 Comprobación manual del Grupo 2 (teléfonos reales y paneles altos, NVDA, Firefox, Safari, VoiceOver, decisiones por defecto antes de la 0.9.9; la release de GitHub y la prueba desde npm de la 0.3.0, hechas; y lo manual de los Blocks de la 0.4.0 cuando se hagan; la hace el usuario; sus arreglos, la 1.0-12) · v0.9.x · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.21 Switch con una entrada `aria-describedby` (y quitar el rodeo de `settings-01`) · v0.9.0 (tanda 2) · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.22 Hash de `blocks.css` en el sitio · v0.9.x · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.23 (hecha el 09/11/2026: las páginas de componentes cargan `components.css` con `@scope`; el CSS global bajó de 180 a 111 kB; ver `docs/auto/refinamiento-0.6.0-parte3-2026-11-09.md`) Por qué el CSS global del sitio crece con cada componente (y una hoja aparte por componente o grupo, como `blocks.css`) · sin versión · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.24 Data Table: la barra, el pie y el botón de orden siguen con `pr-3`, `pl-4` y `-ml-1.5` físicos (no RTL) · v0.9.0 (tanda 2) · S · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.25 (hecha el 15/11/2026: 98,02 kB) Qué hace crecer `main` del sitio (137,83 kB, a 2,17 kB del aviso de 140) y bajarlo antes de añadir componentes (por ejemplo, `tailwind-merge` por `cn()` en la cabecera) · v0.7.0 · M · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.26 (hecha el 14/11/2026) Quitar «provisional, sin diseño» y «plan, D6» del código y de las páginas (sin rediseño, 14/11/2026) · sin versión · S · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.27 (hecha el 15/11/2026, con `mimi-color-input`) `size` en Input OTP y File Upload (sin justificación para no tenerlo; visto en la R.26) · sin versión · S · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.28 (hecha el 16/11/2026; los escenarios del `.tgz`, en la G4.P) Quitar todo lo marcado «hasta la 1.0» (atajos de `variant` de la 0.1.x en Button y Badge, radio de Badge, `paddingX` y `placeholderColor` de Input en el tema, alias `destructive-soft`, `"vivid"`; absorbe 1.0-1 a 1.0-4), con una prueba que falla si queda algo marcado así; **RUPTURA** · v0.8.0 · M · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [x] M.29 (hecha el 23/11/2026) Date Picker y Date Range de la misma familia en el teléfono (pedido del usuario, tanda 1 de la 0.9.0, punto 5) · v0.9.0 (tanda 1) · S · depende: R.34 · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [~] M.30 Table y Data Table en el teléfono: `stack` y `scroll`, la hoja de búsqueda y la paginación compacta (pedido del usuario, punto 6) · v0.9.0 (tanda 1) · M · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] M.31 Auditoría a 360 px de todos los componentes y Blocks, y adaptar los que fallen (pedido del usuario, punto 7) · v0.9.0 (tanda 1) · M · depende: M.18 · [docs/plan/mantenimiento.md](plan/mantenimiento.md)
- [ ] 0.1.1-3 `pnpm publish` da 404 con pnpm 12 (mientras, se publica con npm) · v0.9.x · — · depende: — · [docs/plan/mantenimiento.md](plan/mantenimiento.md)

## Diseño

**Sin rediseño global (decidido por el usuario el 14/11/2026).** El diseño actual (la landing, el tema de la 0.6.0 con el violeta y los grises malva medio, los estados unificados de `/docs/states` y la profundidad B) es el definitivo, y su fuente de verdad es el código (`theme-base.css`, `utils/field-styles.ts`, `/docs/states`). `docs/design/` queda como referencia histórica (`docs/design/LEEME.md`). La D6 se cerró sin llevarla a Claude Design (en «Terminado», «Tandas de diseño»); la 5.16 (Landing v2) se quitó. Lo que quedó abierto de esta limpieza (PD-5 y PD-6) lo decidió el usuario el mismo día (`docs/plan/decisiones.md`).

## Blocks → v0.4.0: pantallas

Cerrada el 07/11/2026 (puerta B.P) y **publicada el 07/11/2026** (`@mimi-ng/cli@0.4.0`, registro en `docs/historial/plan-blocks.md`). Las tareas están en «Terminado» y su texto en `docs/historial/blocks/` (índice: `docs/historial/plan-blocks.md`). `table-01` va con el Grupo 3 (0.5.0) y `dashboard-01` con el Grupo 4 (0.6.0).

## Grupo 3 y Blocks como páginas → v0.5.0: datos

Cerrado (puerta G3.P, revisada por el usuario; **0.5.0 publicada el 09/11/2026**, `2026-11-09T16:26Z` en npm, registro en `docs/historial/plan-grupo-3.md`). Las tareas están en «Terminado» y su texto en `docs/historial/plan-grupo-3.md` y `docs/historial/grupo-3/`.

## Refinamiento → v0.6.0 y v0.7.0 (cerradas)

Detalle: [docs/plan/refinamiento/plan.md](plan/refinamiento/plan.md) (principio «uso corto por defecto, composición cuando la necesites», reparto, orden y rupturas). Origen: las peticiones del usuario tras probar la 0.5.0 ([peticiones-usuario.md](plan/refinamiento/peticiones-usuario.md)). **Tres decisiones del usuario (09/11/2026, ya tomadas):** PD-1 Card, opción B; PD-2 API de Table/Data Table, opción C; PD-3 API de los mensajes de error de Form Field, opciones A + B ([decisiones-usuario.md](plan/refinamiento/decisiones-usuario.md)). Combobox y Select: [combobox-vs-select.md](plan/refinamiento/combobox-vs-select.md).

**0.6.0:** cerrada el 13/11/2026 (puerta R.P6, revisada por el usuario con la fusión del PR #15; versión preparada en `docs/auto/release-0.6.0-2026-11-13.md`; **publicada el 14/11/2026**, `2026-11-14T23:00Z` en npm, registro en `docs/historial/plan-refinamiento-0.6.0.md`). Las tareas están en «Terminado» y su texto en `docs/historial/refinamiento/R-0.6.0.md` (índice: `docs/historial/plan-refinamiento-0.6.0.md`). Lo que faltaba de R.0, R.1, R.7, R.8, R.12, R.14 y R.15 pasó a la 0.7.0 (R.25 a R.32 y M.9); lo manual, a la M.20 (puntos 14 a 18).

**0.7.0:** cerrada el 16/11/2026 (puerta R.P7, recorrida en la rama `auto/0.7.0-tanda3-2026-11-15` y revisada por el usuario con la fusión del PR #21; versión preparada en `docs/auto/release-0.7.0-2026-11-16.md`; **publicada el 16/11/2026**, `2026-11-17T02:31Z` en npm, registro en `docs/historial/plan-refinamiento-0.7.0.md`). Las tareas están en «Terminado» y su texto en `docs/historial/refinamiento/R-0.7.0.md` (índice: `docs/historial/plan-refinamiento-0.7.0.md`). La R.34 abre la 0.8.0 (abajo, en el Grupo 4); lo manual, a la M.20 (puntos 19 a 21); los obsoletos «hasta la 1.0», a la M.28 (0.8.0).

## Páginas de la documentación: una plantilla común (plan del 12/11/2026; decidido el 14/11/2026)

Detalle: [docs/plan/docs-paginas/plan.md](plan/docs-paginas/plan.md). También están la [auditoría](plan/docs-paginas/auditoria.md) de las 38 páginas, los 7 Blocks y la portada, y los [ejemplos](plan/docs-paginas/ejemplos.md) de Button y Select con cada variante. Lo pidió el usuario tras revisar el sitio: «las páginas no tienen una estructura común y presentan demasiada información». **Decidido por el usuario (14/11/2026): PD-4 variante A** (completa) y **PD-4c** con las cuatro recomendaciones de la [Parte C](plan/docs-paginas/parte-c.md): un componente común con configuración; la prueba falla desde DP.0 con la lista de pendientes que solo encoge; los textos de C.3 se aplican tal como están; cada excepción a los límites la aprueba el usuario. La Parte C hace que la plantilla se cumpla sola: el componente `app-doc-page`, la prueba `doc-pages.spec.ts` y los textos para `CLAUDE.md` y los comandos. Solo cambia el sitio; ningún componente ni su API.

- [x] DP.0 (14/11/2026: piezas, prueba, `docs/spec/plantilla-pagina.md` y textos de C.3; Button y Select migrados como piloto y **aprobados por el usuario el 14/11/2026**, sin ajustes; informe `docs/auto/docs-paginas-2026-11-14.md`) Piezas comunes (`app-doc-page` con la configuración `DocPage`, `app-api-table`, `app-more`, «Qué instala» desde el registro), la prueba `doc-pages.spec.ts`, `docs/spec/plantilla-pagina.md`, los textos de `CLAUDE.md` y de los comandos, y Button como piloto · sin versión · L · depende: PD-4 (con PD-4c; decididos el 14/11/2026) · [docs-paginas/parte-c.md](plan/docs-paginas/parte-c.md)
- [x] DP.1 (14/11/2026: Select en el piloto, aprobada por el usuario; Combobox, Dialog, Form Field y Toolbar migradas; quedan para el usuario PD-7 y PD-8, en `docs/plan/decisiones.md`; informe `docs/auto/docs-paginas-2026-11-14.md`, paso 9) Tanda 1, las más pesadas: Select, Combobox, Dialog, Form Field y Toolbar · sin versión · L · depende: DP.0 · [docs-paginas/plan.md](plan/docs-paginas/plan.md)
- [x] DP.2 (14/11/2026: Input con la tanda 1; Switch, Checkbox, Textarea, Password, Input OTP, Number Input, Input Mask y Tags Input en la rama `auto/docs-paginas-2-2026-11-14`) Tanda 2, formularios con ejemplos repetidos (8 páginas) · sin versión · L · depende: DP.1 · [docs-paginas/plan.md](plan/docs-paginas/plan.md)
- [x] DP.3 (14/11/2026) Tanda 3, capas flotantes (7 páginas) · sin versión · M · depende: DP.1 · [docs-paginas/plan.md](plan/docs-paginas/plan.md)
- [x] DP.4 (14/11/2026) Tanda 4, datos y fechas (9 páginas) · sin versión · L · depende: DP.1 · [docs-paginas/plan.md](plan/docs-paginas/plan.md)
- [x] DP.5 (14/11/2026; las 39 páginas con la plantilla y la lista de pendientes quitada; queda PD-9 para el usuario) Tanda 5, simples (8 páginas; Button salió en el piloto) · sin versión · M · depende: DP.1 · [docs-paginas/plan.md](plan/docs-paginas/plan.md)
- [ ] DP.6 Tanda 6, Blocks (`block-doc.ts`) y vitrina de la portada · v0.9.0 (tanda 3) · M · depende: DP.0 · [docs-paginas/plan.md](plan/docs-paginas/plan.md)
- [ ] DP.P Puerta: prueba de estructura sin excepciones y Playwright de todas las páginas · v0.9.0 (tanda 3) · — · depende: DP.1 a DP.6 · [docs-paginas/plan.md](plan/docs-paginas/plan.md)

## Grupo 4 → v0.8.0: estructura (cerrado)

Cerrado el 23/11/2026 (puerta G4.P, recorrida en la rama `auto/0.8.0-puerta-2026-11-23` y revisada por el usuario con la fusión del PR #25; versión preparada en `docs/auto/release-0.8.0-2026-11-23.md`; **publicada el 23/11/2026**, `2026-11-23T21:44Z` en npm, registro en `docs/historial/plan-grupo-4.md`). Las tareas están en «Terminado» y su texto en `docs/historial/plan-grupo-4.md` y `docs/historial/grupo-4/` (R.34 y B.8). La M.28 salió en la 0.8.0 (en «Mantenimiento»). Lo manual, a la M.20 (puntos 22 a 26); el plan hasta la 1.0, abajo.

## Mimi Effects → después de la 1.0.0

Detalle: [docs/plan/mimi-effects.md](plan/mimi-effects.md). **Decidido por el usuario el 23/11/2026** (la G4.P lo dejaba a su decisión): Mimi Effects pasa a **después de la 1.0.0**, en versiones menores de la 1.x (agregar componentes después de la 1.0 es compatible). Sin orden fijo.

- [ ] E.1 Animated Theme Toggler · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.2 Terminal · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.3 Toggler y Terminal en el showcase · después de la 1.0.0 · — · depende: E.1, E.2 · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.4 Marquee · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.5 Bento Grid · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.6 Number Ticker · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.7 Border Beam / Shine Border · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.8 Magic Card · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.9 Blur Fade · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.10 Text Animate · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.11 Animated List · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.12 Confetti · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.13 Ripple · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.14 Fondos: Grid y Dot Pattern · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.15 Marcos Safari e iPhone · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.16 File Tree · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)
- [ ] E.17 Code Comparison · después de la 1.0.0 · — · depende: — · [docs/plan/mimi-effects.md](plan/mimi-effects.md)

## Grupo 5 → después de la 1.0.0 (según lo que pidan los usuarios)

Detalle: [docs/plan/grupo-5.md](plan/grupo-5.md). **Decidido por el usuario el 23/11/2026**: el Grupo 5 pasa a **después de la 1.0.0**, en versiones menores de la 1.x. Sin orden fijo.

- [ ] G5.1 Sidebar de dashboard · después de la 1.0.0 · — · depende: G4.2, G1.2 · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.2 Time Picker · después de la 1.0.0 · — · depende: G1.1 · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.3 Carousel · después de la 1.0.0 · — · depende: — · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.4 Image Preview · después de la 1.0.0 · — · depende: G1.6 · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.5 Timeline · después de la 1.0.0 · — · depende: — · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.6 Resizable · después de la 1.0.0 · — · depende: — · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.7 Hover Card · después de la 1.0.0 · — · depende: G1.1 · [docs/plan/grupo-5.md](plan/grupo-5.md)
- [ ] G5.8 Rating · después de la 1.0.0 · — · depende: — · [docs/plan/grupo-5.md](plan/grupo-5.md)

## Plataforma y experiencia

Detalle: [docs/plan/plataforma.md](plan/plataforma.md). La 5.2 y la 5.17 están en el Grupo 2.

- [ ] 5.1 Schematic `theme` · después de la 1.0.0 · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.3 Comando `mimi` · después de la 1.0.0 · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.4 `mimi update` · después de la 1.0.0 · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.5 Página «Migrar desde PrimeNG / NG-ZORRO» · v0.9.0 (tanda 3) · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.6 Documentación en español e inglés · después de la 1.0.0 · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.8 Buscador ⌘K del showcase · después de la 1.0.0 · — · depende: G3.3 · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.9 Selector ES/EN en el header · después de la 1.0.0 · — · depende: 5.6 · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.10 Navegación superior del header · después de la 1.0.0 · — · depende: 5.2, 5.8 · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.12 GitHub Actions: pruebas de la CLI en proyectos limpios por versión de Angular (la CI de cada PR es la 1.0-5) · v0.9.x · — · depende: 1.0-5 · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.13 Tabla de compatibilidad en la documentación · v0.9.0 (tanda 3) · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.14 Prerender del showcase · v0.9.x · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.15 Badge interactivo · después de la 1.0.0 · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)
- [ ] 5.18 Migraciones automáticas con `ng update` (idea, sin detallar; anotada el 16/11/2026) · después de la 1.0 · — · depende: — · [docs/plan/plataforma.md](plan/plataforma.md)

## Hasta la 1.0.0: 0.9.0, 0.9.x, 0.9.9 y 1.0.0

Detalle: [docs/plan/version-1.0.md](plan/version-1.0.md) (plan escrito el 23/11/2026 a partir del inventario de la puerta de la 0.8.0, `docs/auto/0.8.0-puerta-2026-11-23.md`, sección 4, con lo que decidió el usuario ese día). **0.9.0:** CI, axe, la revisión completa de la API con las últimas rupturas, las páginas que faltan y la declaración de accesibilidad, en cuatro tandas. **0.9.x:** los arreglos de la M.20 manual del usuario. **0.9.9:** la revisión final del usuario. **1.0.0:** el lanzamiento, cuando entra en vigor la política de compatibilidad (spec 12). Las 1.0-1 a 1.0-4 pasaron a la M.28 (v0.8.0); después de la 1.0, el Grupo 5, Mimi Effects y lo de plataforma marcado «después de la 1.0.0».

- [x] 1.0-5 (hecha el 23/11/2026: verde en GitHub en 6 min 56 s; rojo con una prueba rota) CI en GitHub Actions: build, test, format:check y Playwright en Chromium, Firefox y WebKit (y dos teléfonos emulados) en cada PR · v0.9.0 (tanda 1) · L · depende: M.12, M.17, M.18 · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-6 Revisión completa de la API pública (lo que queda fijo en la 1.0), con las últimas rupturas · v0.9.0 (tanda 2) · L · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-7 Nombres inconsistentes (`success` de Input OTP, `min`/`max` frente a `minDate`/`maxDate`, `mimi-date-range` y `MimiDateRangePicker`, `MIMI_DATE_PICKER_TEXT`); **RUPTURA** · v0.9.0 (tanda 2) · M · depende: 1.0-6 · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-8 Data Table: `density` y `size` · v0.9.0 (tanda 2) · S · depende: 1.0-6 · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-9 Página «Personalización» · v0.9.0 (tanda 3) · M · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-10 Página «Iconos» · v0.9.0 (tanda 3) · S · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-11 Declaración de accesibilidad (WCAG 2.2 AA: qué se probó, con qué y qué falta) · v0.9.0 (tanda 3; se completa en la 0.9.9 con la M.20) · M · depende: M.15 · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-P9 Puerta de la 0.9.0 · v0.9.0 (tanda 4) · M · depende: 1.0-5 a 1.0-11 y lo de la 0.9.0 en «Mantenimiento», «Plataforma» y «Páginas» · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-12 Arreglos de la M.20 (una subtarea por hallazgo del usuario; sin rupturas, salvo un bloqueante) · v0.9.x · ? · depende: M.20, 1.0-P9 · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-13 Revisión final del usuario y la 0.9.9 · v0.9.9 · M · depende: 1.0-12, M.20 · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [ ] 1.0-14 Lanzamiento de la 1.0.0 (entra en vigor la política de compatibilidad) · v1.0.0 · M · depende: 1.0-13 · [docs/plan/version-1.0.md](plan/version-1.0.md)

- [x] 1.0-1 (→ M.28, hecha el 16/11/2026) Quitar alias `destructive-soft` y renombrar `destructive-soft-bg` · v0.8.0 (con la M.28) · — · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [x] 1.0-2 (→ M.28, hecha el 16/11/2026) Quitar los atajos de variante de Button y Badge · v0.8.0 (con la M.28) · — · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [x] 1.0-3 (→ M.28, hecha el 16/11/2026) Dejar de aceptar `"style": "vivid"` en `mimi.json` · v0.8.0 (con la M.28) · — · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)
- [x] 1.0-4 (→ M.28, hecha el 16/11/2026) Quitar los nombres de tokens de la 0.1.0 · v0.8.0 (con la M.28) · — · depende: — · [docs/plan/version-1.0.md](plan/version-1.0.md)

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

**Grupo 2, v0.3.0** (`docs/historial/plan-grupo-2.md`, con el texto de cada tarea en `docs/historial/grupo-2/`; publicada el 06/11/2026, `2026-11-07T00:23Z` en npm). Lo manual que quedó pendiente en cada tarea sigue en la M.20.

- [x] G2.0 Catálogo de tokens del Grupo 2 en la spec 13 (04/11/2026; pendiente de comprobación manual: aprobación de las tablas).
- [x] G2.0b Tokens globales del Grupo 2 en el tema (04/11/2026).
- [x] G2.1 Toggle Group (04/11/2026; pendiente de comprobación manual: NVDA y navegador real).
- [x] 5.2 Página «Tema» sencilla (04/11/2026; pendiente de comprobación manual: teclado, lector y contraste en navegador).
- [x] G2.2 Number Input (04/11/2026; pendiente de comprobación manual: NVDA y navegador real).
- [x] G2.3 Password (04/11/2026; pendiente de comprobación manual: gestores de contraseñas, NVDA y navegador).
- [x] G2.4 Input Mask, con G2.4a (máscara de dígitos) y G2.4b (marcador, prefijo e ícono) (04/11/2026; pendiente de comprobación manual: NVDA, Android y navegador).
- [x] G2.5 Input OTP (05/11/2026; pendiente de comprobación manual: NVDA, SMS y navegador).
- [x] G2.6 Tags Input (05/11/2026; pendiente de comprobación manual: NVDA y navegador).
- [x] G2.7 Slider, con el rango doble (05/11/2026; pendiente de comprobación manual: NVDA, táctil y navegador).
- [x] G2.8 Combobox/Autocomplete, con G2.8a (simple) y G2.8b (múltiple con chips) (05/11/2026).
- [x] G2.9 Date Picker y Date Range, con G2.9a y G2.9b (05/11/2026).
- [x] G2.10 Progress (04/11/2026; pendiente de comprobación manual: NVDA y navegador real).
- [x] G2.11 File Upload (05/11/2026).
- [x] G2.12 Color Picker (05/11/2026).
- [x] 5.17 Revisión móvil, con 5.17a (Grupo 1, 04/11/2026) y 5.17b (Grupo 2, 05/11/2026); cerradas el 06/11/2026, pendiente de comprobación manual: teléfonos reales y los paneles altos de C3 (M.20).
- [x] G2.P Puerta del Grupo 2 (06/11/2026; pendiente de comprobación manual: teléfonos reales, NVDA, Firefox, Safari, VoiceOver y las decisiones por defecto para la revisión de la 0.9.9, en la M.20; release de GitHub como Latest y prueba desde npm sin errores, anotadas el 06/11/2026).

**Blocks, v0.4.0** (`docs/historial/plan-blocks.md`, con el texto de cada tarea en `docs/historial/blocks/`; puerta cerrada y publicada el 07/11/2026, sobre las 14:56 de Colombia en npm). Lo manual que quedó pendiente en cada tarea sigue en la M.20.

- [x] B.1 Ítems de tipo `block` en el registro, en la CLI y en el showcase (07/11/2026; pendiente de comprobación manual: teléfono real y Safari).
- [x] B.2 `login-01` (07/11/2026; pendiente de comprobación manual).
- [x] B.3 `login-02` (07/11/2026; pendiente de comprobación manual).
- [x] B.4 `signup-01` (07/11/2026; pendiente de comprobación manual).
- [x] B.5 `otp-01` (07/11/2026; pendiente de comprobación manual).
- [x] B.10 Tabs con orientación vertical (07/11/2026; pendiente de comprobación manual: NVDA).
- [x] B.6 `settings-01` (07/11/2026; pendiente de comprobación manual).
- [x] B.7 `pricing-01` (07/11/2026; pendiente de comprobación manual).
- [x] B.P Puerta de los Blocks (07/11/2026, después de los arreglos de la revisión independiente; la 0.4.0, publicada por el usuario el 07/11/2026, con la release de GitHub como Latest).

**Grupo 3 y Blocks como páginas, v0.5.0** (`docs/historial/plan-grupo-3.md`, con el texto de cada tarea en `docs/historial/grupo-3/` y `docs/historial/blocks/B.11.md`; puerta revisada por el usuario; publicada el 09/11/2026, `2026-11-09T16:26Z` en npm). Lo manual que quedó pendiente en cada tarea sigue en la M.20.

- [x] B.11 Los Blocks de pantalla se generan como páginas del usuario (`ng g mimi login-01` → `src/app/pages/login/`, `LoginPage`, con su `login.routes.ts`; 07/11/2026; pendiente de comprobación manual: navegador real).
- [x] G3.0 Catálogo de tokens del Grupo 3 en la spec 13 (07/11/2026; tablas aprobadas por el usuario).
- [x] G3.1 Tree (07/11/2026; pendiente de comprobación manual: NVDA y navegador real).
- [x] G3.2 Sortable List (07/11/2026; pendiente de comprobación manual: NVDA y teléfono real).
- [x] G3.3 Command (⌘K) (07/11/2026; pendiente de comprobación manual: NVDA y navegador real).
- [x] G3.4 Data Table (07/11/2026; pendiente de comprobación manual: NVDA y navegador real).
- [x] B.9 `table-01` (07/11/2026; pendiente de comprobación manual: teléfono real y NVDA).
- [x] G3.P Puerta del Grupo 3 (07/11/2026, con ocho arreglos el 08/11/2026; revisada por el usuario; pendiente de comprobación manual en la M.20, puntos 10 a 13).

**Refinamiento, v0.6.0** (`docs/historial/plan-refinamiento-0.6.0.md`, con el texto en `docs/historial/refinamiento/R-0.6.0.md`; puerta revisada por el usuario y cerrada el 13/11/2026; publicada el 14/11/2026, `2026-11-14T23:00Z` en npm). Lo que faltaba de las tareas a medias pasó a la 0.7.0 (R.25 a R.32 y M.9); lo manual, a la M.20 (puntos 14 a 18).

- [x] R.0 Tema de marca: escala de violeta en OKLCH, primario `#793EEA`/`#A88FFF`, `MIMI_THEME_NEUTRAL`, contrastes AA con prueba, grises malva medio (09/11/2026 y 13/11/2026; el logo y el favicon, en la R.25).
- [x] R.1 Escala común de tamaños `sm/md/lg` (`mimiSize`, alias `default` con aviso, página «Tamaños»; 10/11/2026; la tabla de la spec, en la R.26; quitar el alias, en la R.32).
- [x] R.2 Tamaños en los controles de formulario (09/11/2026).
- [x] R.3 Switch y Checkbox: páginas separadas y tamaños (09/11/2026).
- [x] R.4 Toast: tamaños (09/11/2026).
- [x] R.5 Toast: variante `outline` con el color del tono (09/11/2026).
- [x] R.6 Dialog: tamaños `sm/md/lg` como anchos máximos (09/11/2026).
- [x] R.7 Dialog como servicio: `chrome: 'none'` (09/11/2026; Confirm con `size`, en la R.27).
- [x] R.8 Tamaños en el resto de componentes, menos Card (10/11/2026; los ejemplos por componente y los Blocks a ojo, en la R.28).
- [x] R.9 Efecto de clic uniforme (09/11/2026; profundidad B el 13/11/2026).
- [x] R.10 Errores visuales: Tabs y Toggle Group en oscuro, Skeleton (09/11/2026).
- [x] R.11 Blocks en carga: todo deshabilitado (09/11/2026).
- [x] R.12 `readonly` en todos los componentes de formulario, con `data-readonly` (09/11/2026 a 13/11/2026; los ejemplos, en la R.29).
- [x] R.13 Ejemplos de formularios (10/11/2026).
- [x] R.14 Form Field: atajos y mensajes de error, PD-3 A + B (09/11/2026; los ejemplos con más elementos y el diagrama, en la R.30).
- [x] R.15 Select: `mimi-option`, `mimi-optgroup`, un ícono al final y la X con hover, foco o panel abierto (09/11/2026 y 13/11/2026; M.9 completa, en la 0.7.0).
- [x] R.16 Combobox con la misma API que Select (09/11/2026).
- [x] R.17 Tabs: atajo `<mimi-tab label>` (09/11/2026).
- [x] R.18 Input OTP: cantidad de dígitos que quepa (09/11/2026).
- [x] R.24 Auditoría de «uso corto» (10/11/2026).
- [x] R.P6 Puerta de la 0.6.0 (recorrida el 10/11/2026; revisada por el usuario con la fusión del PR #15 y cerrada el 13/11/2026; pendiente de comprobación manual en la M.20, puntos 14 a 18).

**Refinamiento, v0.7.0** (`docs/historial/plan-refinamiento-0.7.0.md`, con el texto en `docs/historial/refinamiento/R-0.7.0.md`; puerta revisada por el usuario con la fusión del PR #21 y cerrada el 16/11/2026; publicada el 16/11/2026, `2026-11-17T02:31Z` en npm). M.9, M.25 y M.27 están en «Mantenimiento» (arriba), con su estado. Lo manual, en la M.20 (puntos 19 a 21).

- [x] R.19 Card como superficie `mimiCard` (PD-1, opción B; 15/11/2026; los alias `mimi-card-*` se quitaron el 16/11/2026 por la política de rupturas).
- [x] R.20 Table de directivas (`table`, `mimiTableState`) y Data Table sobre la base, con `expandMode` y `toggle` (PD-2, opción C; 15/11/2026).
- [x] R.21 Sortable List con listas conectadas (`mimi-sortable-group`; 15/11/2026; la zona de soltar es la lista entera desde el 16/11/2026).
- [x] R.22 Block `kanban-01` (15/11/2026).
- [x] R.23 Servicio y directiva de carga (`MimiLoadingService`, `mimiBlock`; 16/11/2026).
- [x] R.25 Logo y favicon del sitio (14/11/2026).
- [x] R.26 Tabla de la escala de tamaños en la spec (15/11/2026).
- [x] R.27 Confirm con `size` (15/11/2026).
- [x] R.28 Ejemplos de tamaño por componente y Blocks que heredan (15/11/2026).
- [x] R.29 Ejemplos de solo lectura (15/11/2026).
- [x] R.30 Form Field: ejemplos con más elementos y el diagrama (15/11/2026).
- [x] R.31 Nota de contraste al cambiar el primario (15/11/2026).
- [x] R.32 Quitar el alias `default` de `size` (RUPTURA; 15/11/2026).
- [x] R.33 Button en carga sigue siendo enfocable (RUPTURA; 15/11/2026).
- [x] R.P7 Puerta de la 0.7.0 (recorrida el 16/11/2026; revisada por el usuario con la fusión del PR #21 y cerrada el 16/11/2026; pendiente de comprobación manual en la M.20, puntos 19 a 21).

**Grupo 4, v0.8.0** (`docs/historial/plan-grupo-4.md`, con la R.34 y la B.8 en `docs/historial/grupo-4/`; puerta revisada por el usuario con la fusión del PR #25 y cerrada el 23/11/2026; publicada el 23/11/2026). La M.28 está en «Mantenimiento» (arriba), con su estado. Lo manual, en la M.20 (puntos 22 a 26).

- [x] R.34 Modo móvil de los paneles flotantes (hoja inferior y pantalla completa, `presentation`, `utils/sheet.ts`; 19/11/2026).
- [x] G4.2 Sheet/Drawer (lados izquierda, derecha y abajo, sobre la hoja de la R.34; 19/11/2026; el bloqueo de scroll sin barra ni salto, 23/11/2026).
- [x] G4.1 Accordion (base propia, `region` automático; 22/11/2026).
- [x] G4.3 Stepper (22/11/2026; las líneas de borde a borde, 23/11/2026).
- [x] B.8 `dashboard-01` (con Table y Sheet; 22/11/2026).
- [x] G4.P Puerta de la 0.8.0 (recorrida el 23/11/2026; revisada por el usuario con la fusión del PR #25 y cerrada el 23/11/2026; Mimi Effects y el Grupo 5, después de la 1.0.0; pendiente de comprobación manual en la M.20, puntos 22 a 26).

**Tandas de diseño** (texto completo en la línea)

- [x] D2 Diseño: Grupo 2 y Theme Studio. Archivos: `F3 Archivos Tags Toggle Color` (con `Color Picker`), `F3 Combobox Fechas Hora`, `F3 Slider OTP Numero Mascara` y `Theme Studio`; variables en `mimi-variables-fase3.css` (en `tokens-mimi.css`). La hoja de tokens todavía no tiene tablas para estos componentes: se agregan antes de construirlos. (Theme Studio pasó a ser un proyecto aparte: `docs/futuro/theme-studio.md`.)
- [x] D3 Diseño: Grupo 3. Archivos: `F4 Command Tree Sortable`, `F4 Data Table y Pagination` (con `Data Table`) y `F4 Panel admin` (composición de referencia).
- [x] D4 Diseño: Grupo 4, Grupo 5 y Mimi Effects. Archivos: `F5 Estructura`, `F5 Dashboard y Media` y `F5 Effects`.
- [x] D5 Diseño: Blocks. Archivos: `F6 Blocks` (índice) y `Block <nombre>` de cada uno.
- [x] D6 Correcciones de diseño pendientes (Claude Design): **cerrada sin hacer el 14/11/2026** (decidido por el usuario: no hay rediseño; el código manda). `docs/design/correcciones-pendientes.md` queda como historial de en qué se apartó Mimi del diseño original.

**Plataforma** (`docs/historial/plan-plataforma.md`)

- [x] 5.7 Publicar `@mimi-ng/cli` en npm (30/09/2026, en la 0.1.0).
- [x] 5.11 CodePreview e InstallCommand con `<mimi-tabs>` (20/10/2026).
