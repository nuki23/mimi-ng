# Informe de modo autónomo: refinamiento 0.6.0, rama `auto/refinamiento-0.6.0-2026-11-09`

09/11/2026. `node -v`: v24.18.0. Rama desde `main` = `8f610ff` (fusión del PR #13, el plan de refinamiento). Identidad noreply; sin atribución en los commits. **No se sube la versión ni se publica.** Plan: `docs/plan/refinamiento/R-0.6.0.md`.

**Herramienta de diagnóstico en navegador (fuera del repo, en el directorio temporal de la sesión):** `shot.mjs`, un script de Node que lanza Chrome sin ventana (`--headless=new`) con el puerto de depuración, se conecta por CDP con el `WebSocket` de Node 24, navega al servidor de desarrollo (`pnpm ng serve docs --port 4260`, con `timeout`), activa `.dark` en `<html>` si se pide, mide con `Runtime.evaluate` (`getBoundingClientRect`, `getComputedStyle`) y captura `Page.captureScreenshot` con recorte; al terminar mata Chrome y borra su perfil temporal. No hay ventana, ni dependencias nuevas.

## Base: presupuestos y bundle (antes de empezar)

| Medida     | Crudo     | gzip      | Aviso  | Error  |
| ---------- | --------- | --------- | ------ | ------ |
| JS inicial | 333,31 kB | 106,25 kB | 345 kB | 360 kB |
| CSS global | 170,44 kB | 24,45 kB  | 180 kB | 195 kB |
| `initial`  | 503,75 kB | —         | 525 kB | 555 kB |

(Las de la 0.5.0, `docs/auto/release-0.5.0-2026-11-09.md`.)

## 1. Decisiones del usuario

PD-1 opción B, PD-2 opción C y PD-3 opciones A + B registradas como «Decidido por el usuario» (`docs/auto/decisiones-por-defecto.md`, `docs/plan/refinamiento/decisiones-usuario.md`, tareas R.14, R.19 y R.20); quitadas del índice de pendientes. Commit `docs(plan): PD-1 opción B…`.

## R.10 Errores visuales (hecha)

**Diagnóstico antes de tocar nada** (capturas con zoom en claro/oscuro; medidas con `getBoundingClientRect` y `getComputedStyle`):

- **Tabs pill y Toggle Group, en oscuro: hipótesis confirmada.** Geometría correcta (el indicador está a 4 px del borde en Tabs y a 3 px en Toggle Group), pero el fondo del indicador (`--mimi-card`, `oklch(0.175)`) es **más oscuro** que el contenedor (`muted`, `0.225`), y la sombra `shadow-neutral` en oscuro (`0 4px 10px -4px` negra al 60 %) se extiende hasta el borde inferior del contenedor y por debajo: se ve una mancha oscura que «toca el borde».
- **Skeleton: la hipótesis era incorrecta.** No era el contraste del fondo ni que `tailwind-merge` perdiera `rounded-card` (el radio computado es 16 px, el de `rounded-card`). **El ejemplo medía 0 px de ancho**: su raíz `w-full max-w-md` se resuelve contra el contenedor de la vista previa, que se ajusta al contenido, y los hijos con `w-full` y `w-1/2` quedan en 0. El ejemplo de la tarjeta tenía el mismo defecto (`w-3/5` de un ancho mínimo: 30 px).

**Arreglo:** `--mimi-tabs-pill-active` (`color-mix(foreground 12 %, muted)`, más claro que el contenedor) y `--mimi-tabs-pill-shadow` (`inset` de luz y `0 1px 1px`, desplazamiento + desenfoque ≤ 3 px) en `.dark`, y los de Toggle Group apuntan a ellos; Tabs usa el token de la sombra (antes, `shadow-neutral` fijo). Los dos ejemplos del Skeleton con ancho definido (`w-80 max-w-full`). **Después:** capturas de Tabs y Toggle Group en oscuro con el indicador más claro y la sombra contenida; el ejemplo del Skeleton mide 320 × 128 px.

**Pruebas:** `theme/pill-dark.spec.ts` (3: el fondo se mezcla sobre `muted`, la sombra ≤ 3 px, Tabs usa el token), `skeleton.spec.ts` (`rounded-card` gana al radio por defecto), `tabs.spec.ts` actualizada. `pnpm test:ui-core`: 908 en verde (905 antes + 3 nuevas, y 1 nueva de Skeleton: 904 → 908).

**Bundle:** CSS global 170,44 → **171,12 kB** crudo (24,45 → 24,53 gzip); JS inicial sin cambios (333,31 / 106,25). Límite: 180 kB de aviso.

**Archivos:** `theme/theme-base.css`, `components/tabs/tabs.ts` y `tabs.spec.ts`, `theme/pill-dark.spec.ts` (nuevo), `components/skeleton/skeleton.spec.ts`, los dos ejemplos de `apps/docs/.../skeleton/examples/`, `docs/plan.md`, `R-0.6.0.md`. (Un arreglo posterior, en el commit de R.11: `apps/docs/src/app/code/component-tokens.ts` no listaba `--mimi-tabs-pill-shadow` y `pnpm test` del sitio lo exige; no lo vi antes porque en R.10 corrí solo `test:ui-core`.)

## R.11 Blocks en carga (hecha)

**Antes:** `login-01`, `login-02`, `signup-01` y `otp-01` solo marcaban el botón de enviar (`aria-disabled`, `aria-busy`, spinner); campos, botones de redes y enlaces seguían editables. `pricing-01`, `table-01` no tenían entrada de carga y `settings-01` solo ignoraba el guardado repetido.

**Decisión por defecto (pendiente de revisión del usuario), distinta de la propuesta del plan:** el plan proponía una directiva `mimiDisabled` que propaga `disabled` a cada control. Es mucho más grande y la misma idea aparece en R.23. En su lugar, **el anfitrión del Block queda `inert` y con `aria-busy="true"`** mientras carga: el navegador no enfoca ni activa nada dentro (campos, casillas, redes, enlaces, botones). Ventaja: cubre todo, también lo que se agregue al Block, sin tocar cada control. **Contra, a anotar:** los lectores de pantalla no ven el contenido de un Block inerte; la app debe anunciar el progreso (Toast, `LiveAnnouncer`). Cambio de comportamiento visible: el botón de enviar ya no recibe foco al pulsar (ya se ignoraba el reenvío).

**Hecho:** `inert` y `aria-busy` en `login-01`, `login-02`, `signup-01`, `otp-01`, `settings-01` (con `saving`); `loading` nuevo en `pricing-01` y `table-01` (en `table-01` también pasa a la Data Table, que ya tiene «cargando»); estados «Cargando»/«Guardando» en las vistas previas del sitio (`block-previews.ts`, las tres páginas y `block-pages.spec.ts`). **Pruebas:** `block-loading.spec.ts` (7 Blocks × sin carga, con carga y de vuelta); ui-core 915, docs 192 en verde. **Bundle:** sin cambios (JS inicial 333,31 / 106,25; CSS global 171,12 / 24,53): las clases de los Blocks van en `blocks.css`.

**No hecho:** la directiva `mimiDisabled` (se pospone). **NO COMPROBADO (manual, usuario):** que el flujo con un lector de pantalla sea aceptable con el Block inerte.

## R.9 Efecto de clic uniforme (hecha)

**Antes:** los tokens `--mimi-press-scale` (0,975) y `--mimi-press-scale-sm` (0,9) ya existían, con `prefers-reduced-motion` a 1, pero 9 archivos escribían números sueltos: `active:scale-90` (Calendar ×2, Color Picker, Dialog, Select), `[0.985]` (Combobox, File Upload, Menu, Select), `[0.99]` (Command), `[0.96]` (Calendar, Date Range) y `[0.94]` (Calendar ×2): hundimientos de 0,90 a 0,99 y **ignoraban el movimiento reducido**.

**Decisión por defecto (pendiente de revisión):** `scale-90` → el token pequeño (mismo valor, 0,9); los `0.985`, `0.99`, `0.96` y `0.94` → `--mimi-press-scale` (0,975). Los elementos «sin hundimiento» del plan (filas y celdas) no se tocaron más: ya usaban el token o `active:scale-100`. Cambio visual: las filas de Select/Combobox/Menu/Command se hunden un poco más (0,985 → 0,975) y las celdas del Calendar un poco menos (0,94/0,96 → 0,975).

**Prueba:** `press-scale.spec.ts` recorre `components/` y `blocks/` y falla si aparece `active:scale-<número>` (salvo `scale-100`), y comprueba los tokens y el movimiento reducido. ui-core 917 en verde.

**Bundle:** CSS global 171,12 → **170,83 kB** (24,53 → 24,48 gzip); JS inicial sin cambios.

**Script de edición múltiple** (la misma sustitución en 9 archivos; guardado fuera del repo, en el directorio temporal; falla sin escribir nada si no encuentra lo esperado). `git diff --stat` **antes de Prettier** y **después**: iguales, 9 archivos, 14 inserciones y 14 borrados (Prettier no cambió nada). Archivos: `calendar`, `color-picker`, `combobox`, `command`, `date-range`, `dialog`, `file-upload`, `menu`, `select` (`components/<x>/<x>.ts`). Texto completo:

```js
// R.9: sustituye los `active:scale-…` con números sueltos por los tokens de clic del tema.
// Falla y no escribe nada si algún archivo no tiene exactamente lo esperado.
import { readFileSync, writeFileSync } from 'node:fs';
const root = 'C:/dev/mimi-ng/packages/ui-core/src/lib/components/';
const SM = 'active:scale-(--mimi-press-scale-sm)';
const MD = 'active:scale-(--mimi-press-scale)';
const plan = {
  'calendar/calendar.ts': [
    ['active:scale-90', SM, 2],
    ['active:scale-[0.96]', MD, 1],
    ['active:scale-[0.94]', MD, 2],
  ],
  'color-picker/color-picker.ts': [['active:scale-90', SM, 1]],
  'combobox/combobox.ts': [['active:scale-[0.985]', MD, 1]],
  'command/command.ts': [['active:scale-[0.99]', MD, 1]],
  'date-range/date-range.ts': [['active:scale-[0.96]', MD, 1]],
  'dialog/dialog.ts': [['active:scale-90', SM, 1]],
  'file-upload/file-upload.ts': [['active:scale-[0.985]', MD, 1]],
  'menu/menu.ts': [['active:scale-[0.985]', MD, 1]],
  'select/select.ts': [
    ['active:scale-[0.985]', MD, 1],
    ['active:scale-90', SM, 1],
  ],
};
const out = {};
for (const [file, edits] of Object.entries(plan)) {
  let text = readFileSync(root + file, 'utf8');
  for (const [from, to, count] of edits) {
    const found = text.split(from).length - 1;
    if (found !== count)
      throw new Error(`${file}: «${from}» aparece ${found} veces y se esperaban ${count}`);
    text = text.split(from).join(to);
  }
  out[file] = text;
}
for (const [file, text] of Object.entries(out)) writeFileSync(root + file, text);
console.log('listo', Object.keys(out).length, 'archivos');
```

## R.1 Escala común de tamaños (hecha en parte)

**Hecho:** `utils/size.ts` (nuevo, sin `@angular/forms`): `MimiSize = 'sm' | 'md' | 'lg'`, `MIMI_SIZE`, la directiva **`mimiSize`** (`<form mimiSize="sm">` da el tamaño a todos los controles de dentro; el `size` propio gana; el contenedor más cercano gana) y `injectMimiSize` (propio → contenedor → `md`). **Button, Input y Avatar:** la variante `default` pasa a `md` (RUPTURA suave), `default` sigue aceptándose como alias con un aviso en desarrollo («`[Mimi] Size: …`», una vez por componente; se quita en la 0.7.0); `data-size` muestra el tamaño resuelto; Button conserva `icon` sin heredarlo. Registro de la CLI: ítem `utils/size` y dependencia en `avatar`, `button` e `input` (las pruebas de la CLI lo exigen). Las tablas de la API del sitio (Button, Input, Avatar) al día.

**RUPTURA para el CHANGELOG de la puerta:** `size="default"` de Button, Input y Avatar → `md` (alias hasta la 0.7.0); el valor por defecto de `size` ya no es `'default'` sino «sin valor» (hereda de `mimiSize` o `md`); `ButtonSize`, `InputSize` y `AvatarSize` ya no incluyen `default`.

**Pruebas:** `utils/size.spec.ts` (herencia, el propio gana, el contenedor más cercano, alias y aviso, misma altura de Button e Input en `sm`), specs de Button, Input y Avatar al día, `registry.spec.ts` y `ui.spec.ts`. ui-core 921, docs 192, CLI 202, en verde.

**Bundle:** JS inicial 333,31 → **333,95 kB** (+0,64: `size.ts` entra por Button) / 106,25 → 106,54 gzip; CSS global 170,83 kB (sin cambio).

**No hecho (queda abierta, `[~]`):** Progress y Pagination (R.8); la página «Tamaños» del sitio; la tabla «qué cambia el tamaño» de la spec; tokens de texto, padding e ícono por tamaño (se mantienen los de cada componente).

## R.0 Tema de marca: la parte de color (hecha; logo y favicon, a la espera)

**Hecho:** escala `--mimi-brand-50…950` (anclas exactas `600` = `#793EEA` = `oklch(0.54 0.239 292)`, `400` = `#A88FFF` = `oklch(0.72 0.16 292)`; los demás pasos, mi curva, a revisar por el usuario en la página de Tema); `--mimi-brand-gradient`, `--mimi-brand-text` (600 en claro, 400 en oscuro) y su exposición a Tailwind (`bg-brand-600`, `text-brand-text`…). **Primario** `brand-600` en claro (texto `oklch(0.985)`) y `brand-400` en oscuro (texto `oklch(0.205)`); **anillo** `brand-500` / `brand-400`. **Neutros** `#FAFAFA`/`#171717` (`oklch(0.985)`/`oklch(0.205)`); en oscuro las superficies suben (tarjeta 0,235, popover 0,26, muted 0,27, secundario y acento 0,30, texto atenuado 0,74). **Hover del primario** hacia `foreground` en vez de hacia el fondo (con el fondo `#FAFAFA` el violeta aclarado daba 4,24:1, bajo AA; ahora pasa). **`MIMI_THEME_NEUTRAL`** (`theme/neutral.ts`, ítem `theme` del registro): el tema anterior para quien no quiera el violeta. Tipo: `brandText` y `brandGradient` en `MimiColorTokens`. La fuente no cambia (Outfit y Geist Mono).

**Contrastes (calculados, comprobados por `contrast.spec.ts`, 5 pares nuevos × claro y oscuro, más una prueba de cifras):** `#793EEA` sobre `#FAFAFA` 5,45:1; texto `#FAFAFA` sobre `#793EEA` 5,45:1; `#A88FFF` sobre `#171717` 6,86:1; texto `#171717` sobre `#A88FFF` 6,86:1; prohibidos como texto: `#793EEA` sobre `#171717` 3,15:1 y `#A88FFF` sobre `#FAFAFA` 2,50:1 (la prueba exige que den menos de AA). Toda la suite de contraste previa (cada texto de cada componente sobre su fondo, en reposo y en hover, claro y oscuro) sigue pasando con la paleta nueva. Una cifra del diseño (`success-soft-foreground`, 6,83 → 6,57) cambió porque el suave se mezcla sobre el fondo nuevo `#FAFAFA`; actualizada con su nota.

**Comprobado en Chrome sin ventana:** la página de Button en claro y en oscuro (fondo, texto, logo del sitio violeta en ambos).

**RUPTURA (visual) para el CHANGELOG de la puerta:** cambian los colores por defecto (primario violeta, neutros `#FAFAFA`/`#171717`, superficies oscuras más claras). Quien tenga `theme-base.css` sin modificar lo recibe con `ng g mimi`; quien lo modificó, el aviso de siempre. Para conservar el tema de antes: `provideMimiTheme(MIMI_THEME_NEUTRAL)`.

**Bundle:** CSS global 170,83 → **171,44 kB** (24,48 → 24,61 gzip); JS inicial sin cambios (333,95 / 106,54). **Pruebas:** ui-core 934, CLI 202, docs 192.

**Pendiente (`[~]`):** logo (SVG) y favicon en el sitio (`site-header.html`, `mobile-nav.html`, `public/`, `index.html`, `theme-color`): **a la espera de los archivos del logo** que traerá el usuario. **NO COMPROBADO (usuario):** que la curva intermedia de la escala (50 a 950) le guste; la página de Tema del sitio no muestra todavía la escala.

## R.5 Toast: `outline` con el color del tono (hecha)

**Antes:** `variant: 'outline'` ya existía, pero para los cuatro tonos era la tarjeta neutra (solo el ícono llevaba el color). **Ahora:** `outline` (por defecto) lleva borde y fondo suave del tono (`border-<tono>-border`, `bg-<tono>-soft`, `bg-destructive-soft-bg`; texto y ícono con el `-soft-foreground` ya comprobado en AA); `neutral` (nueva) es la tarjeta de la 0.5.0; `solid` no cambia; sin tono, las tres son la tarjeta. **Decisión por defecto (la Recomendación del plan):** `outline` por defecto es de color, **RUPTURA visual** (un `toast.success('x')` cambia de aspecto; para el de antes, `variant: 'neutral'`). **Pruebas:** `toast.spec.ts` (los cuatro tonos × borde, fondo e ícono; `neutral` conserva la tarjeta); ui-core 935, docs 192 en verde. **Bundle:** CSS global 171,44 kB (sin cambio: las clases ya estaban generadas), JS inicial 333,95 / 106,54. API del sitio al día. **No comprobado en navegador:** el aspecto real de cada tono (las pruebas ven las clases, no los píxeles).

## R.18 Input OTP: cantidad de dígitos (hecha, sin rehacer `length`)

**Ya existía:** `[length]` (por defecto 6; la prueba lo cambiaba a 4). **Lo que faltaba:** con 10 casillas de 46 px no cabía en un teléfono, y la documentación solo mostraba 4, 5 y 6. **Hecho:** las casillas se encogen (`min-w-0 shrink`) y la fila no pasa del ancho del padre (`max-w-full`); **medido en Chrome a 360 px: la fila de 10 casillas va de 12 a 348 px, sin desplazamiento horizontal, cada casilla de 22 px** (estrecho pero usable; el tamaño de letra no se tocó). `separatorAfter` acepta una lista (`[3, 6]` o `"3,6"`). Ejemplo «10 casillas, con dos guiones» en la página y la tabla de la API al día (`length` sin tope, recorte de lo pegado). **Pruebas:** `input-otp.spec.ts` (10 casillas: `maxlength`, dos separadores en su sitio, pegado de 14 dígitos recortado a 10, clases de encogimiento); ui-core 936 en verde. **Bundle:** CSS global 171,44 → 171,46 kB; JS inicial sin cambios (333,95 / 106,54). **No hecho:** casillas de dos filas con más de 8 (el encogimiento basta a 360 px con 10).

## R.17 Tabs: atajo `<mimi-tab label>` (hecha)

**Hecho:** `mimi-tab` (clase `MimiTabElement`), un elemento con `label`, `value` (opcional: sin él, el `label` en minúsculas, sin tildes y con guiones), `count` y `disabled`; `mimi-tabs` recoge las dos formas con un token interno (`MIMI_TAB`), así que `ng-template[mimiTab]` sigue igual y **se pueden mezclar** (orden del DOM). **Limitación documentada, no un error:** el contenido de un `<mimi-tab>` se crea con la página (un elemento proyecta su contenido al declararlo), así que pierde la carga perezosa; para un panel costoso, `ng-template[mimiTab]`. La página de Tabs muestra primero la forma corta y después la plantilla perezosa, y la tabla de la API lo dice. **Pruebas:** `tab-element.spec.ts` (orden del DOM y valor por defecto; contenido ansioso del elemento frente a plantilla perezosa, con un contador de instancias; `[(value)]` con `value` dado; una pestaña deshabilitada no se elige); las pruebas de Tabs de antes sin tocar (salvo la de R.10); ui-core 939, docs 192 en verde. **Bundle:** JS inicial 333,95 / 106,54 y CSS global 171,46 / 24,61 (sin cambios medibles).

## R.6 y R.7 Dialog: tamaños y servicio (R.6 hecha; R.7 en parte, sin rehacer lo que ya existía)

**Ya existía (comprobado, no se rehízo):** `MimiDialogService.open(componente, config)`, `data` con `MIMI_DIALOG_DATA`, `ref.close(resultado)`, `afterClosed()`, `width`, `maxWidth` adaptado a la pantalla (`min(…, 100vw − 32px)`), `class`, cabecera/cuerpo/pie opcionales y un ejemplo con servicio.

**Hecho (R.6):** `size: 'sm' | 'md' | 'lg'` en `MimiDialogConfig` y en `<mimi-dialog>`: sm 360 px (relleno 16 px), md 420 px (**el actual: no cambia nada por defecto**), lg 560 px, por la variable `--mimi-dialog-width` del panel; `width` y `maxWidth` mandan sobre él. **(R.7):** `inputs` (los valores de las entradas del componente, con `setInput` antes de la primera detección), `padding` (la variable `--mimi-dialog-padding`), `panelClass` (alias de `class`; gana `class`), `ref.closed` (observable, el nombre de cdk Dialog) y `ref.result` (señal). **La página de Dialog** pone primero lo que el usuario buscaba: un aviso al inicio de «Uso» que lleva al servicio, y el código del servicio con `size`, `inputs`, `padding`, `panelClass` y `ref.closed`; tabla de la API al día.

**Pruebas:** `dialog-service.spec.ts` (los tres tamaños, `padding` y su 16 px en `sm`, `panelClass` + `class`, `inputs` antes de pintarse y `close(resultado)` hacia `closed` y `result()`); las 30 pruebas de Dialog de antes sin tocar. ui-core 943, docs 192, CLI 202 en verde. Registro de la CLI: `dialog` depende de `utils/size` (solo el tipo). **Bundle:** CSS global 171,46 → 171,51 kB; JS inicial 333,95 / 106,54.

**No hecho (R.7 queda `[~]`):** `chrome: 'none'` (sin X ni relleno ni cabecera; hoy se logra con `closeButton: false` y `padding: '0'`); que Confirm use `size` por defecto `sm`. **Decisión por defecto:** `padding` es un solo valor lateral, no el `padding` de cuatro valores del ejemplo del usuario (`'0.5rem 0 0 0'`): las piezas llevan su relleno con una variable de un valor.

## R.14 Form Field: mensajes de error, PD-3 opciones A + B (hecha en parte)

**Ya existía:** en Signal Forms, `required(path.user, { message })` ya se mostraba sin `mimi-form-error` (`mimiErrorText` honraba `error.message`; había un ejemplo); la página lo documentaba como nivel 2. **Lo que faltaba y se hizo:** (B) en Reactive Forms el `message` del error se perdía (`fromValidationErrors` solo copiaba los datos): ahora se lee de `{ clave: { message } }`, y `withMessage(validador, texto | función)` envuelve `Validators.*`; (A) `[errors]` en `mimi-form-field`: un texto o función por clave (las claves no distinguen mayúsculas), para los tres sistemas, también `ngModel` con `required` como atributo. **Prioridad (documentada y probada):** `<mimi-form-error>` con texto > `message` del validador > `[errors]` del campo > `provideMimiErrorMessages` > predeterminado. Sin ruptura (aditivo). **Página:** el orden documentado y la tabla de la API al día (los ejemplos ejecutables nuevos: no).

**Pruebas:** `error-priority.spec.ts` (4: `withMessage` con texto y función y un validador propio con `{ message }`; `[errors]` con texto, función, mayúsculas y `ngModel`; la prioridad completa; Signal Forms); ui-core 947, docs 192, CLI 202 en verde. **Bundle:** JS inicial 333,94 / 106,55; CSS global 171,51 / 24,62.

**No hecho (`[~]`):** los atajos `hint`, `required` y `description`; los ejemplos con Select, Combobox, Slider, etc. dentro del Form Field; el diagrama «control → primer error → texto» y la tabla de qué clave produce cada validador.

# Puerta de la 0.6.0 (R.P6): parada en la puerta, NO cerrada

**La puerta se recorrió, pero la 0.6.0 no está completa:** quedan sin ejecutar tareas del alcance principal (ver «Estado»). No se subió la versión ni se publicó; el repo sigue en `0.5.0`.

## Estado de las tareas de `R-0.6.0.md`

| Tarea                                                                                                                                                                                                  | Estado                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| R.10 errores visuales                                                                                                                                                                                  | **hecha**                                                                                  |
| R.11 Blocks en carga                                                                                                                                                                                   | **hecha** (con `inert`, decisión por defecto)                                              |
| R.9 clic uniforme                                                                                                                                                                                      | **hecha**                                                                                  |
| R.5 Toast `outline` tonal                                                                                                                                                                              | **hecha**                                                                                  |
| R.18 OTP                                                                                                                                                                                               | **hecha**                                                                                  |
| R.17 `<mimi-tab>`                                                                                                                                                                                      | **hecha**                                                                                  |
| R.6 Dialog `size`                                                                                                                                                                                      | **hecha**                                                                                  |
| R.0 tema de marca                                                                                                                                                                                      | **color hecho**; logo y favicon `[~]`, a la espera de los archivos del logo                |
| R.1 escala de tamaños                                                                                                                                                                                  | **parcial** (tipo, `mimiSize`, alias; Button, Input, Avatar; faltan Progress y Pagination) |
| R.7 Dialog como servicio                                                                                                                                                                               | **parcial** (falta `chrome: 'none'`; Confirm)                                              |
| R.14 Form Field                                                                                                                                                                                        | **parcial** (PD-3 A + B hechas; faltan `hint`, `required`, `description`)                  |
| R.2, R.3, R.4, R.8 tamaños en los demás componentes, Switch/Checkbox y Toast; R.12 `readonly`; R.13 ejemplos de formularios; R.15 Select con `mimi-option`; R.16 Combobox; R.24 auditoría de uso corto | **NO ejecutadas**                                                                          |

**Por qué se paró aquí:** la sesión se acercó al límite de lo manejable antes de llegar a los tamaños en todos los componentes (R.2, R.3, R.4, R.8) y al Select (R.15). **No se subió ningún presupuesto, no hay dependencias nuevas ni cuentas externas.** La puerta no se puede cerrar como «0.6.0 lista»: faltan tareas; lo hecho es coherente y verde, y se puede publicar como una versión intermedia si el usuario lo decide.

## Verificación final

- `pnpm build`: en verde, **sin avisos de presupuesto**. `pnpm test`: **docs 192, ui-core 947, CLI 202**, todo en verde. `pnpm format:check`: en verde.

| Medida                    | 0.5.0              | Ahora                  | Aviso  | Error  |
| ------------------------- | ------------------ | ---------------------- | ------ | ------ |
| JS inicial (crudo / gzip) | 333,31 / 106,25 kB | **333,94 / 106,55 kB** | 345 kB | 360 kB |
| CSS global (crudo / gzip) | 170,44 / 24,45 kB  | **171,51 / 24,62 kB**  | 180 kB | 195 kB |
| `initial` (JS + CSS)      | 503,75 kB          | **505,46 kB**          | 525 kB | 555 kB |

El JS inicial crece 0,63 kB (menos de 1 kB: `utils/size.ts` entra por Button) y el CSS 1,07 kB. **Con los tamaños pendientes en ~35 componentes, el CSS global seguirá creciendo**: hoy quedan 8,5 kB hasta el aviso; el plan debe medirlo en R.2, R.3, R.4 y R.8 y, si algo exige subir el presupuesto, detenerse (A7).

## Escenarios con el `.tgz` (versión temporal `0.6.0-dev.0`, fuera del repo)

El repo está en 0.5.0 (no se subió la versión); para que el escenario de actualización sea real, se empaquetó **una copia** de `packages/cli` (ya compilado) con la versión cambiada solo en `package.json` y `dist/registry.json` de la copia: `C:\t\r060\mimi-ng-cli-0.6.0-dev.0.tgz`, sha256 `c9e82541…`, **167 archivos** (165 + `utils/size.ts` y `theme/neutral.ts`), 285,4 kB, **0** archivos `.spec.`, **0** de `testing`, sin rutas personales ni correos (la búsqueda de `C:\`, `/Users/`, correos y el nombre de usuario no encontró nada). Node 24.18.0, npm 11.16.0, pnpm 12.5.1, Angular 22.2.x; Tailwind fijado a 4.3.3 en los proyectos de prueba (el binario de la 4.3.5 lo bloquea el Control de aplicaciones de Windows de este equipo, ver el informe de la 0.5.0).

| #     | Escenario                                                                                                                                                            | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | npm, proyecto nuevo                                                                                                                                                  | `ng add` y `ng g mimi button login-01 settings-01 pricing-01 table-01 select toast dialog tabs input-otp form-field`: páginas en `src/app/pages/{login,settings,table}`, `pricing-01` en `src/app/blocks`; `login-02` con `login/` ocupada falla sin escribir nada y `--name sign-in` genera `sign-in/`; rutas pegadas, `ng build` en verde y sin avisos, CSS de 133 kB con utilidades de las páginas; `ng serve`: `/table` responde 200.                                                                                   |
| 2     | pnpm, proyecto nuevo                                                                                                                                                 | Lo mismo con `pnpm ng …`: `ng build` en verde, CSS de 130 kB con `--mimi-brand-600`, `ng serve`: `/settings` responde 200.                                                                                                                                                                                                                                                                                                                                                                                                  |
| 3 + 4 | Actualización desde la **0.5.0 real de npm**, con un componente modificado (`button.ts`) y una página instalada y modificada (`settings.ts`), y `login-01` sin tocar | Se agregan `utils/size.ts` y `theme/neutral.ts`; se actualizan `input`, `tabs`, `form-field`, `avatar`, `utils/field-state` y `theme`; **`button` queda bloqueado con su aviso** y, por el todo o nada, lo que depende de él (`toast`, `login-01`, `pricing-01`) también, con el motivo; `settings-01` (página modificada) bloqueada con su aviso; avisos de «tu Block usa … que se actualizó». Con `--overwrite` en `button`, se actualizan `button`, `toast`, `login-01` y `pricing-01`. `ng build` en verde, sin avisos. |
| 5     | `source(none)` desde la 0.5.0 real                                                                                                                                   | `ng add` de la 0.5.0 ya agregó `@source "./app/pages"` y `./app/blocks`; con la nueva CLI, `login-01`, `settings-01` y `button` se generan sin duplicar el `@source`; `ng build` en verde y el CSS trae las clases de la página (`gap-[18px]`, `max-w-[400px]`).                                                                                                                                                                                                                                                            |

**Al terminar:** puertos 4251, 4252 y 4260 sin escucha (los servidores se mataron por su PID, cada espera con `timeout`); `C:\t\q60` y `C:\t\r060` borrados. **No son de esta sesión y no se tocaron:** las carpetas de `C:\t` que ya estaban (`app-npm`, `b040`, `b040p`, `b11`, `g3`, `m4`, `r030`, `r050`, `vh`).

## Alertas para el revisor y el usuario

1. **Muchas tareas sin ejecutar** (tabla de arriba): el titular de la 0.6.0, «tamaños `sm/md/lg` en TODOS los componentes», está hecho solo en Button, Input, Avatar y Dialog (ancho).
2. **RUPTURAS para el CHANGELOG** (para cuando se cierre la 0.6.0): `size="default"` de Button, Input y Avatar pasa a `md` (alias y aviso hasta la 0.7.0) y su valor por defecto es «sin valor» (hereda de `mimiSize`); colores por defecto del tema (violeta, neutros `#FAFAFA`/`#171717`, superficies oscuras más claras; `MIMI_THEME_NEUTRAL` para conservar el anterior); Toast: `outline` por defecto es de color (`variant: 'neutral'` para el de antes); Tabs y Toggle Group en oscuro cambian de aspecto (R.10); clic de los elementos con número suelto (0,985 → 0,975…); los Blocks quedan inertes mientras cargan (sin foco ni clic; los lectores de pantalla no ven su contenido, la app debe anunciar el progreso).
3. **Decisiones por defecto tomadas** (revisables): R.11 con `inert` en vez de `mimiDisabled`; R.9 los literales al token más cercano; R.5 `outline` de color por defecto; R.7 `padding` de un solo valor; R.14 prioridad documentada.
4. **Comprobación manual del usuario:** el aspecto real de Toast `outline` en cada tono, la curva intermedia de la escala de violeta, el flujo con lector de pantalla de un Block inerte, Tabs y Toggle Group en oscuro en un navegador real (se comprobaron en Chrome sin ventana), y el logo/favicon.
5. **Servidor de desarrollo:** se levantó varias veces en el puerto 4260 con `timeout`; se mató por su PID al terminar.
6. **Un `sed` y un `sed -i` sin querer:** un `sed -i` mío lo bloqueó el clasificador (no llegó a ejecutarse) y repetí con la herramienta de archivos; en un comando de lectura de un proyecto de prueba usé `sed` sin `-i` para escribir por pantalla. Ningún archivo del repo se editó con `sed`. El único script de edición múltiple (R.9) está documentado con su texto completo.
