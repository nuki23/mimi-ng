# Refinamiento 0.6.0, décima tanda: revisión del sitio (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 9](refinamiento-0.6.0-parte9-2026-11-12.md)

Encargo del 13/11/2026, después de que el usuario revisara el sitio y `/docs/states`. **Cambio de decisión del usuario: profundidad B** (todos los controles se hunden al hacer clic, también los de escribir), registrado como «Decidido por el usuario» en `docs/auto/decisiones-por-defecto.md`, con la A marcada como sustituida.

Un commit por punto. Playwright con `playwright-core` 1.56.1 y el Chrome instalado, **fuera del repo**, contra `pnpm ng serve docs --port 4280`, en claro y oscuro. **No se subió la versión ni se publicó nada.** Node 24.18.0.

## 1. Profundidad B

**Qué cambia:**

- `fieldBoxStyles` (Combobox, Tags Input, Number Input, Password, Input Mask) y `fieldNativeStyles` (Input, Textarea) ganan `active:scale-(--mimi-press-scale)` y `mimi-transition`, con las mismas condiciones que el halo (no en deshabilitado ni en solo lectura). Los que funcionan como botón (Select, Date Picker, Date Range, Color Picker, File Upload, Checkbox, Switch, Toggle Group, Button) ya se hundían.
- **Number Input:** se hunde **la caja entera**, también al hacer clic en la zona del número. Los − y + ya no se hunden aparte (si no, el hundimiento se sumaría). Lo mismo con el ojo de Password y la X del Combobox, que están dentro de su caja. La X del Select está fuera del botón del Select y conserva su hundimiento pequeño.
- **«Reducir movimiento»:** nada se hunde (el tema pone `--mimi-press-scale` a 1) y el halo se queda.
- `/docs/states`: el texto de arriba dice que todos se hunden. La spec («`field-styles.ts`»), los comentarios del código y el inventario dicen B.

**Prueba que falla antes:** `field-depth.spec.ts`, reescrita para la B. Contra el código de la A falló en 3 de 4 casos (las piezas de escribir sin `active:scale`, los − y + de Number Input con su propia escala, la condición de solo lectura del hundimiento); ahora pasa.

**Playwright:**

- `press.mjs`, **clics de verdad** (`mouse.down` sobre cada control de la columna «Normal» de `/docs/states`, mientras el botón sigue pulsado), claro y oscuro, con y sin «reducir movimiento»: **72 de 72 OK**, dos pasadas seguidas. Los 16 controles y el + de Number Input con `scale: 0.975` y el halo; con «reducir movimiento», sin escala y con el halo. Al terminar cada uno, la prueba comprueba también que el panel (Date Picker, Date Range, Color Picker, Select) se cierra con Escape y un clic fuera.
- `forced.mjs`, la columna «Clic» forzada: **36 de 36 OK** (todos hundidos y con halo; el texto nuevo de la página).

**Bundle:** JS inicial **334,89 kB / 106,23 kB gzip** (sin cambio); CSS global **122,70 kB / 18,17 kB gzip** (antes 122,39 / 18,15). Pruebas: ui-core 1047, docs 253, CLI 202.

Nota sobre la prueba: al principio fallaban algunos, pero por la prueba misma. `querySelector(':active')` devolvía `<html>`; las filas de abajo estaban fuera de la vista; y el Escape llegaba antes de que se abriera el panel. Se corrigió la prueba, no los componentes.

## 2. Controles con panel: abiertos, con el borde y el anillo de la marca

**Causa:** Combobox mantiene el borde y el anillo porque el foco se queda en su input (`focus-within`). Select solo los ponía con el foco de teclado (`data-focus-visible`), y Date Picker, Date Range y Color Picker, con `focus-visible` en su botón; abiertos con el ratón no tenían ninguno.

**Arreglo**, en las piezas comunes (`utils/field-styles.ts`):

- `fieldTriggerBoxStyles` (Select): con `data-state="open"` de la caja, el borde `--mimi-input-border-focus` y el halo.
- `fieldTriggerStyles` (Date Picker, Date Range, Color Picker): con `aria-expanded` del botón (lo pone `mimiPopoverTrigger`), lo mismo.
- Con error, el borde y el halo de error también abiertos.
- **Menús:** `mimiDropdownMenuTrigger` suma el contorno del foco de Button (`aria-expanded:outline-2 …outline-ring`) mientras el menú está abierto. La clase se suma a las del botón; no las reemplaza. Context Menu no tiene disparador visible.

**Prueba que falla antes:** `field-open.spec.ts` (nuevo, 3 casos: la caja del Select, el botón del Date Picker y el disparador del menú). Falló en los 3 antes del arreglo.

**Playwright** (`open.mjs`, clic con el ratón y el ratón fuera para que no cuente el hover, claro y oscuro): **28 de 28 OK**. Combobox, Select, Date Picker, Date Range y Color Picker abiertos tienen el borde igual a `--mimi-ring` (`oklch(0.64 0.2 292)` en claro, `0.72 0.16 292` en oscuro) y el halo. Al cerrar, el borde vuelve a otro color: con Escape, el foco vuelve al botón por teclado y queda el anillo de foco, que es lo correcto. El menú abierto tiene contorno sólido de 2 px; cerrado, ninguno. Sin errores de consola.

## 3. Select y Combobox: la X tras elegir con el ratón

**Causa:** la X se mostraba con `group-focus-within`, y después de elegir con el ratón el foco sigue en el campo: en Combobox, en su input; en Select, vuelve a su botón desde el código. Así la X se quedaba visible.

**Arreglo:** una marca nueva en la caja, **`data-focus-keyboard`**, con el `FocusMonitor` del CDK sobre toda la caja (también cuenta el foco en la X). Se pone si el foco llegó por teclado, o desde el código cuando lo último fue el teclado. Se quita en cuanto se usa el ratón o el dedo, aunque el foco no salga: así cubre el caso de llegar con Tab y luego elegir con el ratón. La X (y el chevron, al revés) se ve con el ratón encima, con `data-focus-keyboard`, con el panel abierto o, en pantallas sin ratón, mientras haya valor. El anillo de foco del Select no cambia (sigue `data-focus-visible`).

**Prueba que falla antes:** `clear-visibility.spec.ts` (nuevo, 4 casos: las clases y la marca con teclado y con ratón, en Select y Combobox). Falló en los 4. La prueba anterior, `clear-button.spec.ts`, esperaba `group-focus-within` y se actualizó. Detalle de la prueba: el `mousedown` de prueba lleva `detail: 1`; con 0, el CDK lo toma por un lector de pantalla, o sea, por teclado.

**Playwright** (`clear.mjs`, páginas de Select y Combobox, claro y oscuro, dos pasadas): **34 de 34 OK**.

- Elegir con el ratón: X oculta y chevron visible (con el foco dentro).
- Ratón encima: X visible.
- Tab hasta el campo: X visible.
- Panel abierto: X visible.
- Llegar con Tab y elegir con el ratón: X oculta.
- En táctil (`hasTouch`, 400 px), con valor: X visible.
- Sin errores de consola.

## 4. Tags Input en solo lectura: etiquetas que se distinguen

**Causa:** el fondo de solo lectura (`--mimi-input-readonly`, 70 % de `muted`) es casi igual al del chip (`secondary`): las etiquetas no se veían.

**Arreglo:** en solo lectura, el chip toma el fondo del campo (`--mimi-input-bg`) y un borde de 1 px con el token nuevo **`--mimi-tags-chip-readonly-border`** (por defecto, `muted-foreground`). Se le pasa por la entrada `class` de Chip, así que Chip no cambia. Token en `component-tokens.ts` y en la tabla de Tags Input de la spec.

**Prueba que falla antes:** `tags-input.spec.ts`, caso nuevo: sin solo lectura, el chip sin borde; con solo lectura, el borde y el fondo. Falló antes del arreglo.

**Playwright** (`tags.mjs`, `/docs/states`, columna «Solo lectura»; colores pintados pasados a sRGB): **10 de 10 OK**.

| Tema   | Borde / fondo del campo | Texto de la etiqueta | Fondo de la etiqueta / campo |
| ------ | ----------------------- | -------------------- | ---------------------------- |
| Claro  | **4,79:1**              | 17,89:1              | 1,06:1                       |
| Oscuro | **6,7:1**               | 13,08:1              | 1,13:1                       |

El borde es lo que lleva el contraste de 3:1 (el fondo solo aclara). La etiqueta normal sigue sin borde. Captura: `docs/auto/capturas/2026-11-13/tags-readonly-*.png`.

## 5. Paneles flotantes dentro de un contenedor con scroll

**Causa:** el CDK solo recoloca los paneles con el scroll de la ventana y de los contenedores marcados con `cdkScrollable`. En un `overflow: auto` cualquiera, el panel se quedaba fijo mientras el contenido se movía.

**Arreglo, en un solo sitio** (`utils/overlay.ts`):

- **`mimiInView(el)`:** recorta la caja del campo con la pantalla y con cada antepasado que recorta (`overflow` auto, scroll, hidden o clip). Un elemento sin caja cuenta como visible: sin maquetar no se sabe, y así jsdom no cierra los paneles en las pruebas.
- **`mimiFollowScroll(origen, recolocar, cerrar)`:** escucha el scroll en la fase de captura de todo el documento (el evento `scroll` no sube), una vez por cuadro, solo si el scroll movió al campo. Así, el de la lista del propio panel no cuenta. Recoloca o, si el campo salió de la vista, cierra.
- **Directiva `MimiOverlayFollow`** sobre el `<ng-template cdkConnectedOverlay>`, con la salida `(mimiOverlayOutOfView)`. Se engancha a `attach`/`detach` del CDK.

**Quién la usa:**

- **Select, Combobox, Popover y Dropdown Menu**, con la directiva. Date Picker, Date Range y Color Picker la tienen por Popover.
- **Context Menu:** solo abierto con el teclado; abierto con el puntero, el origen es un punto y ya se cerraba con el scroll.
- **Tooltip:** llama a la función directamente y se oculta.

El registro de la CLI no cambia: todos ya pedían `utils/overlay`.

**Ejemplo de prueba:** sección nueva «**Paneles en un contenedor con scroll**» en `/docs/states`: un recuadro de 256 px con scroll que contiene Select, Combobox, Date Picker, Date Range, Color Picker, un menú y un botón con Tooltip.

**Prueba que falla antes:** `overlay-scroll.spec.ts` (nuevo, 3 casos: `mimiInView` con un contenedor que recorta, `mimiFollowScroll` que recoloca, ignora otros scrolls, cierra y deja de escuchar, y un Select dentro de un contenedor que se cierra cuando el campo sale). El caso del Select falló hasta enganchar la directiva.

**Playwright** (`scroll.mjs`, la sección nueva de `/docs/states`, claro y oscuro): **32 de 32 OK**.

- Los 7 (Select, Combobox, Date Picker, Date Range, Color Picker, menú y Tooltip) mantienen la misma distancia a su campo después de 40 px de scroll del recuadro. El campo sube 40 px y el panel también, por ejemplo Select: panel 669 → 629, campo 621 → 581.
- Los 7 se cierran con el campo fuera de la vista del recuadro.
- El scroll de la página sigue moviendo el panel con ella (669 → 609 con 60 px).
- Sin errores de consola.

## 6. Input y Textarea, dos páginas

Como se hizo con Switch y Checkbox:

- **Textarea**, página nueva en `/docs/components/textarea`: instalación, uso, sus dos ejemplos (movidos con `git mv` desde `input/examples/`), «Con formularios» (entrada nueva `textarea` en `FORMS_SPECS`: «Comentario» con `rows="3"`), API y variables CSS. La tabla de la API suma **`size`**, que Textarea tiene (por `MimiSized`) y la página compartida no decía.
- **Input:** solo Input. El texto enlaza a Textarea. «En fila» se queda (muestra Input, Textarea y Button alineados).
- **Menú:** «Input» y «Textarea» (antes, «Input y Textarea»). **Rutas:** `components/input` («Input · Mimi») y `components/textarea` («Textarea · Mimi»).
- **Enlaces:** el Block Settings 01 enlaza `textarea` a su página.

**Prueba que falla antes:** `input-textarea-split.spec.ts` (nuevo, 3 casos: rutas y títulos, menú, enlaces de los Blocks). Falló en los 3. También: `textarea-page.spec.ts` nuevo (sus 2 ejemplos, sin Input, con «Con formularios»), `input-page.spec.ts` con 9 ejemplos y un solo instalador, y `forms-tabs.spec.ts` con 18 fragmentos. Docs: 258 en verde.

**Playwright** (`pages.mjs`, claro y oscuro): **26 de 26 OK**.

- Títulos y h1 de las dos páginas; el menú con las dos entradas y sin la de antes.
- El enlace de Input lleva a Textarea, y la entrada del menú queda marcada.
- La ruta nueva carga directa; Textarea con sus ejemplos, sin Input y con «Con formularios».
- Settings 01 enlaza a Textarea.
- Sin errores de consola.

## 7. Checkbox, Switch y Toggle Group: hover sutil

**Antes:** Checkbox oscurecía el borde solo sin marcar y solo con el ratón sobre la casilla, no sobre la etiqueta. Switch y Toggle Group no tenían hover de color; en Toggle Group solo cambiaba el texto.

**Ahora** (nunca en deshabilitado ni en solo lectura):

- **Checkbox:** con el ratón sobre todo el control (`group/checkbox`, también la etiqueta), sin marcar, el borde de hover de los campos (`--mimi-input-border-hover`). Marcada o mixta, el relleno y el borde se intensifican: el color de la casilla al 88 % con `foreground`.
- **Switch:** con el ratón sobre todo el control (`group/switch`), la pista se intensifica. Apagada, su color al 82 % con `foreground`; encendida, al 88 %. Sigue al color de la pista si lo cambiaste.
- **Toggle Group:** la opción no elegida toma un fondo suave (`foreground` al 6 %); la elegida ya tiene el indicador.

Sin tokens nuevos.

**Prueba que falla antes:** `choice-hover.spec.ts` (nuevo, 3 casos). Falló en los 3.

**Playwright** (`hover.mjs`, ratón de verdad, claro y oscuro): **24 de 24 OK**.

- Con el ratón en la etiqueta cambian el borde y el relleno de la casilla marcada y la pista del Switch.
- La opción no elegida de Toggle Group pasa de transparente a `foreground / 0.06`.
- La casilla sin marcar de la página de Checkbox: borde `oklch(0.88 …)` → `oklab(0.68 …)` en claro.
- En deshabilitado y solo lectura, nada cambia.
- Sin errores de consola.

**Bundle** (después de los puntos 2 a 5): JS inicial **334,89 kB / 106,23 kB gzip** (sin cambio: `overlay.ts` ahora importa el CDK en ejecución, pero solo lo usan componentes que ya lo cargaban); CSS global **124,86 kB / 18,39 kB gzip** (desde el punto 1, +2,16 kB crudo, +0,22 kB gzip). Pruebas: ui-core 1058, docs 253, CLI 202.
