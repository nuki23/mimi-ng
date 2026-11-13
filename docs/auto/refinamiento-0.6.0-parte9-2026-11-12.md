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
