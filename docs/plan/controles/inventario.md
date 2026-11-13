# Inventario de los estados visuales de los controles (12/11/2026)

[← Índice del plan](../../plan.md) · Informe: `docs/auto/refinamiento-0.6.0-parte8-2026-11-12.md`

Lo que hace hoy cada control de formulario (y parecidos) en borde, hover, foco, clic, deshabilitado, solo lectura y error, y de dónde sale cada valor. Es la base de la **Parte 2** (unificar con un solo juego de estilos de campo), que espera a que el usuario elija profundidad, grises y Tree en la página «Estados» del sitio.

Estado **después** de los arreglos 1 a 4 de la Parte 1 (12/11/2026):

- el foco del Select ya no queda tras el ratón;
- Number Input y Password usan `fieldBoxStyles`;
- Input y Textarea tienen hover;
- el Sortable usa la marca.

## Parte 2: unificados (12/11/2026)

Elecciones del usuario en `/docs/states` (12/11/2026): **profundidad A**, **grises malva suave**, **Tree con fondo `primary-subtle`** y el **azul de `info` pasa al violeta de la marca** donde significa selección, arrastre o acento.

El juego común vive en `utils/field-styles.ts`:

- `fieldBoxStyles`: la caja de un campo compuesto;
- `fieldNativeStyles`: lo que suman Input y Textarea;
- `fieldTriggerStyles`: el `<button>` con aspecto de campo;
- `fieldTriggerBoxStyles`: la caja del Select;
- `choicePressStyles`: el clic de Checkbox y Switch.

Más el global `--mimi-input-readonly` (fondo de solo lectura) y `controlDisabledStyles` con el token `--mimi-disabled-opacity`.

Cada control comprobado en `/docs/states`, en claro y oscuro, con Playwright: 206 comprobaciones (borde, hover, foco, clic, deshabilitado, solo lectura y error).

**Estados comunes a todos los campos:**

- **Clic:** les crece el halo; solo los que funcionan como botón se hunden.
- **Deshabilitado:** con el token de opacidad.
- **Solo lectura:** el fondo propio, sin hover ni clic.
- **Error:** borde rojo, con el halo de error solo con el foco.

| ✓   | Control      | Pieza común                            | Qué cambió                                                                                                                                                             |
| --- | ------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✓   | Input        | `fieldNativeStyles`                    | halo al hacer clic; solo lectura con su fondo                                                                                                                          |
| ✓   | Textarea     | `fieldNativeStyles`                    | ídem                                                                                                                                                                   |
| ✓   | Select       | `fieldTriggerBoxStyles`                | hover (no tenía); se hunde con halo; `data-readonly`; tokens de Input con respaldo en los del Select                                                                   |
| ✓   | Combobox     | `fieldBoxStyles`                       | tokens de Input (antes `border-input`, `ring-3` fijos); `data-readonly`; opciones deshabilitadas con el token                                                          |
| ✓   | Tags Input   | `fieldBoxStyles`                       | ídem; el borde de «límite lleno» encima                                                                                                                                |
| ✓   | Number Input | `fieldBoxStyles`                       | solo lectura y halo al hacer clic                                                                                                                                      |
| ✓   | Password     | `fieldBoxStyles`                       | ídem; detecta `readonly` en el input de dentro (como `disabled`); el input de dentro no pinta halo ni fondo                                                            |
| ✓   | Input Mask   | `fieldBoxStyles`                       | tokens de Input; `data-readonly`                                                                                                                                       |
| ✓   | Input OTP    | tokens de Input en cada casilla        | hover de la fila; solo lectura; error de campo (el halo solo en la casilla con el foco; antes, siempre en todas)                                                       |
| ✓   | Date Picker  | `fieldTriggerStyles`                   | tokens de Input y su radio; solo lectura con su fondo y sin hundirse                                                                                                   |
| ✓   | Date Range   | `fieldTriggerStyles` (vía Date Picker) | ídem                                                                                                                                                                   |
| ✓   | Color Picker | `fieldTriggerStyles`                   | ídem (era una copia de la caja de Date Picker)                                                                                                                         |
| ✓   | File Upload  | estados de campo en la zona            | foco de campo (antes, contorno de botón); se hunde con halo; solo lectura con su fondo, sin hover ni clic y con el título «Archivos (solo lectura)» (texto `readonly`) |
| ✓   | Slider       | sin hover ni clic en solo lectura      | halo al hacer clic (`:active`); cursor normal en solo lectura                                                                                                          |
| ✓   | Checkbox     | `choicePressStyles`                    | hover del borde; halo al hacer clic; error también marcada; deshabilitado y etiqueta con el token                                                                      |
| ✓   | Switch       | `choicePressStyles`                    | **error** (no tenía): filo rojo de 1px; halo al hacer clic; deshabilitado y etiqueta con el token                                                                      |
| ✓   | Toggle Group | halo al hacer clic, en los ítems       | sin hover ni clic en solo lectura; deshabilitado con respaldo del token; filo de error con el token de error                                                           |
| ✓   | Button       | `controlDisabledStyles`                | deshabilitado con el token (antes, 50 fijo); ya se hundía y le crecía el anillo                                                                                        |

**Lo que queda distinto, a propósito:**

- **El foco de los controles de elegir** (Checkbox, Switch, Slider, Toggle Group) y de **Button** sigue siendo el contorno de 2px, no el halo de campo: no son campos.
- **El pulgar del Slider** no se hunde: le crece el halo y crece al arrastrar.
- **Switch y Toggle Group** no tienen borde: su error es un filo de 1px del mismo color.
- **File Upload** conserva el borde punteado de 2px del diseño.

Hecho leyendo el código; las cifras de color se comprobaron con Playwright en los cuatro campos de texto (punto 3 del informe).

**Helpers** de `packages/ui-core/src/lib/utils/control-styles.ts`:

- `buttonFocusStyles`: contorno de 2 px separado 2 px, con `focus-visible`.
- `fieldFocusStyles`: borde `ring` y halo `ring-soft` de 3 px, con `focus-visible`.
- `controlDisabledStyles`: opacidad 50 **fija** y cursor.
- `controlInvalidStyles`: `aria-invalid` con borde `destructive` y halo de error al enfocar.
- `controlPressStyles`: `active:scale(--mimi-press-scale)`.
- `fieldBoxStyles` y `fieldButtonHoverStyles`: nuevos, la caja de los campos compuestos con los tokens de Input.

**Radio no existe** en Mimi. Lo más parecido es Toggle Group en modo simple (`role="radiogroup"`).

## Tabla

| Control                                 | Borde                                                                                            | Hover                                                                                      | Foco                                                                                                                                                      | Clic (hundimiento y sombra)                                                                                                     | Deshabilitado                                                        | Solo lectura                                                           | Error                                                                                   | Origen                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Input**                               | `--mimi-input-border-width` (1 px), `--mimi-input-border` → `input`, radio `--mimi-input-radius` | `--mimi-input-border-hover` → `input-hover` (**desde hoy**)                                | `focus-visible`: borde `--mimi-input-border-focus` → `ring`, halo `ring-soft` `--mimi-input-focus-ring-width` (3 px); sale al hacer clic (campo de texto) | ninguno                                                                                                                         | opacidad `--mimi-input-disabled-opacity` → `--mimi-disabled-opacity` | nada (solo `readonly` nativo)                                          | `aria-invalid`: borde `--mimi-input-error`, halo de error con foco; el hover no lo tapa | `input.variants.ts` + `fieldFocusStyles`, `controlDisabledStyles`, `controlInvalidStyles` |
| **Textarea**                            | igual que Input (tokens `--mimi-textarea-*` → Input)                                             | igual que Input (**desde hoy**)                                                            | igual que Input                                                                                                                                           | ninguno                                                                                                                         | igual + `resize-none`                                                | nada                                                                   | igual que Input                                                                         | `textarea.variants.ts` + los mismos helpers                                               |
| **Select** (botón en una caja)          | 1 px fijo, `--mimi-select-border` → `input`, radio `--mimi-select-radius`                        | **ninguno**                                                                                | `data-focus-visible` (origen del FocusMonitor: teclado o código) → borde `ring`, `ring-3` `ring-soft` (**desde hoy**)                                     | `has-[:active]:scale(--mimi-press-scale)` (se hunde)                                                                            | `data-disabled`: opacidad del token                                  | nada                                                                   | `data-invalid`: borde `destructive`, halo con foco                                      | local `TRIGGER_CLASSES` (`select.ts`)                                                     |
| **Combobox** (caja con input)           | 1 px fijo, `border-input`, radio `--mimi-combobox-radius`                                        | `hover:border-input-hover`                                                                 | `focus-within`: `ring`, `ring-3` `ring-soft` (sale al hacer clic, como Input)                                                                             | ninguno                                                                                                                         | `data-disabled`: opacidad del token                                  | nada                                                                   | `data-invalid` como Select                                                              | local `BOX_CLASSES` (`combobox.ts`)                                                       |
| **Tags Input**                          | 1 px fijo, `border-input`, radio de Input; lleno: `color-mix(warning 70 %, input)`               | `hover:border-input-hover`                                                                 | `focus-within` como Combobox                                                                                                                              | ninguno                                                                                                                         | `data-disabled`: token                                               | nada                                                                   | `data-invalid` como Combobox                                                            | local (`tags-input.ts`)                                                                   |
| **Number Input**                        | **`fieldBoxStyles`** (los tokens de Input); radio `--mimi-number-radius`                         | `--mimi-input-border-hover`; − y + con ícono atenuado → `foreground` sobre `accent`        | `focus-within`: borde `--mimi-input-border-focus`, halo `--mimi-input-focus-ring-width`                                                                   | − y +: `active:scale(--mimi-press-scale-sm)`; la caja no                                                                        | token de Input                                                       | `data-readonly`, **sin estilo**                                        | `data-invalid`: `--mimi-input-error`, el hover no lo tapa                               | `fieldBoxStyles`, `fieldButtonHoverStyles` (**desde hoy**)                                |
| **Password** (caja + `mimiInput`)       | **`fieldBoxStyles`**                                                                             | `--mimi-input-border-hover`; ojo como − y +                                                | `focus-within` como Number Input; ojo: `buttonFocusStyles`                                                                                                | ojo: `active:scale(--mimi-press-scale-sm)`                                                                                      | token de Input                                                       | `data-readonly`, **sin estilo**                                        | como Number Input                                                                       | `fieldBoxStyles` (**desde hoy**)                                                          |
| **Input Mask**                          | 1 px fijo, `border-input`, radio de Input                                                        | `hover:border-input-hover`                                                                 | `focus-within` (`ring-3` fijo)                                                                                                                            | ninguno                                                                                                                         | `data-disabled`: token                                               | nada                                                                   | `data-invalid`                                                                          | local (`input-mask.ts`)                                                                   |
| **Input OTP** (casillas + input oculto) | casilla 1 px, `--mimi-otp-border` → `input`, radio `--mimi-otp-radius`                           | ninguno                                                                                    | casilla activa: `ring`, `ring-3` `ring-soft` con el evento `focus` (sale al hacer clic)                                                                   | ninguno                                                                                                                         | anfitrión: opacidad del token                                        | nada                                                                   | `destructive` + halo **siempre**, más una sacudida; éxito con `success`                 | local `BOX_STATE` (TypeScript)                                                            |
| **Date Picker** (botón)                 | 1 px, `border-input`, radio `--mimi-radius` (sin token propio)                                   | `hover:border-input-hover`                                                                 | `fieldFocusStyles` (`focus-visible`: no sale al hacer clic)                                                                                               | `controlPressStyles` (se hunde)                                                                                                 | local: opacidad del token                                            | `aria-readonly`; **el hover y el hundimiento siguen**                  | `controlInvalidStyles`                                                                  | `MIMI_DATE_TRIGGER_CLASSES` + 3 helpers                                                   |
| **Date Range**                          | el de Date Picker                                                                                | igual                                                                                      | igual; atajos: `buttonFocusStyles`                                                                                                                        | igual                                                                                                                           | igual                                                                | igual                                                                  | igual                                                                                   | importado de Date Picker                                                                  |
| **Color Picker** (botón + panel)        | 1 px, `border-input`, radio `--mimi-radius`                                                      | `hover:border-input-hover`; muestras `scale(1.12)`                                         | disparador: `fieldFocusStyles`; panel: `buttonFocusStyles`                                                                                                | `controlPressStyles`; muestras `press-scale-sm`                                                                                 | local: opacidad del token                                            | `aria-readonly`, `data-readonly`; **el hover y el hundimiento siguen** | `controlInvalidStyles`                                                                  | local `TRIGGER_CLASSES` (casi copia de la de Date Picker)                                 |
| **File Upload** (zona botón)            | 2 px **punteado**, `--mimi-upload-border` → `input`, radio `--mimi-radius-card`                  | `hover:border-input-hover`; arrastrando encima: borde `info`, `scale(1.01)`, brillo `info` | `buttonFocusStyles` (contorno, no el anillo de campo)                                                                                                     | `active:scale(--mimi-press-scale)`                                                                                              | opacidad del token                                                   | `aria-disabled`, `data-readonly`; **el hover y el hundimiento siguen** | borde punteado `destructive`, sin halo                                                  | local `ZONE` + `buttonFocusStyles`                                                        |
| **Slider**                              | pulgar 2 px del color del relleno → `primary`                                                    | pulgar: halo de 6 px `ring-soft`                                                           | pulgar: `buttonFocusStyles`; la burbuja del valor sale con el evento `focus` (**se queda tras el clic**)                                                  | arrastrando: `scale(1.12)` y halo de 8 px (no usa `--mimi-press-scale`)                                                         | anfitrión: opacidad del token (TypeScript)                           | `data-readonly`, sin estilo; el hover sigue                            | relleno y pulgar `destructive` (TypeScript)                                             | local `THUMB_*`, `FILL`                                                                   |
| **Checkbox**                            | 1 px `--mimi-checkbox-border` → `input`; marcado: `primary` + `shadow-primary`                   | ninguno                                                                                    | `buttonFocusStyles` + borde `ring` sin marcar                                                                                                             | `active:scale(--mimi-press-scale-sm)`                                                                                           | `controlDisabledStyles` (**50 fijo**), etiqueta `opacity-50` fija    | `aria-readonly`                                                        | solo sin marcar: borde `destructive`, sin halo                                          | local + `buttonFocusStyles`, `controlDisabledStyles`                                      |
| **Switch**                              | sin borde; pista `--mimi-switch-track-off`; encendido `primary` + sombra                         | ninguno                                                                                    | `buttonFocusStyles`                                                                                                                                       | `active:scale(--mimi-press-scale-sm)`                                                                                           | `controlDisabledStyles` (**50 fijo**), etiqueta `opacity-50` fija    | `aria-readonly`                                                        | **ninguno** (`aria-invalid` sin estilo)                                                 | local + 2 helpers                                                                         |
| **Toggle Group**                        | grupo sin borde, fondo `muted`; elegido: tarjeta + `shadow-neutral` (o `primary` en `solid`)     | ítem: texto activo                                                                         | ítem: `buttonFocusStyles`                                                                                                                                 | ítem: `active:scale(--mimi-press-scale-sm)`                                                                                     | grupo: `opacity-(--mimi-disabled-opacity)` sin respaldo              | `data-readonly`, sin estilo; el hover y el hundimiento siguen          | `ring-1 ring-destructive` (anillo, no borde)                                            | local + `buttonFocusStyles`                                                               |
| **Button**                              | 1 px `--mimi-btn-border-width`; transparente, `border` o `<tono>-border` en `outline`            | fondo `<tono>-hover` y sombra `<tono>-hover` (`solid`), `accent` (`ghost`, `outline`)      | `buttonFocusStyles` (+ ancho `--mimi-btn-focus-ring-width`)                                                                                               | `active:scale(--mimi-btn-press-scale)` **y `active:ring-3 ring-soft`** en `solid` y `outline` secundario: el «anillo que crece» | `controlDisabledStyles` (**50 fijo**) + `shadow-none`                | —                                                                      | —                                                                                       | `button.variants.ts` + 2 helpers                                                          |

## Inconsistencias que quedan para la Parte 2

1. **Dos familias de foco:**
   - campos: halo `ring-3 ring-soft`;
   - botones, Checkbox, Switch, Slider, Toggle Group y File Upload: contorno `outline-2 offset-2`. File Upload es un campo y usa el de botón.
   - Los tokens `--mimi-focus-ring`, `--mimi-focus-outline` y `--mimi-focus-offset` existen en el tema y en el provider, pero **ningún componente los usa**.
2. **Hundimiento al hacer clic:**
   - se hunden Select, Date Picker, Date Range, Color Picker y File Upload;
   - no se hunden Input, Textarea, Combobox, Tags, Number, Password, Mask ni OTP;
   - Button se hunde y además le crece un anillo (`active:ring-3`).
   - Es la elección (a) de la página «Estados».
3. **Hover:**
   - **sin hover:** Select, Input OTP, Checkbox y Switch;
   - **con `input-hover`:** las cajas;
   - **cajas que todavía no usan `fieldBoxStyles`:** Combobox, Tags Input, Input Mask, Date, Color y File Upload (clases a mano, `border` de 1 px fijo).
4. **Radio:** cinco cadenas distintas:
   - `--mimi-input-radius`;
   - `--mimi-number-radius`;
   - `--mimi-select-radius` / `--mimi-combobox-radius`;
   - solo `--mimi-radius` (Date y Color);
   - `--mimi-radius-card` (File Upload).
5. **Opacidad de deshabilitado:**
   - `controlDisabledStyles` lleva `opacity-50` fijo, sin el token, y lo usan Button, Checkbox y Switch;
   - las etiquetas de Checkbox y Switch y las opciones de Combobox, igual;
   - Toggle Group usa el token sin respaldo.
6. **Solo lectura:** **ningún control la pinta.**
   - Seis ponen `data-readonly` y nadie lo lee.
   - En Date Picker, Date Range, Color Picker, File Upload, Slider y Toggle Group, el hover y el hundimiento siguen activos aunque el valor no cambie.
   - Va con R.12 («aspecto de solo lectura»).
7. **Error:**
   - Switch no tiene;
   - Checkbox solo lo marca sin marcar;
   - Toggle Group usa `ring-1`;
   - OTP lleva el halo siempre (no solo con foco);
   - File Upload, borde sin halo.
   - Atributos: unos leen `aria-invalid` (Input, Textarea, Date, Color, Checkbox), otros `data-invalid` (cajas, Select, OTP, Toggle Group), y Slider y File Upload deciden en TypeScript.
8. **El foco que sale con el evento `focus`, no con `focus-visible`:** la burbuja del Slider y la casilla activa de OTP. En OTP es correcto (es un campo de texto); en el Slider, la burbuja se queda tras el clic.
9. **Duplicados:**
   - `TRIGGER_CLASSES` de Color Picker es casi la de Date Picker;
   - la X de Select y la de Combobox son copias;
   - Combobox, Tags y Mask repiten la caja que ya está en `fieldBoxStyles`.
