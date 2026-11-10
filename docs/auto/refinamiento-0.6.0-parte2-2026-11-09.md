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

## Punto exacto donde quedo

Hecho: 1a, 1b, 1c, 1d. **Sigue: 2** (escala de tamaños por `[data-size]` en el tema y R.2, R.3, R.4, R.8, lo que falta de R.1), luego 3 (R.7, R.12, R.13, R.14, R.15, R.16, R.24) y la puerta.
