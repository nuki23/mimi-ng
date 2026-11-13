# Refinamiento 0.6.0, octava tanda: estados visuales de los controles (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 7](refinamiento-0.6.0-parte7-2026-11-12.md)

Encargo del 12/11/2026. El usuario revisó los controles: «cada control de formulario dibuja hover, foco, clic y bordes a su manera». Tiene dos partes:

- **Parte 1:** errores claros y una página de estados para comparar opciones. Es la que se hizo.
- **Parte 2:** unificar los controles según lo que elija el usuario. **No se hizo:** espera a su elección.

**No se subió la versión ni se publicó nada.** Node 24.18.0. Playwright con `playwright-core` y el Chrome instalado, **fuera del repo** (directorio temporal de la sesión), contra el sitio servido con `pnpm ng serve docs --port 4280`.

## 1. Select: el anillo de foco ya no se queda al elegir con el ratón

**Antes**, medido con Playwright en claro y oscuro: con el ratón se abre, se elige una opción y se aparta el puntero; con el teclado se llega con Tab.

| Control                       | Anillo tras elegir con el ratón | Anillo con Tab |
| ----------------------------- | ------------------------------- | -------------- |
| Select                        | **sí (error)**                  | sí             |
| Select con buscador           | **sí (error)**                  | sí             |
| Combobox                      | sí (ver abajo)                  | sí             |
| Date Picker                   | no                              | sí             |
| Date Range                    | no                              | sí             |
| Color Picker                  | no                              | sí             |
| Dropdown Menu (el disparador) | no                              | sí             |

**Causa.** La caja del Select pintaba el anillo con `has-[[role=combobox]:focus]`. Al elegir, el Select devuelve el foco al disparador desde el código, así que `:focus` se cumplía aunque se hubiera usado el ratón. Con `:focus-visible` dependería de cómo decide cada navegador sobre el foco movido desde el código (con buscador, el foco viene de un campo de texto). No se probó esa vía: se eligió el origen explícito, que no depende del navegador.

**Arreglo** (`select.ts`):

- La caja pinta el anillo con `data-focus-visible`.
- Ese atributo lo pone el **origen del foco** del `FocusMonitor` del cdk (`@angular/cdk/a11y`; el Select ya dependía de `@angular/cdk`). Se pinta si el origen es `keyboard` o `program`, como cuando Signal Forms lleva el foco al campo con error.
- Cuando el Select devuelve el foco él mismo (al elegir, al limpiar o al abrir sin buscador), usa `focusVia` con la última modalidad de entrada (`InputModalityDetector`): ratón o teclado.
- El error (`data-invalid`) se combina igual.

**Combobox, sin cambio.** Es un campo de texto: como Input, muestra el anillo mientras tiene el foco, también con el ratón. El navegador hace lo mismo con cualquier `<input>` de texto. Date Picker, Date Range, Color Picker y los menús ya usaban `:focus-visible` y lo hacían bien.

**Pruebas:**

- `select-focus-ring.spec.ts` (nuevo, 3 casos):
  - con el ratón, abrir y elegir deja el foco en el disparador **sin** `data-focus-visible`;
  - con el teclado, Tab y elegir con Enter lo dejan **con** él;
  - la caja ya no usa `:focus` para el anillo.
- Se actualizaron las clases esperadas en `select.spec.ts` y la razón de `focus-styles.spec.ts`.
- Select y focus-styles: 37 de 37 en verde.

**Después** (Playwright, claro y oscuro): **14 de 14 OK**. Select y Select con buscador quedan **sin anillo tras el ratón y con anillo con Tab**. El resto, igual que antes.

## 2. Number Input: el borde con hover y el hover de − y +

**Medido antes** (Playwright, sobre los ejemplos de la página):

| Estado                        | Claro                        | Oscuro                                     |
| ----------------------------- | ---------------------------- | ------------------------------------------ |
| Borde en reposo               | `oklch(0.88)`                | blanco al 15 %                             |
| Borde con hover               | `oklab(0.68)`                | **blanco al 40 %** (lo que se veía blanco) |
| Botón + en reposo / con hover | transparente / `oklch(0.97)` | transparente / `oklch(0.3)`                |
| Ícono del botón               | `foreground` fijo            | `foreground` fijo                          |

**Causa:**

- **El borde blanco:** el token `--mimi-input-hover` del diseño mezcla el 30 % de `foreground` con `--mimi-input`, y en oscuro eso es casi blanco.
- **El hover de − y + que no se ve:** el fondo `accent`, a 0,97 sobre el blanco del campo, casi no se distingue, y el ícono no cambiaba.
- **Los tokens de la caja:** Number Input repetía sus clases a mano (`border border-input`…), sin los tokens de Input (`--mimi-input-border`, `-border-hover`, `-border-focus`, `-error`, ancho del borde y del anillo).

**Arreglo:**

- **Pieza compartida nueva en `utils/control-styles.ts`:** `fieldBoxStyles`, la caja de un campo compuesto con **los mismos tokens que Input**.
  - Incluye el hover del borde con `--mimi-input-border-hover` (el token de la spec, sección 13, «Input»).
  - Con error, el hover no tapa el borde rojo.
  - Number Input la usa; Password la usa en el punto 3.
- **`fieldButtonHoverStyles`** para los botones de dentro de un campo: ícono `muted-foreground` que pasa a `foreground`, sobre el fondo `accent`, como el ojo de Password.
- **`--mimi-input-hover` en oscuro baja del 30 % al 14 %** (≈ 27 % de blanco). En claro no cambia. Queda anotado en `docs/design/correcciones-pendientes.md`.
- **Registro de la CLI:** `number-input` pide ahora `utils/control-styles`. La spec (sección 4) lo dice.

**Pruebas** (`number-input.spec.ts`):

- la caja usa los tokens de Input: borde, hover, foco y error con hover;
- ya no lleva `border-input` fijo;
- los botones tienen el ícono atenuado y el hover a `foreground` y `accent`;
- se actualizó la clase del anillo esperada.

17 de 17 en verde.

**Después** (Playwright, claro y oscuro):

- **Borde con hover en oscuro:** blanco al **27 %** (antes, 40 %).
- **Botón +:**
  - en claro, el ícono pasa de `oklch(0.54)` a `oklch(0.205)`, con fondo `oklch(0.97)`;
  - en oscuro, de `oklch(0.74)` a `oklch(0.985)`, con fondo `oklch(0.3)`.
