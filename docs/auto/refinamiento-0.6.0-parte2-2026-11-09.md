# Informe de modo autónomo: refinamiento 0.6.0, segunda tanda (misma rama `auto/refinamiento-0.6.0-2026-11-09`)

09/11/2026. `node -v`: v24.18.0; rama al día (`18b5fea`), árbol limpio, identidad noreply, sin atribución. **No se sube la versión ni se publica.** Continúa `docs/auto/refinamiento-0.6.0-2026-11-09.md` (primera tanda y primera puerta).

**Por qué paré en la primera tanda:** por mi propio juicio sobre el tamaño de la sesión, **no** por presupuesto, dependencia ni cuenta externa (A7): no era un motivo válido. En esta tanda sigo hasta la puerta y, si la sesión se acabara, la sección «Punto exacto donde quedo» de abajo se mantiene al día.

## 1a. `<mimi-tab>`: valor válido y único (commit `fix(tabs)…`)

**Prueba que fallaba antes:** `tab-value.spec.ts` (3 de 3 en rojo). **Arreglo:** `mimi-tabs` se ofrece a sus `<mimi-tab>` (token interno `MIMI_TAB_GROUP`); sin `value`, el valor es el `label` limpio; si no da ninguno (sin letras latinas ni dígitos) usa el **índice**; si una pestaña anterior ya tiene ese valor, un **sufijo** (`facturacion`, `facturacion-2`, `-3`); y avisa **una vez** en desarrollo cuando falta `value` y el valor no sale limpio del label. **Decisión por defecto:** el aviso no salta cuando el `label` da un valor limpio y único (si saltara siempre, el atajo corto sería ruidoso). ui-core 950 en verde.

## 1b. Dialog con `inputs`: validación antes de crear (commit `fix(dialog)…`)

**Prueba que fallaba antes:** `dialog-service.spec.ts` («clave que el componente no tiene», en rojo). **Arreglo:** `open()` valida `inputs` **antes de crear el `ref` y de programar nada** (con `reflectComponentType`, nombres de plantilla): lanza `[Mimi] Dialog: «titel» no es una entrada de Upload. Entradas que tiene: title, risk.`; con una plantilla, `inputs` lanza un error que remite a `data`. No queda panel ni contenedor del CDK. ui-core 951 en verde.

## 1c. Blocks inertes: devolver el foco y anunciar (commit `fix(blocks)…`)

**Prueba que fallaba antes:** `utils/busy.spec.ts` (no existía la utilidad). **Arreglo:** `utils/busy.ts` (`restoreFocusAfterBusy(busy, mensajes?)`, ítem `utils/busy` del registro con el peer `@angular/cdk`): al empezar la carga recuerda el control de dentro que tenía el foco (el que lanzó la acción) y anuncia «Loading…» con `LiveAnnouncer`; al terminar, **después del render que quita `inert`**, le devuelve el foco y anuncia «Done.». Si el foco no estaba dentro del Block, no lo roba. Aplicado a los siete Blocks (`loading`; `saving` en `settings-01`) y declarado en el registro. **Límite:** la prueba simula con `blur()` que el navegador saca el foco de lo inerte (jsdom no lo hace); el comportamiento real con un lector de pantalla queda **NO COMPROBADO (manual, usuario)**. Mensajes en inglés fijos (como los textos de los Blocks); personalizables desde la utilidad, no todavía desde la API del Block.

**Script de edición múltiple** (la misma inserción en 7 archivos; fuera del repo, falla sin escribir si no encuentra exactamente una vez lo esperado). `git diff --stat` **antes de Prettier** y **después**: iguales (7 archivos, 21 inserciones, 0 borrados). Texto completo:

```js
// Revisión 1c: los 7 Blocks devuelven el foco y anuncian al terminar de cargar.
// Falla y no escribe nada si un archivo no tiene exactamente una vez lo esperado.
import { readFileSync, writeFileSync } from 'node:fs';
const root = 'C:/dev/mimi-ng/packages/ui-core/src/lib/blocks/';
const files = {
  'login-01/login-01.ts': 'loading',
  'login-02/login-02.ts': 'loading',
  'signup-01/signup-01.ts': 'loading',
  'otp-01/otp-01.ts': 'loading',
  'settings-01/settings-01.ts': 'saving',
  'pricing-01/pricing-01.ts': 'loading',
  'table-01/table-01.ts': 'loading',
};
const IMPORT = "import { cn } from '@/components/ui/utils/cn';\n";
const NEW_IMPORT = IMPORT + "import { restoreFocusAfterBusy } from '@/components/ui/utils/busy';\n";
const out = {};
for (const [file, name] of Object.entries(files)) {
  let text = readFileSync(root + file, 'utf8');
  const line = `  readonly ${name} = input(false, { transform: booleanAttribute });\n`;
  for (const needle of [IMPORT, line]) {
    const found = text.split(needle).length - 1;
    if (found !== 1)
      throw new Error(`${file}: «${needle.trim()}» aparece ${found} veces (se esperaba 1)`);
  }
  text = text.replace(IMPORT, NEW_IMPORT);
  text = text.replace(
    line,
    line +
      `  /** Al terminar de ${name === 'saving' ? 'guardar' : 'cargar'}, el foco vuelve a quien lanzó la acción y se anuncia (los Blocks inertes no los ven los lectores). */\n` +
      `  private readonly focusBack = restoreFocusAfterBusy(this.${name});\n`,
  );
  out[file] = text;
}
for (const [file, text] of Object.entries(out)) writeFileSync(root + file, text);
console.log('listo', Object.keys(out).length, 'archivos');
```

Pruebas: ui-core 953 (`busy.spec.ts` 2, `block-loading.spec.ts` sigue), docs 192, CLI 202, en verde.

## 1d. El violeta de marca y el azul `info` se distinguen por luminosidad (commit `fix(theme)…`)

**Comprobado primero (prueba en rojo):** el primario de marca y `info` tenían **la misma luminosidad OKLCH** (claro: 0,54 frente a 0,546, ΔL 0,006; oscuro: 0,72 frente a 0,72, ΔL 0) y solo 37° de tono (292 frente a 255): no se distinguían sin color. **Ajuste, registrado como decisión por defecto:** `info` claro `oklch(0.546 0.19 255)` → `oklch(0.44 0.17 255)` (ΔL 0,10; su texto blanco pasa de 4,79:1 a 7,48:1) e `info` oscuro `oklch(0.72 0.14 250)` → `oklch(0.83 0.11 250)` (ΔL 0,11). **Prueba nueva** en `contrast.spec.ts`: ΔL ≥ 0,08 en claro y oscuro. Toda la suite de contraste AA (cada texto de cada componente, reposo y hover, claro y oscuro) sigue pasando con el `info` nuevo; la cifra del diseño de `info-foreground` sobre `info` se actualizó (4,79 → 7,48) con su nota. **Cambio visual** (azul más oscuro en claro y más claro en oscuro) para el CHANGELOG. ui-core 954 en verde.

## 2. Tamaños: la escala vive una vez en el tema

**Diseño (R.1, completa lo que faltaba):** `theme-base.css` define la escala **una sola vez** con variables por `[data-size]`: `--mimi-size-height`, `-px`, `-text`, `-icon` y `-gap` para `sm`, `md` (también `:root`, el por defecto) y `lg`. Los tokens por tamaño de siempre (`--mimi-btn-height`, `-sm`, `-lg`; los de Input y Avatar) se resuelven **dentro de cada bloque** (`--mimi-btn-h`, `--mimi-input-h`, `--mimi-avatar-s`…), así un `md` dentro de un `sm` no hereda el alto del `sm` y los tokens públicos siguen valiendo. **Button, Input y Avatar migrados:** sus tres tamaños llevan **las mismas clases** (antes, tres cadenas distintas) y solo cambian las variables; con respaldos para un tema anterior. `mimiSize` ahora pone `data-size` en el contenedor: la escala llega por cascada de CSS **también a componentes sin `size` propio**. Nueva directiva de anfitrión `MimiSized` (`size` + `data-size`, sin código propio) para que un componente ofrezca `size` con una línea.

**R.2 controles (hecho):** `select`, `combobox`, `number-input`, `password`, `input-mask`, `tags-input`, `date-picker`, `date-range`, `color-picker` y `textarea` declaran `hostDirectives: [{ directive: MimiSized, inputs: ['size'] }]` y leen su alto de la escala (`--mimi-size-height`, o `--mimi-input-h` los que comparten el alto de Input); su ítem del registro depende de `utils/size`. **Cambio de semántica anotado:** el token `--mimi-<componente>-height` de Select, Combobox y Number Input ahora vale para **todos** los tamaños (antes solo existía `md`).

**Pruebas:** `theme/size-scale.spec.ts` (los tres bloques, valores `13px/0.875rem/15px` y `0.75/1/1.5rem`, mapeo de los tokens por tamaño, sin filtración de `sm` a `md`), `utils/size-controls.spec.ts` (los 10 controles heredan de `mimiSize`, el `size` propio gana, `md` fuera del contenedor; también al cambiar el contenedor), specs de Button, Input, Avatar, Select, Combobox, Date Picker y Textarea con las clases nuevas; `component-tokens.spec.ts` acepta las variables derivadas. ui-core 957, docs 192, CLI 202 en verde. **En Chrome:** Input `sm 32 / md 40 / lg 48 px`, Avatar `32 / 40 / 56 px`, Button `lg` 48 px y los controles de R.2 en `md` a 40 px, como antes.

**Dos scripts de edición múltiple** (fuera del repo; fallan sin escribir si no encuentran lo esperado): (1) las alturas de 9 archivos a la escala (`git diff --stat` antes de Prettier: 9 archivos, 11 inserciones y 11 borrados; después: 12 y 11, Prettier reflujó una línea); (2) la directiva de anfitrión en 10 componentes. Textos completos:

```js
// R.2 (1): los controles leen su alto de la escala de tamaños del tema (data-size).
import { readFileSync, writeFileSync } from 'node:fs';
const root = 'C:/dev/mimi-ng/packages/ui-core/src/lib/components/';
const IN_FROM = 'var(--mimi-input-height,var(--mimi-control-height,2.5rem))';
const IN_TO = 'var(--mimi-input-h,var(--mimi-input-height,var(--mimi-control-height,2.5rem)))';
const CT_FROM = 'var(--mimi-control-height,2.5rem)';
const CT_TO = 'var(--mimi-size-height,var(--mimi-control-height,2.5rem))';
const plan = {
  'input-mask/input-mask.ts': [[IN_FROM, IN_TO, 1]],
  'password/password.ts': [[IN_FROM, IN_TO, 1]],
  'tags-input/tags-input.ts': [[IN_FROM, IN_TO, 1]],
  'textarea/textarea.variants.ts': [[IN_FROM, IN_TO, 2]],
  'color-picker/color-picker.ts': [[CT_FROM, CT_TO, 1]],
  'date-picker/date-picker.ts': [[CT_FROM, CT_TO, 1]],
  'combobox/combobox.ts': [[CT_FROM, CT_TO, 2]],
  'select/select.ts': [[CT_FROM, CT_TO, 1]],
  'number-input/number-input.ts': [[CT_FROM, CT_TO, 1]],
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
```

```js
// R.2 (2): los controles reciben `size` y `data-size` con la directiva de anfitrión MimiSized.
import { readFileSync, writeFileSync } from 'node:fs';
const root = 'C:/dev/mimi-ng/packages/ui-core/src/lib/components/';
const files = {
  'select/select.ts': "mimi-select'",
  'combobox/combobox.ts': "mimi-combobox'",
  'number-input/number-input.ts': "mimi-number-input'",
  'password/password.ts': "mimi-password'",
  'input-mask/input-mask.ts': "mimi-input-mask'",
  'tags-input/tags-input.ts': "mimi-tags-input'",
  'date-picker/date-picker.ts': "mimi-date-picker'",
  'date-range/date-range.ts': "mimi-date-range'",
  'color-picker/color-picker.ts': "mimi-color-picker'",
  'textarea/textarea.ts': "textarea[mimiTextarea]'",
};
const IMPORT = "import { cn } from '@/components/ui/utils/cn';\n";
const out = {};
for (const [file, selector] of Object.entries(files)) {
  let text = readFileSync(root + file, 'utf8');
  const sel = `  selector: '${selector},\n`;
  for (const needle of [IMPORT, sel]) {
    const found = text.split(needle).length - 1;
    if (found !== 1)
      throw new Error(`${file}: «${needle.trim()}» aparece ${found} veces (se esperaba 1)`);
  }
  text = text.replace(IMPORT, IMPORT + "import { MimiSized } from '@/components/ui/utils/size';\n");
  text = text.replace(
    sel,
    sel + "  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],\n",
  );
  out[file] = text;
}
for (const [file, text] of Object.entries(out)) writeFileSync(root + file, text);
```

**Bundle:** CSS global 171,51 → **173,44 kB** (+1,93: los bloques de la escala y las clases largas con respaldos; 24,62 → 24,99 gzip); JS inicial 333,94 → 333,96 kB. **Sigue lejos de 180 kB (quedan 6,6 kB); umbral de parada fijado en 178 kB.**

## Punto exacto donde quedo

Hecho: 1a, 1b, 1c, 1d, la escala en el tema (R.1) con Button, Input y Avatar, y R.2 (10 controles). **Sigue:** R.3 (Switch/Checkbox), R.4 (Toast), R.8 (resto de componentes y Progress/Pagination), luego 3 (R.7, R.12, R.13, R.14, R.15, R.16, R.24) y la puerta.
