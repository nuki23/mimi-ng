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
