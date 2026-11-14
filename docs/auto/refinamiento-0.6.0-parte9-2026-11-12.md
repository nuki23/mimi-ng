# Refinamiento 0.6.0, novena tanda: unificación de los controles (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 8](refinamiento-0.6.0-parte8-2026-11-12.md)

Encargo del 12/11/2026: la **Parte 2** de los estados visuales, con las elecciones que el usuario hizo en `/docs/states`. Están registradas como «Decidido por el usuario» en `docs/auto/decisiones-por-defecto.md`:

- **profundidad A**;
- **grises malva suave**;
- **Tree** con fondo `primary-subtle`, texto `primary` y anillo solo con el teclado;
- **`info` → violeta de la marca** en la selección, el arrastre y el acento.

Un commit por paso. Cada control se comprobó en `/docs/states` con Playwright, en claro y oscuro. Playwright con `playwright-core` y el Chrome instalado, **fuera del repo**, contra `pnpm ng serve docs --port 4280`. **No se subió la versión ni se publicó nada.** Node 24.18.0.

## 1. Un solo juego de estilos de campo (`utils/field-styles.ts`)

**Piezas** (cada una en un solo literal, para que el empaquetador quite las que no se usan):

| Pieza                   | Para                                                                    | Estados                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `fieldBoxStyles`        | caja de un campo compuesto (Number, Password, Combobox, Tags, Mask)     | borde, hover, foco (`focus-within`), clic (halo), error, deshabilitado y solo lectura, con `data-*`         |
| `fieldNativeStyles`     | lo que suman Input y Textarea                                           | hover, clic (halo) y solo lectura del `readonly` nativo                                                     |
| `fieldTriggerStyles`    | `<button>` con aspecto de campo (Date Picker, Date Range, Color Picker) | los de Input con `focus-visible`; se hunde con halo; error (`aria-invalid`); solo lectura (`aria-readonly`) |
| `fieldTriggerBoxStyles` | caja del Select                                                         | los mismos, desde los `data-*` de la caja (`data-focus-visible` del FocusMonitor)                           |
| `choicePressStyles`     | Checkbox y Switch                                                       | se hunden poco (`--mimi-press-scale-sm`) con halo; nada en solo lectura                                     |

Todas usan los **tokens de Input**:

- `--mimi-input-border-width`, `-border`, `-border-hover`, `-border-focus`, `-focus-ring-width`, `-error`, `-disabled-opacity`;
- un global nuevo, **`--mimi-input-readonly`**: el fondo de solo lectura, una mezcla del 70 % de `muted` con el fondo del campo. Está en el tema, en claro y oscuro, y en el tipo del tema como `inputReadonly`.

**Deshabilitado:** `controlDisabledStyles` usa el token `--mimi-disabled-opacity` (antes, `opacity-50` fijo). Lo usan Button, Checkbox, Switch, Input y Textarea. Lo mismo vale para las etiquetas de Checkbox y Switch y para las opciones e ítems deshabilitados de Select, Combobox, Command, Menu, Tree y Sortable List.

**Los 18 controles:** el detalle, marcado uno por uno, está en `docs/plan/controles/inventario.md` («Parte 2: unificados»). Lo más visible:

- **Select** gana el hover.
- **Switch** gana el error: un filo rojo de 1 px.
- **Checkbox** marca el error también cuando está marcada.
- **Input OTP:** el halo de error sale solo en la casilla con el foco (antes, en todas, siempre).
- **File Upload:**
  - el foco pasa a ser de campo (antes, el contorno de botón);
  - la solo lectura tiene su fondo, no responde al hover ni al clic y se titula «Archivos (solo lectura)». Es el texto opcional nuevo `readonly` de `MimiFileUploadText`, en inglés «Files (read-only)».
- **Password:** detecta `readonly` en el input de dentro (como ya hacía con `disabled`). El input de dentro nunca pinta su halo ni su fondo: los pinta la caja.
- **Solo lectura:** todos los campos la marcan (`data-readonly` o `aria-readonly`) y tienen el mismo aspecto. Antes, ninguno.

**Registro de la CLI:**

- **piden `utils/field-styles`:** Input, Textarea, Select, Combobox, Tags Input, Input Mask, Date Picker, Color Picker, Checkbox y Switch (Number Input y Password ya lo pedían);
- **dejan `utils/control-styles`:** Date Picker y File Upload, que ya no lo importan.
- La prueba del registro, que compara los imports con las dependencias, está en verde.

**Arreglo de la página «Estados»:** al forzar los estados, la página no copiaba las reglas anidadas de Tailwind 4 (`&:hover { @media (hover: hover) { … } }`). Las declaraciones dentro de ese `@media` son `CSSNestedDeclarations` y se saltaban, así que el hover de OTP y de File Upload no se veía en la cuadrícula. Ya se copian.

**Pruebas:**

- `field-states.spec.ts` (nuevo, 3 casos):
  - los 18 controles llevan su pieza común;
  - no queda ningún `opacity-50` en `components/` ni en `utils/`;
  - la solo lectura queda marcada en la caja de Select, Combobox, Tags, Mask y OTP.
- **17 pruebas que comprobaban las clases de antes**, actualizadas a las nuevas: Checkbox, Combobox, Date Picker, File Upload, Input Mask, Input OTP, Number Input, Select, Slider, Switch, Tags Input y `focus-styles.spec.ts` (dos `outline-none` nuevos con su razón).
- **CLI:** las dos listas de archivos de «input» suman `utils/field-styles`.
- **ui-core: 1028 + 3 en verde; CLI: 202.**

**Playwright** (`/docs/states`, con la opción «Actual» de la página, claro y oscuro): **206 comprobaciones, 206 OK**, sin errores de consola. Para cada control:

- **los 13 campos:** borde de Input, hover, foco (anillo y halo), solo lectura con su fondo y error en rojo;
- **todos:**
  - el clic: se hunden solo los de botón, y a todos les crece el halo;
  - el deshabilitado: opacidad 0,5.

Captura: `docs/auto/capturas/2026-11-12/unificacion/paso1-*.png`.

Al ver la primera captura se arregló Password con «Clic»: el input de dentro pintaba su propio halo dentro de la caja.

**Bundle** (`pnpm build`):

- **JS inicial:** **335,83 kB / 106,59 kB gzip**, sin cambio (antes, 335,84 / 106,59).
- **CSS global:** **122,30 kB / 18,14 kB gzip** (antes, 115,59 / 17,66): **+6,7 kB crudo, +0,48 kB gzip**, por las variantes de estado nuevas de los componentes que van en el CSS global (Input, Textarea, Select, Checkbox, Switch y Button).
- Presupuestos: `styles` avisa en 180 kB; el inicial (JS + CSS, 458 kB), en 525 kB. **No hace falta subir ninguno.**

## 2. Profundidad A

El clic va en el juego común del paso 1, porque es uno de sus estados. En este paso se cierra y se prueba:

- **Todos:** les crece el halo (`ring-soft`, 3 px), como a Button.
- **Se hunden** (`--mimi-press-scale`; `-sm` en Checkbox, Switch y Toggle Group) **solo los que funcionan como botón**: Select, Date Picker, Date Range, Color Picker, File Upload, Checkbox, Switch, Toggle Group y Button.
- **Los de escribir no se hunden:** Input, Textarea, Combobox, Tags Input, Number Input, Password, Input Mask e Input OTP. **El Slider tampoco:** al pulgar le crece el halo y crece al arrastrar.
- **En solo lectura y deshabilitado no hay clic.**
- **`controlPressStyles`** (el helper de `control-styles.ts`, que ya no usa ningún campo) también suma el halo, para los botones propios.
- **«Reducir movimiento»:**
  - el tema ya ponía `--mimi-press-scale` y `-sm` a 1, así que nada se hunde;
  - el halo se queda, porque no es movimiento;
  - las dos escalas fijas que quedan (el pulgar del Slider al arrastrar y la zona de File Upload con archivos encima) ya tenían `motion-reduce`.

**Prueba: `field-depth.spec.ts`** (nuevo, 4 casos):

- los de escribir no tienen `active:scale` y sí el halo;
- los de botón tienen los dos (también File Upload, Toggle Group y la caja del Select, con `has-[…:active]`);
- en solo lectura y deshabilitado no hay clic;
- en «reducir movimiento», las escalas son tokens que el tema pone a 1 y ningún hundimiento usa una escala fija.

En verde.

**Playwright** (`/docs/states`, columna «Clic», claro y oscuro, con y sin «reducir movimiento»): **68 de 68 OK**.

- Los de escribir quedan con `scale: none` y el halo.
- Los de botón quedan con `scale: 0.975` y el halo; **con «reducir movimiento», `scale: 1`** y el halo.

## 3. Grises malva suave

**Tema (`theme-base.css`):** los 15 grises (fondo, texto, tarjeta, popover, secondary, muted, accent y sus textos, `border`, `input` e `input-background`), en claro y oscuro, llevan el tono 292 de la marca con croma 0,006 (0,003 en los casi blancos y casi negros). La luminosidad no cambia, así que los contrastes tampoco.

**`MIMI_THEME_NEUTRAL`** vuelve a poner todos los grises en croma 0 (antes solo cambiaba fondo, texto, superficies, primario y anillo; ahora también bordes, campos, muted, secondary y accent).

**Pruebas:**

- `gray-tint.spec.ts` (nuevo, 3 casos): los 15 grises de `:root` y `.dark` con tono 292 y la croma que toca; el preset neutro, todo en croma 0.
- `contrast.spec.ts` (AA en claro y oscuro, con los valores de fábrica): en verde.
- **ui-core: 1038; docs: 253; CLI: 202**, todo en verde.

**Spec:** la tabla de colores globales (sección 13) tenía aún los valores del tema neutro: ahora tiene los de fábrica (grises malva, primario y anillo de la marca, `info` nuevo, `input-background` e `input-readonly`). La sección 6.1 (tema de marca) explica los grises. Anotado en `correcciones-pendientes.md` (el diseño trae croma 0).

**Playwright** (`/docs/states`, claro y oscuro): los 8 grises leídos del documento tienen el tono 292; el fondo de la página es `oklch(0.985 0.003 292)` en claro y `oklch(0.205 0.006 292)` en oscuro; sin errores de consola. **16 de 16 OK.** Captura: `docs/auto/capturas/2026-11-12/unificacion/paso3-*.png`.

**Bundle:** JS inicial **335,83 kB / 106,59 kB gzip** (sin cambio); CSS global **122,45 kB / 18,18 kB gzip** (antes 122,30 / 18,14: los valores de color son más largos). Sin subir presupuestos.

## 4. Tree y los usos de `info`

**Tree:** el nodo elegido pasa de `primary` sólido a fondo `primary-subtle` con texto `primary` (`--mimi-tree-selected` y `-fg` cambian de valor por defecto). El anillo ya salía solo con `focus-visible`; queda así.

**`info` → marca** (el azul se queda solo en los avisos):

| Componente  | Antes                                                  | Ahora                                                                 |
| ----------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| Toolbar     | anillo de hover y de la activa `info`; contador `info` | `--mimi-toolbar-ring` → `ring`; contador `primary`                    |
| File Upload | encima: borde `info`, fondo `info-soft`, `glow-info`   | borde `ring`, fondo `primary-subtle`, halo `ring-soft`, ícono primary |
| Data Table  | fila elegida 8 % `info`; filtro, insignia y punto info | 8 % `primary`; `primary-subtle` con texto `primary`; punto `primary`  |
| Combobox    | fila «Crear» `info-soft`                               | `primary-subtle` con texto `primary` (está en `option-list.ts`)       |
| Tabs        | contador `info-soft`                                   | `primary-subtle` con texto `primary`                                  |

`--mimi-dropzone-active` y `--mimi-dropzone-active-border` cambian en el tema (claro y oscuro). El tono del ícono de las imágenes en la lista de File Upload sigue en `info-soft`: es una categoría, no una selección.

**Pruebas:**

- `selection-colors.spec.ts` (nuevo, 8 casos): ninguno de los 6 archivos usa `info` salvo la categoría de File Upload; los tokens de soltar son de la marca en claro y oscuro; el Tree elegido usa `primary-subtle`/`primary` y su anillo es solo de `focus-visible`.
- `group2-tokens.spec.ts`: los dos tokens de soltar se apartan del diseño a propósito (lista `G2_OVERRIDES`, con la razón).
- Toolbar, Tabs y Combobox: la clase esperada del contador y de «Crear».
- `component-tokens.ts` y las tablas de la spec: `toolbar-ring`, `table-row-selected`, `tree-selected(-fg)` y los respaldos de File Upload.
- **ui-core 1046, docs 253, CLI 202**, en verde.

**Playwright** (páginas de cada componente, claro y oscuro; el color pintado se pasa a sRGB con un canvas): **18 de 18 OK**, sin errores de consola.

- Tree elegido violeta, contraste 4,89 (claro) y 5,43 (oscuro); sin anillo con el ratón, anillo `ring` inset con el teclado.
- Contador de Tabs 4,70 / 5,90; contador de Toolbar 5,45 / 6,86; «Crear» 4,89 / 5,04: todos AA.
- Fila elegida de Data Table con tinte violeta (texto 16,05 / 14,33); hover de Toolbar con anillo `oklch(… 292 / 0.6)`; zona de File Upload con un archivo encima con borde, fondo y halo de la marca.
- No se midió en el navegador el filtro activo y la insignia de Data Table (las mismas clases que el contador de Tabs; lo cubre la prueba de archivos).

**Bundle:** JS inicial **335,83 kB / 106,59 kB gzip** (sin cambio); CSS global **122,53 kB / 18,19 kB gzip** (+0,08 kB crudo).

## 5. `/docs/states` con lo elegido

**La página se queda en el sitio**, sin los selectores de comparación:

- fuera la profundidad (A, B, Actual) y su simulación (`DEPTH_CSS`), los grises (Neutro, Malva suave, Malva medio) con su lista de contrastes, y los dos árboles lado a lado;
- **se borra `gray-tints.ts`**: solo lo usaba la comparación (los grises ya están en el tema y su contraste lo prueba `contrast.spec.ts`);
- el texto de arriba explica que todos usan `utils/field-styles.ts`.

**Tree entra en la cuadrícula** (fila 19): implementa `FormValueControl`. Un nodo elegido y el otro con el hover, el foco o el clic; «No aplica» en solo lectura y error (no los tiene).

**Arreglo de Tree, visto al meterlo en la cuadrícula:** deshabilitado entero no se veía distinto (solo llevaba `aria-disabled`). Ahora se atenúa con `--mimi-disabled-opacity` y sus filas no responden al hover (`not-in-data-disabled:hover:`) y muestran el cursor de prohibido. Prueba nueva en `tree.spec.ts`. Anotado en el inventario.

**Prueba de cobertura** (`states-page.spec.ts`): cada fila lleva `source`, la carpeta del componente. La prueba busca en `packages/ui-core/src/lib/components` los que implementan `FormValueControl` o `FormCheckboxControl` o leen el formulario (`injectFieldState()`, `NgControl`), salvo Form Field (el envoltorio), y **falla si alguno no tiene fila**. También comprueba que cada `source` existe y que encuentra al menos 17 (para que no pase sola si la detección se rompe). Hoy encuentra 17 y todos tienen fila (Password y Button no los detecta: Password envuelve un Input y Button no es de formulario; tienen fila igual). La prueba de la página comprueba además: 19 × 7 celdas, sin selectores ni `data-depth`, sin estilos en línea en la cuadrícula, y la fila del Tree.

**Revisor:** `.claude/commands/cerrar-grupo.md`, punto nuevo en «2. Comprobar»: **controles nuevos en `/docs/states`** (su fila, las piezas de `field-styles.ts` y una mirada en claro y oscuro).

**Playwright** (claro y oscuro):

- `page.mjs`, la página: **24 de 24 OK**. Sin selectores, 19 filas, estados forzados copiados; Tree elegido `oklch(0.54 0.239 292 / 0.1)` con texto `oklch(0.54 0.239 292)` en claro (`0.72 0.16 292` en oscuro), hover con `accent`, foco con anillo inset de la marca, elegido sin anillo, deshabilitado a 0,5, sin errores de consola.
- Se repitieron `fields.mjs` (**206 de 206**), `depth.mjs` (**68 de 68**) y `selection.mjs` (**18 de 18**) sobre la página nueva.
- **Nota:** el servidor de desarrollo dejó de recompilar después de un error intermedio (entre el cambio del `.ts` y el del `.html`). Se reinició y se repitieron todas las comprobaciones contra el código nuevo; los números de arriba son de esa segunda pasada.

Captura: `docs/auto/capturas/2026-11-12/unificacion/paso5-*.png`.

**Pruebas:** ui-core 1047, docs 253, CLI 202, en verde.

**Bundle:** JS inicial **334,89 kB / 106,23 kB gzip** (antes 335,83 / 106,59: **−0,94 kB**; se fue el código de la comparación, que compartía un trozo con el inicial); CSS global **122,39 kB / 18,15 kB gzip** (antes 122,53 / 18,19).

## 6. CHANGELOG, spec y registro

- **CHANGELOG, «0.6.0 (por publicar)»:** sección nueva **«Estados de los controles: un solo juego para todos»**, con los cambios visibles: hover en Input y Textarea, hover más suave en oscuro, grises malva, profundidad, solo lectura, error unificado, deshabilitado con el token, Tree y colores de selección. También: el ítem nuevo `utils/field-styles` del registro de la CLI (quién lo pide y quién deja `control-styles`) y qué hacer si personalizaste los tokens que cambian de valor. Una línea en «Rupturas» (cambia el aspecto, no la API), «Estados» en «Documentación», y «No incluido» ya no lista el aspecto de solo lectura.
- **Registro de la CLI:** el ítem `utils/field-styles` (tipo `util`, `utils/field-styles.ts`) ya estaba desde el paso 1, con 12 componentes que lo piden; `registry.spec.ts` compara los imports con las dependencias (en verde).
- **Spec:** «`field-styles.ts`» junto a `control-styles.ts` (las piezas, los estados comunes, la profundidad A y la página Estados con su prueba); `controlDisabledStyles` y `controlPressStyles` al día.
- **`.claude/commands/componente.md`:** un control de formulario nuevo usa `field-styles.ts` y entra en `/docs/states`.

## Verificación final

| Criterio                                                                      | Evidencia                                                                                                       |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1. Un solo juego de estados, aplicado a los 18 controles y marcado            | `field-states.spec.ts`; `docs/plan/controles/inventario.md` («Parte 2: unificados», 18 ✓); `fields.mjs` 206/206 |
| 2. Profundidad A, con «reducir movimiento»                                    | `field-depth.spec.ts`; `depth.mjs` 68/68                                                                        |
| 3. Grises malva suave en claro y oscuro, AA, tabla de tokens                  | `gray-tint.spec.ts`, `contrast.spec.ts`; spec sección 13; `grays.mjs` 16/16                                     |
| 4. Tree y los usos de info                                                    | `selection-colors.spec.ts`; `selection.mjs` 18/18 (contraste mínimo 4,70)                                       |
| 5. `/docs/states` solo con lo elegido, prueba de cobertura, punto del revisor | `states-page.spec.ts` (3 casos); `page.mjs` 24/24; `cerrar-grupo.md`                                            |
| 6. CHANGELOG y registro                                                       | `CHANGELOG.md`; `registry.json` (`utils/field-styles`)                                                          |
| `pnpm build`, `pnpm test`, `pnpm format:check`                                | en verde: ui-core 1047, docs 253, CLI 202; «All matched files use Prettier code style!»                         |
| Bundle sin subir presupuestos                                                 | JS inicial 334,89 / 106,23 gzip (aviso en 345); CSS global 122,39 / 18,15 gzip (`styles` avisa en 180)          |
| Servidores cerrados y temporales borrados                                     | puerto 4280 libre (`netstat`); carpeta de Playwright y registros del servidor borrados                          |

**Bundle de toda la tanda** (antes del paso 1 → ahora): JS inicial 335,84 / 106,59 → **334,89 / 106,23 kB gzip**; CSS global 115,59 / 17,66 → **122,39 / 18,15 kB gzip** (+6,8 kB crudo, +0,49 kB gzip, casi todo del paso 1).

## Alertas para el revisor

- **Tree deshabilitado** se arregló sin que estuviera en el encargo: al meterlo en la cuadrícula se vio que no se atenuaba. Es el mismo criterio del paso 1 (deshabilitado con el token en todos).
- **`group2-tokens.spec.ts`** ahora tiene una lista de excepciones al diseño (`G2_OVERRIDES`) para los dos tokens de soltar. `docs/design/tokens-mimi.css` no se tocó: sigue diciendo `info`.
- **El texto violeta** (Tree elegido, contador de Tabs, «Crear», filtro e insignia de Data Table) usa `text-primary`, como pidió el usuario para Tree. Con el tema de fábrica es igual a `brand-text` y pasa AA (4,70 lo más bajo). **Con un primario propio claro** (por ejemplo, amarillo), ese texto podría no llegar a 4,5:1: es la misma regla que ya vale para `primary` sobre fondo (spec 6.1).
- **La tabla de colores de la spec (sección 13)** seguía con los valores del tema neutro de antes de la R.0. Ahora tiene los de fábrica, también `primary`, `ring` e `info`, no solo los grises.
- **Playwright:** a mitad del paso 5, el servidor de desarrollo dejó de recompilar después de un error intermedio. Se reinició y se repitieron todas las comprobaciones (los números de arriba son de esa segunda pasada).
- **NO COMPROBADO (manual, usuario):** una mirada propia a `/docs/states` y a las páginas de Tree, Toolbar, Data Table, Tabs, Combobox y File Upload en claro y oscuro; el filtro activo y la insignia de Data Table no se midieron en el navegador (solo la prueba de archivos).
- **No se subió la versión ni se publicó nada.**

## Archivos de esta tanda (pasos 3 a 6)

- **Tema:** `packages/ui-core/src/lib/theme/theme-base.css`, `neutral.ts`, `gray-tint.spec.ts` (nuevo), `group2-tokens.spec.ts`.
- **Componentes:** `tree/tree.ts` y `tree.spec.ts`, `toolbar/toolbar.ts` y `toolbar.spec.ts`, `data-table/data-table.ts`, `file-upload/file-upload.ts`, `option-list/option-list.ts`, `tabs/tabs.ts` y `tabs.spec.ts`, `combobox/combobox.spec.ts`; `packages/ui-core/src/lib/selection-colors.spec.ts` (nuevo).
- **Sitio:** `apps/docs/src/app/pages/docs/states/states-page.ts`, `.html` y `.spec.ts`; `gray-tints.ts` (borrado); `apps/docs/src/app/code/component-tokens.ts`.
- **Docs:** `docs/spec.md`, `CHANGELOG.md`, `docs/design/correcciones-pendientes.md`, `docs/plan/controles/inventario.md`, este informe, capturas `docs/auto/capturas/2026-11-12/unificacion/paso3-*.png` y `paso5-*.png`.
- **Comandos:** `.claude/commands/cerrar-grupo.md`, `.claude/commands/componente.md`.
