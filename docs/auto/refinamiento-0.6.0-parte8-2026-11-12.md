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

## 3. Password: los mismos bordes que Input

**Causa:** las dos cosas no coincidían por ambos lados.

- **Password:** pintaba su caja con clases a mano (`border border-input`, hover `input-hover`, `ring-3` fijo) en vez de los tokens de Input.
- **Input y Textarea no tenían hover**, aunque la spec (sección 13, «Input») les da `--mimi-input-border-hover`. Por eso, al pasar el ratón, Password cambiaba y Input no.

**Arreglo:**

- **Password** usa `fieldBoxStyles`, la misma caja que Number Input, con los tokens de Input. El ojo usa `fieldButtonHoverStyles`.
- **Input y Textarea** ganan el hover del borde de la spec (`not-disabled:hover:border-[color:var(--mimi-input-border-hover,var(--mimi-input-hover))]`). Con error, el hover deja el borde rojo.
- **Lista de variables CSS del sitio:** `component-tokens.ts` añade `--mimi-input-border-hover`. `component-tokens.spec.ts` toma `--mimi-input-hover` como global del tema.

**Pruebas:**

- `field-borders.spec.ts` (nuevo, 2 casos): Input, Textarea, Password y Number Input llevan el mismo ancho, color y hover del borde, el mismo color de error y el mismo ancho del anillo; con error, el hover no tapa el rojo.
- `password.spec.ts`: la clase del anillo esperada.
- Los cuatro componentes y las variables CSS: 14 + 39 en verde.

**Playwright** (claro y oscuro, **6 de 6 OK**): Password y Number Input coinciden con Input en todo.

| Estado                  | Claro                   | Oscuro                  |
| ----------------------- | ----------------------- | ----------------------- |
| Borde en reposo         | `oklch(0.88)`           | blanco al 15 %          |
| Con hover               | `oklab(0.68)`           | blanco al 27 %          |
| Con foco (teclado)      | `oklch(0.64 0.2 292)`   | `oklch(0.72 0.16 292)`  |
| Con error y hover       | `oklch(0.577 0.245 27)` | `oklch(0.704 0.191 22)` |
| Ancho del borde y radio | 1 px y 12 px            | 1 px y 12 px            |

Input muestra el hover y, con error, el hover deja el rojo.

## 4. Sortable List y los colores fijos de ui-core

**Sortable List.** No tenía un hex: usaba el token `--mimi-info`, el azul de los avisos «info», que viene del diseño. Con el tema violeta se veía azul, que no es el color de la marca. Lo usaba en:

- el borde punteado del hueco;
- el fondo del hueco (`info-soft`);
- el anillo de 2 px del elemento levantado y de su copia.

**Arreglo:**

- `--mimi-sortable-drop` pasa a heredar de `--mimi-ring`, el anillo de la marca, y `--mimi-sortable-drop-bg` de `--mimi-primary-subtle`.
- Se actualizaron la spec (sección 13) y `component-tokens.ts`.
- Anotado en `correcciones-pendientes.md`.

**Playwright** (arrastre real con el ratón, claro y oscuro, **2 de 2 OK**): el hueco tiene borde punteado del color del anillo y fondo `primary-subtle`, y el elemento levantado lleva el anillo del color de la marca, no el de `info`.

| Tema   | Anillo de la marca     | `info` (antes)         | Hueco                                               |
| ------ | ---------------------- | ---------------------- | --------------------------------------------------- |
| Claro  | `oklch(0.64 0.2 292)`  | `oklch(0.44 0.17 255)` | borde `oklch(0.64 0.2 292)`, fondo violeta al 10 %  |
| Oscuro | `oklch(0.72 0.16 292)` | `oklch(0.83 0.11 250)` | borde `oklch(0.72 0.16 292)`, fondo violeta al 10 % |

**Búsqueda de colores fijos en ui-core.** Busqué hex, `rgb()`/`rgba()`, `oklch()` con números, clases de la paleta de Tailwind (`blue-*`, `sky-*`, `gray-*`…) y `white`/`black` en las clases, en los `.ts` de `components/`, sin pruebas y sin los presets del tema. **No hay ninguna clase de la paleta de Tailwind ni `bg-white`/`text-black`.** Quedan estos valores fijos, todos justificados y con su token:

| Archivo                       | Qué                                                                                        | Por qué se queda                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `color-picker.ts`             | Espectro de tonos y área de saturación (`rgb(…)`)                                          | Son los colores que se eligen: no pueden depender del tema.                                                                              |
| `color-picker.ts`             | Pulgar blanco `oklch(1 0 0)` con sombra negra, y borde de las muestras `oklch(0 0 0 / .1)` | Tienen que verse sobre cualquier color. Cada uno tiene su token (`--mimi-color-picker-thumb-border`, `-thumb-shadow`, `-swatch-border`). |
| `color-picker.ts`, `color.ts` | Hex de los comentarios (`#4f46e5`)                                                         | Documentan el formato.                                                                                                                   |
| `data-table.ts`               | Sombra de las columnas fijas `oklch(0 0 0 / .25)`                                          | Negra como las sombras del tema (`--mimi-shadow-*`), con su token `--mimi-table-sticky-shadow`.                                          |

**`info` (azul) en otros estados que no son informativos.** Son tokens del tema, no colores fijos, pero son el mismo problema que el Sortable: el anillo de hover y de la herramienta activa de Toolbar, la zona de File Upload con un archivo encima, la fila elegida, el filtro activo y la insignia de selección de Data Table, la fila «Crear» de Combobox y el contador de Tabs. **No se cambiaron.** Son decisiones del diseño que van con la elección de grises y de marca, así que quedan anotadas en `correcciones-pendientes.md` para la Parte 2. Propuesta: `ring` / `primary-subtle`. Los usos con significado (el tono `info` de Toast, Badge, Button, Progress y Command, el ícono de Confirm o los tipos de archivo de File Upload) se quedan.

**Prueba nueva: `fixed-colors.spec.ts`** (3 casos):

- falla si un componente usa un color fijo fuera de las excepciones, que van con su razón y su recuento;
- falla si una excepción ya no hace falta y nadie actualizó su recuento;
- comprueba que el Sortable usa `ring` y `primary-subtle`, no `info`.

En verde.

## 5. Inventario de los controles

Archivo nuevo: **`docs/plan/controles/inventario.md`**. Tiene una tabla de los 18 controles: Input, Textarea, Select, Combobox, Tags Input, Number Input, Password, Input Mask, Input OTP, Date Picker, Date Range, Color Picker, File Upload, Slider, Checkbox, Switch, Toggle Group y Button. **Radio no existe en Mimi.** Para cada uno da borde, hover, foco, clic (hundimiento y sombra), deshabilitado, solo lectura, error y de dónde sale (helper de `utils/control-styles.ts` o local), más 9 inconsistencias para la Parte 2.

Cómo se hizo:

- Un subagente de solo lectura hizo la lectura del código.
- Se comprobaron a mano el anillo al presionar de Button (`active:ring-3`), el `ring-1` de error de Toggle Group, la opacidad fija de las etiquetas de Checkbox y Switch, la burbuja del Slider y que no hay Radio.
- Las filas de Select, Number Input, Password, Input y Textarea reflejan los arreglos 1 a 3.

Lo más importante:

1. **Hay dos familias de foco** (halo de campo y contorno de botón). Los tokens `--mimi-focus-*` del tema no los usa nadie.
2. **El hundimiento al hacer clic es irregular:**
   - se hunden Select, Date Picker, Date Range, Color Picker y File Upload;
   - los campos de escribir, no;
   - Button se hunde y además le crece un anillo.
3. **Ningún control pinta la solo lectura.** En seis, el hover y el hundimiento siguen activos.
4. **El error se dibuja de cinco maneras.** Switch no tiene.
5. **La opacidad 50 está fija** en `controlDisabledStyles`, sin el token.

## 6. Página «Estados» (Fundamentos › Estados, `/docs/states`)

**Qué es.** Una página nueva del sitio, en el menú después de «Tamaños», para que **el usuario elija**. Muestra los 18 controles en una cuadrícula con **cada estado forzado a la vista**:

- normal, hover, foco (teclado), clic;
- deshabilitado, solo lectura y error.

Para verla en claro y en oscuro se cambia el tema del sitio. Tiene **dos selectores** y una comparación del Tree. Las opciones son **propuestas simuladas en la página: ningún componente cambia**.

**Cómo fuerza los estados** (`states/state-forcer.ts`). Al entrar, la página copia de las hojas reales del sitio (el CSS global y `components.css`) todas las reglas con `:hover`, `:focus-visible`, `:focus-within`, `:focus` o `:active`. En cada copia, la seudoclase pasa a ser el atributo `data-force`, conservando sus envoltorios (`@media`, `@layer`, `@scope`, anidamiento). Son 281 reglas.

- Cada celda marca con `data-force` el elemento que recibiría el puntero o el foco. Así se ven **los estilos de verdad** de cada componente, no una imitación.
- El hover y el clic valen también para los padres (`:has()`), como con el ratón.
- El foco del Select, que ahora es un atributo propio (punto 1), lo pone la celda.
- **No se puede forzar** el foco de las casillas de Input OTP ni la burbuja del Slider, porque salen del evento `focus`. La página lo dice.

**Selectores:**

- **(a) Profundidad al hacer clic** (columna «Clic»):
  - **Actual**: lo que hace hoy cada componente.
  - **A (recomendada)**: a todos les crece el anillo de 3 px `ring-soft`, como a Button. Se hunden (`--mimi-press-scale`) solo los que funcionan como botón: Select, Date Picker, Date Range, Color Picker, File Upload, Slider, Checkbox, Switch, Toggle Group y Button. Los de escribir no se hunden.
  - **B**: todos se hunden y a todos les crece el anillo.
- **(b) Grises**: neutro puro (actual), malva suave (croma 0,006) y malva medio (croma 0,014), con tono 292 y la misma luminosidad. En los casi blancos y casi negros va la mitad del croma. La página calcula en vivo el contraste WCAG de cinco pares de texto con la opción y el tema elegidos.
- **Tree**: el actual (fila elegida con fondo `primary` y texto blanco) al lado de la propuesta recomendada (fondo `primary-subtle`, texto `primary` y anillo solo con el teclado), con «app.ts» elegido y el foco de teclado forzado en «styles.css».

**Contraste** (Playwright, calculado en la página; AA es 4,5):

| Par                        | Claro: neutro / malva suave / malva medio | Oscuro: neutro / malva suave / malva medio |
| -------------------------- | ----------------------------------------- | ------------------------------------------ |
| Texto sobre el fondo       | 17,16 / 17,16 / 17,17                     | 17,16 / 17,16 / 17,17                      |
| Atenuado sobre el fondo    | 4,85 / 4,85 / 4,86                        | 7,77 / 7,76 / 7,76                         |
| Atenuado sobre `muted`     | 4,64 / 4,64 / 4,65                        | 6,53 / 6,53 / 6,53                         |
| Atenuado sobre una tarjeta | 5,06 / 5,06 / 5,06                        | 7,23 / 7,23 / 7,22                         |
| Texto sobre `secondary`    | 16,42 / 16,43 / 16,44                     | 13,06 / 13,07 / 13,09                      |

Todos en AA con las tres opciones. El tinte no mueve el contraste, porque la luminosidad es la misma.

**Playwright** (claro y oscuro, **34 de 34 OK, sin errores de consola**):

- se copiaron 281 reglas;
- Input con hover, foco y error forzados, distintos del normal;
- el Select con el foco de teclado forzado;
- el contorno de foco del Checkbox;
- la opacidad del deshabilitado;
- **A:**
  - el de escribir queda con `scale: none` y el anillo;
  - el de botón queda con `scale: 0.975` y el anillo;
- **B:** los dos quedan con `scale: 0.975`;
- los tres grises con sus contrastes en AA;
- **Tree:** la propuesta cambia el fondo y el texto de la fila elegida (claro: `oklch(0.54 0.239 292)` al 10 % con texto `oklch(0.54 0.239 292)`, en vez de violeta sólido con texto blanco), y el foco forzado pinta el anillo.

Al ver las primeras capturas se arreglaron dos cosas de la página:

- la máscara de Input Mask (`999` → `000`) salía vacía;
- la ayuda de Tags Input, en inglés, alargaba las filas: ahora va con `hint=""`.

**Capturas** (`docs/auto/capturas/2026-11-12/estados/`, la cuadrícula entera, en claro y oscuro):

- profundidad: `profundidad-actual-*.png`, `profundidad-a-*.png` y `profundidad-b-*.png`;
- grises (con la profundidad A): `grises-neutro-*.png`, `grises-malva-suave-*.png` y `grises-malva-medio-*.png`;
- Tree: `tree-*.png` (actual frente a la propuesta).

**Otros cambios del sitio:** el guardián de estilos (`core/components-styles.ts`) pide `components.css` también para `/docs/states`, porque tiene todos los controles. Tiene su prueba en `components-styles.spec.ts`.

**Pruebas** (`states/states-page.spec.ts`, 3 casos):

- **El cambio de seudoclases:** hover, foco, `focus-within`, clic, grupos de Tailwind y las clases escapadas, que no se tocan.
- **Los grises:**
  - el tono 292 y la mitad de croma en los extremos;
  - la transparencia se conserva y la marca no se toca;
  - el contraste de malva medio sigue en AA y a menos de 0,2 del neutro.
- **La página:**
  - 18 filas y 126 celdas, con `data-force` en el elemento correcto;
  - el foco del Select y `data-surface` según el tipo;
  - deshabilitado y error de verdad;
  - las opciones por defecto (A y neutro), los tres botones de cada selector y los dos árboles.
  - Se le da un tope de 60 s: con toda la suite tarda unos 25 s.

**No se hizo la Parte 2** (unificar los controles): espera a que el usuario elija la profundidad, los grises y el Tree en esta página.

## Arreglos durante la verificación final

1. **La suite de ui-core no compilaba desde el commit del punto 4.**
   - **Causa:** `fixed-colors.spec.ts` declaraba `ALLOWED`, `PATTERNS` y `PALETTE`, y esos nombres chocan con otra prueba (estos archivos de prueba son scripts globales).
   - **Por qué no se vio:** las pruebas del punto 4 se pasaron solo con ese archivo y compilaban.
   - **Arreglo:** los nombres llevan el prefijo `FIXED_`. Va en el commit de este punto. Desde entonces, ui-core: 1028 de 1028.
2. **El JS inicial crecía 2 kB desde el commit del punto 2.**
   - **Causa:** `fieldBoxStyles` vivía en `control-styles.ts`, que Button importa y va en el JS inicial del sitio. El empaquetador no quita las constantes que no usa de un módulo compartido con rutas diferidas.
   - **Arreglo:** los estilos de los campos compuestos pasan a un archivo propio, **`utils/field-styles.ts`**. Es un ítem nuevo del registro de la CLI, que Number Input y Password piden. La spec (sección 4) está al día.
   - **Medido** con `ng build --stats-json`: `control-styles.ts` vuelve a 678 bytes en el JS inicial.

## Verificación final

- **`pnpm build`** en verde.
  - **JS inicial:** **335,84 kB crudo / 106,59 kB gzip** (antes de la tanda, 334,87 / 106,23): **+0,97 kB crudo, +0,36 kB gzip**, por debajo del umbral de 1 kB. Parte es la entrada «Estados» del menú y el guardián de estilos con dos prefijos; el resto no lo atribuí módulo por módulo.
  - **CSS global:** **115,59 kB / 17,66 kB gzip** (antes, 112,44 / 17,27): **+3,15 kB crudo, +0,39 kB gzip**. Vienen de las clases de la página «Estados», que está fuera de las páginas de componentes y va al CSS global (la cuadrícula, los selectores y la tabla de contrastes), y del hover nuevo de Input y Textarea.
  - No se subió ningún presupuesto (aviso en 345 kB).
- **Pruebas en verde:** docs **253** (antes de la tanda, 249), ui-core **1028** (antes, 1019), CLI **202**.
- **`pnpm format:check`** en verde.

## Alertas para el revisor

1. **Hubo dos commits de la tanda con problemas, ya arreglados en el último:**
   - el del punto 2 hacía crecer el JS inicial 2 kB;
   - el del punto 4 dejaba la suite de ui-core sin compilar.
   - Ver «Arreglos durante la verificación final».
2. **Cambios visibles para quien ya usa Mimi** (añadidos y arreglos, sin cambio de API):
   - Input y Textarea tienen hover (el de la spec);
   - el hover del borde en oscuro es más suave (el 14 % en vez del 30 %);
   - el Sortable arrastra con el color de la marca;
   - Number Input y Password usan los tokens de Input (`--mimi-input-border`, `-border-hover`…), y quien los sobrescribía en Input ahora los ve también ahí.
   - Van al CHANGELOG «por publicar» cuando se cierre la Parte 2.
3. **`info` (azul) en estados de interacción:** Toolbar, File Upload al arrastrar, Data Table, la fila «Crear» y el contador de Tabs. No se cambió; queda anotado para la Parte 2, con la propuesta `ring` / `primary-subtle`.
4. **Página «Estados»:** las opciones están simuladas con CSS de la página (por ejemplo, `!important` en la columna «Clic»). Es para elegir, no la implementación. La Parte 2 la hará en los componentes.
5. **Nada se comprobó con un lector de pantalla ni en teléfonos reales.**

## Archivos

- **ui-core:**
  - `select/select.ts`
  - `number-input/number-input.ts`
  - `password/password.ts`
  - `input/input.variants.ts`
  - `textarea/textarea.variants.ts`
  - `sortable-list/sortable-list.ts`
  - `utils/control-styles.ts`, `utils/field-styles.ts` (nuevo) y `utils/index.ts`
  - `theme/theme-base.css`
  - pruebas: `select/select-focus-ring.spec.ts`, `field-borders.spec.ts` y `fixed-colors.spec.ts` (nuevas); `select.spec.ts`, `number-input.spec.ts`, `password.spec.ts` y `focus-styles.spec.ts`
- **CLI:** `registry.json` (`utils/field-styles`, y las dependencias de Number Input y Password).
- **Sitio:**
  - `pages/docs/states/` (nuevo): la página, el forzador de estados, los grises y su prueba;
  - `pages/docs/docs.routes.ts`, `layout/docs-nav.ts`;
  - `core/components-styles.ts` y su prueba;
  - `code/component-tokens.ts` y su prueba.
- **Docs:**
  - `docs/plan/controles/inventario.md` (nuevo)
  - `docs/spec.md`
  - `docs/design/correcciones-pendientes.md`
  - este informe
  - capturas en `docs/auto/capturas/2026-11-12/estados/`

## Limpieza

- **Servidor de desarrollo:** puerto 4280, lanzado con `timeout`, detenido al terminar. Se comprobó con `netstat` que el puerto quedó libre.
- **Playwright y los scripts de medida** vivieron en el directorio temporal de la sesión, fuera del repo, y se borraron al terminar.
