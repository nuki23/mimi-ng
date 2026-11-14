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

## 8. `/docs/states`: Password oculto, con una fila «mostrar»

En el navegador, al cargar, la fila Password ya salía oculta (`type=password`) en las 7 columnas. Lo que faltaba era una fila aparte para ver el campo con el texto a la vista.

- **«Password (mostrar)»**, fila nueva: el mismo campo, con el ojo pulsado al cargar. Se pulsa con `click()` desde el código: no mueve el foco (punto 9), y el botón queda `aria-pressed="true"` (el `type` no se cambia por fuera del componente).
- **En deshabilitado, «No aplica»:** el componente no deja mostrar una contraseña deshabilitada (el botón del ojo se deshabilita).
- La nota de la fila lo explica. La prueba de cobertura no cambia (la fila nueva apunta a la misma carpeta).

**Prueba que falla antes:** `states-page.spec.ts`, caso nuevo: la fila Password con `type=password` en las 7 columnas; la fila «mostrar» con `type=text` salvo en deshabilitado; el ojo pulsado. Falló antes de la fila nueva. El caso de la cuadrícula pasa a 20 filas (140 celdas).

**Playwright** (`password.mjs`, claro y oscuro): **30 de 30 OK**. Password oculto en las 7 columnas; «mostrar» con `type=text` y el ojo pulsado en 6, sin campo en deshabilitado. Sin errores.

## 9. `/docs/states` no enfoca ningún control al cargar

**No se reprodujo** con el código actual (después de los puntos 1 a 8). Se buscó de cuatro formas, en claro y oscuro:

- `nofocus.mjs`: el foco a los 0, 0,5, 1,5 y 3 s de cargar está en `body`, y también al llegar navegando desde otra página. La página no se desplaza sola: `scrollY` 0 y ningún contenedor con scroll. Un `scrollIntoView` al cargar se vería como si enfocara un control.
- `focusprobe.mjs`, con el `focus()` de los elementos interceptado antes de cargar la página: `document.hasFocus()` es `true`, no hay ningún `[autofocus]`, y no hubo ni una llamada a `focus()` ni un evento `focusin`.
- En el código: ninguna versión de la página llamó a `focus()`. Los `focus()` de los componentes van todos detrás de una acción del usuario (teclas, clic, abrir un panel). El del Tree, por ejemplo, solo con las flechas.
- La fila «mostrar» del punto 8 pulsa el ojo con `click()`, que no mueve el foco (comprobado aquí mismo).

**Lo que puede parecer un control enfocado:** la columna «Foco (teclado)» lo fuerza a la vista a propósito (anillo y borde de la marca). **Pendiente del usuario:** si lo ve otra vez, decir qué control y en qué navegador; con eso se puede seguir.

**Prueba que lo vigila** (`states-page.spec.ts`, caso nuevo): durante la carga no hay ningún `focusin` y el foco no queda dentro de la página. No hay error que reproducir, así que no hay prueba «que falle antes». **8 de 8 OK** en Playwright.

## 10. Input OTP con Tab

**Comprobado, sin cambios:** Input OTP tiene un solo `<input>` transparente y pinta el foco en la casilla activa, desde su evento `focus`.

**Playwright** (`otp.mjs`, claro y oscuro): **12 de 12 OK**. Se entra con Tab (desde el elemento anterior en el orden de tabulación) en el primer Input de su página y en el primer OTP de la suya:

| Tema   | Input con Tab                                     | Casilla de OTP con Tab                            |
| ------ | ------------------------------------------------- | ------------------------------------------------- |
| Claro  | borde `oklch(0.64 0.2 292)`, anillo 3 px al 32 %  | borde `oklch(0.64 0.2 292)`, anillo 3 px al 32 %  |
| Oscuro | borde `oklch(0.72 0.16 292)`, anillo 3 px al 32 % | borde `oklch(0.72 0.16 292)`, anillo 3 px al 32 % |

- Solo una casilla lleva el anillo (1 de 8).
- Al salir con Tab, ninguna.
- Sin errores de consola.

Captura: `docs/auto/capturas/2026-11-13/otp-tab-*.png`.

Lo cubren las pruebas de `input-otp.spec.ts` (los estados de la casilla) y `field-states.spec.ts`: no hizo falta una prueba nueva.

## 11. Grises: capturas lado a lado (el tema no cambia)

El usuario no nota el cambio a malva suave. **El tema se queda en malva suave hasta que el usuario elija.**

**Cómo se hicieron** (`grays-compare.mjs` y `grays-swatches.mjs`, fuera del repo): sobre el sitio servido, Playwright inyecta una hoja que reescribe solo los 15 grises (fondo, texto, tarjeta, popover, secondary, muted, accent y sus textos, `border`, `input` e `input-background`). Mantiene la luminosidad y la transparencia del tema y cambia solo el croma, con tono 292: **0** (neutro), **0,006** (malva suave, el actual) o **0,014** (malva medio). Los casi blancos y casi negros llevan la mitad. Es la misma regla de la comparación del 12/11/2026. Nada del repo cambia.

**Las capturas** (`docs/auto/capturas/2026-11-13/grises/`):

| Archivo                                  | Qué muestra                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| `grises-estados-dark.png`, `-light.png`  | `/docs/states` (menú, texto, campos), las tres opciones juntas                        |
| `grises-portada-dark.png`, `-light.png`  | la portada (tarjetas, botones, bloque de código)                                      |
| `grises-muestras-dark.png`, `-light.png` | muestras grandes de fondo, tarjeta, muted, borde, campo y texto apagado, con su valor |

**Los valores:**

| Token              | Oscuro: neutro / malva suave / malva medio      | Claro: neutro / malva suave / malva medio |
| ------------------ | ----------------------------------------------- | ----------------------------------------- |
| `background`       | `0.205 0` / `0.205 0.006` / `0.205 0.014`       | `0.985 0` / `0.985 0.003` / `0.985 0.007` |
| `card`             | `0.235 0` / `0.235 0.006` / `0.235 0.014`       | `1 0` / `1 0.003` / `1 0.007`             |
| `muted`            | `0.27 0` / `0.27 0.006` / `0.27 0.014`          | `0.97 0` / `0.97 0.003` / `0.97 0.007`    |
| `muted-foreground` | `0.74 0` / `0.74 0.006` / `0.74 0.014`          | `0.54 0` / `0.54 0.006` / `0.54 0.014`    |
| `border`           | `1 0 / 10%` / `1 0.003 / 10%` / `1 0.007 / 10%` | `0.922 0` / `0.922 0.006` / `0.922 0.014` |
| `input`            | `1 0 / 15%` / `1 0.003 / 15%` / `1 0.007 / 15%` | `0.88 0` / `0.88 0.006` / `0.88 0.014`    |

Todo en `oklch(L C 292)`. El resto (`foreground`, `popover`, `secondary`, `accent` y sus textos, `input-background`) sigue la misma regla.

**Lo que se ve:**

- Con croma 0,006, la diferencia con el neutro casi no se nota, en claro sobre todo. Por eso el usuario no la ve.
- En oscuro se distingue en `muted` y en el texto apagado; con 0,014 (malva medio), también en el fondo y las tarjetas.
- La luminosidad es la misma en las tres, así que el contraste no cambia.
- El «neutro» de estas capturas tiene la misma luminosidad que el tema actual. `MIMI_THEME_NEUTRAL` en oscuro es más oscuro (fondo 0,145).

**Pendiente del usuario:** elegir entre neutro, malva suave y malva medio.

## CHANGELOG, diseño y cierre

- **CHANGELOG, «0.6.0 (por publicar)»:**
  - la profundidad pasa a B;
  - se suman: el borde y el anillo con el panel abierto, la X de limpiar, Tags Input en solo lectura (con su token nuevo) y el hover de Checkbox, Switch y Toggle Group;
  - en «Arreglos», los paneles en un contenedor con scroll;
  - en «Documentación», Textarea con su página, la fila de Password a la vista, el ejemplo de scroll y «Con formularios» en 18 páginas.
- **`docs/design/correcciones-pendientes.md`:** apartado «Revisión del sitio (13/11/2026)», con lo que no tiene diseño o se aparta de él (profundidad B, panel abierto, X, Tags en solo lectura, hover de los de elegir). En la nota de los grises, que el usuario no ve el cambio y dónde están las capturas.
- **Spec:** profundidad B en «`field-styles.ts`», paneles en un contenedor con scroll (`utils/overlay.ts`) y el token de Tags Input.

### Bundle

| Momento                      | JS inicial (crudo / gzip) | CSS global (crudo / gzip) |
| ---------------------------- | ------------------------- | ------------------------- |
| Antes de esta tanda          | 334,89 / 106,23 kB        | 122,39 / 18,15 kB         |
| Después del punto 1          | 334,89 / 106,23 kB        | 122,70 / 18,17 kB         |
| Después de los puntos 2 a 5  | 334,89 / 106,23 kB        | 124,86 / 18,39 kB         |
| **Al final** (puntos 1 a 11) | **334,89 / 106,23 kB**    | **130,77 / 18,69 kB**     |

- El JS inicial no cambia. `overlay.ts` ahora importa el CDK en ejecución, pero solo lo usan componentes que ya lo cargaban.
- El CSS global sube **+8,38 kB crudo y +0,54 kB gzip**, por las variantes nuevas de los componentes que van en el CSS global: profundidad, panel abierto, hover de Checkbox, Switch y Toggle Group, la X y las etiquetas de solo lectura.
- Presupuestos: `styles` avisa en 180 kB; el inicial (JS + CSS, unos 466 kB), en 525 kB. **No hace falta subir ninguno.**

### Verificación final

| Punto                                       | Prueba que falla antes                  | Playwright               |
| ------------------------------------------- | --------------------------------------- | ------------------------ |
| 1. Profundidad B                            | `field-depth.spec.ts` (3 de 4 fallaban) | 72/72 (clic real), 36/36 |
| 2. Abierto con el borde y el anillo         | `field-open.spec.ts` (3 de 3)           | 28/28                    |
| 3. La X de Select y Combobox                | `clear-visibility.spec.ts` (4 de 4)     | 34/34                    |
| 4. Tags Input en solo lectura               | `tags-input.spec.ts`, caso nuevo        | 10/10 (4,79:1 y 6,7:1)   |
| 5. Paneles en un contenedor con scroll      | `overlay-scroll.spec.ts` (el de Select) | 32/32                    |
| 6. Input y Textarea, dos páginas            | `input-textarea-split.spec.ts` (3 de 3) | 26/26                    |
| 7. Hover de Checkbox, Switch y Toggle Group | `choice-hover.spec.ts` (3 de 3)         | 24/24                    |
| 8. Password oculto y fila «mostrar»         | `states-page.spec.ts`, caso nuevo       | 30/30                    |
| 9. Sin foco al cargar                       | no se reprodujo; prueba que lo vigila   | 8/8                      |
| 10. Input OTP con Tab                       | ya estaba bien: sin cambios             | 12/12                    |
| 11. Grises lado a lado                      | (capturas, el tema no cambia)           | 6 imágenes               |

- `pnpm test`: **ui-core 1061, docs 260, CLI 202**, en verde.
- `pnpm build` en verde.
- `pnpm format:check`: «All matched files use Prettier code style!».
- Servidor de desarrollo cerrado: puerto 4280 libre, con `netstat`. Herramientas de Playwright y registros borrados del directorio temporal.

### Alertas para el revisor

- **Profundidad B, la caja entera:** en Number Input, Password y Combobox, los botones de dentro (− y +, el ojo, la X) ya no se hunden aparte; se hunde la caja. La X del Select está fuera de su botón y conserva su hundimiento pequeño.
- **El disparador de un Dropdown Menu** lleva el contorno de Button mientras el menú está abierto. Es una clase de la directiva `mimiDropdownMenuTrigger`, que se suma a las del botón; funciona con cualquier botón, no solo con `mimiBtn`.
- **Paneles con scroll:** ahora también se cierran cuando el campo sale de la pantalla con el scroll de la página. Antes el CDK los recolocaba fuera de la vista. Context Menu abierto con el puntero sigue igual: se cerraba con el scroll de la ventana, y en un contenedor con scroll no sigue al punto.
- **`mimiInView` da por visible un elemento sin caja** (0 × 0): sin maquetar no se sabe, y así no se cierran paneles en jsdom.
- **Punto 9 no se reprodujo.** Queda una prueba que lo vigila; si el usuario lo ve otra vez, que diga qué control y en qué navegador.
- **Punto 10 sin cambios:** el anillo de OTP ya era el de Input.
- **Textarea:** su tabla de la API suma `size`, que la página compartida no tenía.
- **NO COMPROBADO (manual, usuario):**
  - una mirada propia en el navegador a la profundidad B, que en los campos de escribir puede sentirse distinta al escribir;
  - los paneles en un contenedor con scroll con rueda y con el dedo, en un teléfono;
  - la elección de los grises.
- **No se subió la versión ni se publicó nada.**

### Archivos

- **ui-core:**
  - `utils/field-styles.ts` y `utils/control-styles.ts`; `utils/overlay.ts`;
  - los componentes: `select`, `combobox`, `popover`, `dropdown-menu`, `context-menu`, `tooltip`, `number-input`, `password`, `tags-input`, `checkbox`, `switch`, `toggle-group`, `slider` (comentario) y `date-picker.spec.ts`;
  - pruebas nuevas: `field-open.spec.ts`, `clear-visibility.spec.ts`, `choice-hover.spec.ts` y `utils/overlay-scroll.spec.ts`;
  - pruebas cambiadas: `field-depth.spec.ts` (reescrita), `clear-button.spec.ts` y `tags-input.spec.ts`.
- **Sitio:**
  - `pages/docs/states/` (página, plantilla y prueba);
  - `pages/docs/components/input/` (página y prueba);
  - `pages/docs/components/textarea/` (nueva, con los ejemplos movidos);
  - `docs.routes.ts`, `layout/docs-nav.ts` y `blocks/settings-01-page.ts`;
  - `code/forms-snippets.ts`, `code/forms-tabs.spec.ts` y `code/component-tokens.ts`;
  - `pages/docs/input-textarea-split.spec.ts` (nueva).
- **Docs:** `CHANGELOG.md`, `docs/spec.md`, `docs/design/correcciones-pendientes.md`, `docs/auto/decisiones-por-defecto.md`, `docs/plan/controles/inventario.md` y este informe. Capturas: `docs/auto/capturas/2026-11-13/` (Tags en solo lectura, OTP con Tab y `grises/`).
