# Refinamiento 0.6.0, tercera tanda (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 2](refinamiento-0.6.0-parte2-2026-11-09.md)

Alcance de esta tanda: (1) comprobar con un navegador sin ventana que el chevron y el spinner del Select abren el panel, (2) R.8, (3) R.12, (4) R.15 y M.9, (5) marcadores del plan. **No se repitió la puerta, no se subió la versión, no se publicó nada.** Node 24.18.0.

## 1. Select: clic en el chevron y en el spinner (Playwright)

El repo **no tiene Playwright ni una carpeta de pruebas de navegador**, y agregarlo sería una dependencia nueva que la spec no trae (CLAUDE.md, A7). Se instaló **fuera del repo** (`C:\t\pw`, `playwright-core`, usando el Chrome ya instalado, sin descargar navegadores) y la prueba **queda en este informe**, no en el repo. Las pruebas de ui-core siguen cubriendo la causa (`select-end-icon.spec.ts`: el sitio del icono lleva `pointer-events-none` y el botón de limpiar `pointer-events-auto`).

Resultado contra el build de producción servido en un servidor estático (clic real con el ratón en el centro del icono, `page.mouse.click`):

| Caso                                     | `data-icon` | `aria-expanded` antes | después  | `role=listbox` |
| ---------------------------------------- | ----------- | --------------------- | -------- | -------------- |
| Select normal, clic en el chevron        | `chevron`   | `false`               | **true** | 1              |
| Select con `loading`, clic en el spinner | `loading`   | `false`               | **true** | 1              |

Script (`C:\t\pw\select-click.mjs`, fuera del repo; el servidor estático es `static.mjs`, 20 líneas, con respaldo a `index.html`):

```js
import { chromium } from 'playwright-core';
const url = process.argv[2];
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
const results = [];
async function clickEndIcon(selectLocator, label) {
  const slot = selectLocator.locator('[data-slot="end-icon"]');
  await slot.scrollIntoViewIfNeeded();
  const trigger = selectLocator.locator('[role="combobox"]');
  const before = await trigger.getAttribute('aria-expanded');
  const box = await slot.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(400);
  const after = await trigger.getAttribute('aria-expanded');
  const panel = await page.locator('[role="listbox"]').count();
  results.push({
    caso: label,
    icono: await slot.getAttribute('data-icon'),
    antes: before,
    despues: after,
    listbox: panel,
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
}
const plain = page
  .locator('mimi-select')
  .filter({ has: page.locator('[data-slot="end-icon"][data-icon="chevron"]') })
  .first();
await clickEndIcon(plain, 'chevron');
const loading = page
  .locator('mimi-select')
  .filter({ has: page.locator('[data-slot="end-icon"][data-icon="loading"]') })
  .first();
if (await loading.count()) await clickEndIcon(loading, 'spinner');
else results.push({ caso: 'spinner', error: 'no hay un Select con loading en la página' });
console.log(JSON.stringify(results, null, 1));
await browser.close();
process.exit(results.every((r) => r.despues === 'true' && r.listbox > 0) ? 0 : 1);
```

## 2. R.8: tamaños por la escala del tema (hecha, menos Card)

Chip, Slider, Toolbar, Calendar, Menú (Menu, Dropdown Menu, Context Menu), Command, Tree, Sortable List, Data Table, Tooltip y Popover leen su alto, texto, ícono o ancho de **variables del tema por `[data-size]`** (`theme-base.css`, `sm`/`md`/`lg`, con respaldo al token de antes); ningún componente tiene clases por tamaño. `size` entra por `MimiSized` (host directive) o, donde el panel vive en un overlay, por un `data-size` en el panel:

- **Overlays:** Menu (`size` en `MimiMenuPanel`, que Dropdown y Context Menu rellenan con el suyo), Popover (`data-size` en el panel), Tooltip (`mimiTooltipSize`; por defecto el `[data-size]` más cercano al disparador), Command Dialog → Command y Date Picker / Date Range → Calendar (lo pasan por entrada).
- **Chip** no usa `MimiSized` sino su propia entrada `size` sin valor por defecto: así un chip dentro de un Combobox o Tags Input `sm` toma el tamaño del contenedor en vez de volver a `md` (el revisor señaló que `MimiSized` escribe siempre `data-size="md"`; ver «Alertas»).
- `MimiSized.resolved` pasa a ser público (lo leen los pickers).
- **Decidido por defecto (Data Table):** `density` se queda y `size` escala el alto de fila y de cabecera; `comfortable` conserva su alto fijo (60/44).
- Pruebas: `size-r8.spec.ts` (las 22 variables en los tres bloques; `data-size` de los nueve componentes; el chip sin `size` no escribe `data-size`), specs de clases al día, `registry.json` (`utils/size` en 12 ítems), catálogo de variables del sitio.

**CSS que añade cada uno** (solo las declaraciones de variables en el CSS global minificado, tres tamaños; medido con `varcost.mjs` sobre `styles-*.css`):

| Componente                     | Variables | Declaraciones |     Bytes |
| ------------------------------ | --------- | ------------: | --------: |
| Chip                           | 2         |             6 |       182 |
| Slider                         | 2         |             6 |       205 |
| Toolbar                        | 2         |             6 |       193 |
| Calendar                       | 2         |             6 |       157 |
| Menú (menu, dropdown, context) | 2         |             6 |       174 |
| Command                        | 3         |             9 |       353 |
| Tree                           | 2         |             6 |       204 |
| Sortable List                  | 2         |             6 |       229 |
| Data Table                     | 2         |             6 |       214 |
| Tooltip                        | 2         |             6 |       186 |
| Popover                        | 1         |             3 |        72 |
| **Total variables**            | 22        |            66 | **2 169** |

El crecimiento total medido en el CSS global fue de **+3,69 kB** (176,58 → 180,27 kB crudo; el aviso es 180). La diferencia con los 2,17 kB de variables (≈1,5 kB) son las clases más largas (`h-[var(--mimi-x-h,var(--mimi-x,26px))]`) en el CSS de las utilidades. **No se midió por componente** porque se cambiaron los once juntos (un build por componente era repetir 11 veces el mismo coste); el desglose de arriba es exacto solo para las variables.

Pasó de 178 kB, así que se hizo el mantenimiento pedido (sección 3). **No se subió ningún presupuesto.**

## 3. M.23: las páginas de componentes en su propia hoja (hecha)

`apps/docs/src/components.css` (como `blocks.css`: `inject: false`, `bundleName: components`, en `angular.json` de desarrollo y producción) lleva las clases de `pages/docs/components/**` y de los componentes de ui-core que **solo** usan esas páginas. El CSS global (`styles.css`) los excluye con `@source not`: quedan en el global los componentes que usa el resto del sitio (avatar, badge, button, card, checkbox, confirm, dialog, form-field, input, option-list, popover, select, switch, tabs, toast, toggle-group). Sin dependencias nuevas.

**La trampa y cómo se evitó.** Con dos hojas de Tailwind, el orden de las utilidades es por hoja, no entre hojas: la primera prueba rompió el menú lateral (la `.hidden` de `components.css`, que va después, ganaba a `.lg:block` del global). Se resolvió con **`@scope (article, .cdk-overlay-container)`** alrededor de las utilidades de `components.css`: solo valen dentro del artículo de una página de componentes y en los overlays (los paneles del Tooltip, menús, Combobox… los monta el CDK fuera del artículo). La cabecera y el menú quedan fuera y no las ve.

**Cómo se carga:** `canActivateChild` en la ruta `docs` (`core/components-styles.ts`): al entrar en `/docs/components/…` por primera vez pone el `<link>` y **espera a que cargue** (tope de 3 s, `COMPONENTS_STYLES_WAIT_MS`; si falla o tarda, la página se pinta igual) para que no haya un parpadeo sin estilos. El resto de `/docs` no la pide. 3 pruebas en `components-styles.spec.ts`.

| Medida                         | Antes (todo junto) | Después                                                   |
| ------------------------------ | ------------------ | --------------------------------------------------------- |
| CSS global, crudo              | 180,27 kB          | **111,41 kB**                                             |
| CSS global, gzip               | 26,37 kB           | **17,11 kB** (brotli 13,92)                               |
| `components.css`, crudo / gzip | —                  | 131,15 kB / 19,11 kB (solo en `/docs/components/…`)       |
| JS inicial, crudo / gzip       | 334,0 / 105,8 kB   | 334,46 / 106,02 kB (el guardián entra en `main`, +0,5 kB) |

**Coste honesto:** en una página de componentes se descargan ahora **36,2 kB gzip de CSS (17,11 + 19,11)** en vez de 26,4: **+9,8 kB gzip** a cambio de que el resto del sitio (inicio, Introducción, Instalación, Tema, Blocks) baje **−9,3 kB gzip**. La hoja repite utilidades comunes porque Tailwind no deduplica entre hojas.

**Cómo se comprobó que no cambió nada visible** (Playwright, fuera del repo, `compare.mjs`): se construyó una versión de referencia (todo en el CSS global, sin las exclusiones) y se compararon capturas de **página completa**, sin animaciones, de **45 rutas** (inicio, Introducción, Instalación, Fundamentos, Tema y las 40 páginas de componentes): **44 idénticas byte a byte**; `/docs/components/switch` difiere en **1 byte** de PNG (la misma página en dos cargas seguidas; sin diferencia visible). Además, con **overlays abiertos** (`overlays.mjs`: Dropdown Menu, Combobox, Date Picker, Date Range, Tooltip al pasar el ratón, Context Menu, Command, Pagination, Tags Input) las 9 capturas son idénticas a la referencia, y los selectores de clase del CSS de antes están todos en el global + `components.css` (709 de 709).

**Sin comprobar:** el modo oscuro, ni los estados de foco o el teclado. **Compatibilidad:** `@scope` lo trae Chrome 118, Safari 17.4 y Firefox 128; en un navegador anterior la hoja de las páginas de componentes no aplicaría sus utilidades (el resto del sitio, sí). Es una decisión que te toca: el sitio solo.

## 4. R.12: `readonly` en Slider, Color Picker, File Upload, Toggle Group y Password (hecha)

Mismo comportamiento que los demás: el valor se ve y se enfoca, **no se puede cambiar**. `readonly-controls-2.spec.ts` (6 pruebas):

- **Slider:** las flechas y el puntero no mueven el pulgar; `aria-readonly` en el pulgar.
- **Color Picker** (panel): área, tono, paleta y campo hex no cambian el color; `aria-readonly` en área y tono; el campo hex es `readOnly`. **Color Input** (disparador con Popover): el panel no se abre (`blocked`) y `aria-readonly` en el botón.
- **File Upload:** no abre el selector ni acepta archivos soltados. **Decisión por defecto:** la zona es un `<button>` (no admite `aria-readonly`), así que queda enfocable con `aria-disabled="true"`.
- **Toggle Group:** el clic no cambia el valor; las flechas mueven el foco sin elegir; `aria-readonly` en el modo simple (en el múltiple solo `data-readonly`).
- **Password:** deja el `<input>` de dentro `readOnly`; el ojo sigue funcionando (mostrar no cambia el valor).
- Cada uno con su **ejemplo «Solo lectura»**, la fila de API y (en las páginas) el recuento de ejemplos al día. Todos ponen `data-readonly`.

**No hecho de R.12:** el aspecto de solo lectura (fondo propio, `--mimi-input-readonly-bg`), los ejemplos de los seis componentes de la tanda anterior, y revisar Number Input, Input Mask, Tags Input e Input OTP.

## 5. R.15: ejemplo con `<mimi-option>`, y M.9 en parte

- Ejemplos `select-declarative.example.ts` y `combobox-declarative.example.ts` (con grupos, `hint`, `disabled` y `clearable`) y su sección en las dos páginas.
- **M.9 en parte:** `normalize()` de Select se cambió por `mimiNormalizeText` de option-list, y `MimiSelectHighlight` **hereda** de `MimiHighlight` (misma lógica; solo conserva su selector y su plantilla). **No se hizo** cambiar `MimiSelectList` por `MimiOptionList`: tiene otras entradas (`selectedKeys` en lista, `multi`, textos por entrada) y el rodeo de aria `resync` de la G1.5b; es el trozo grande y arriesgado de M.9, y queda en `[~]`.

## 6. Marcadores del plan

`docs/plan.md`, `docs/plan/refinamiento/R-0.6.0.md` y `docs/plan/mantenimiento.md` al día: **[x]** R.2, R.3, R.4, R.16, M.23; **[~]** R.1 (falta la página «Tamaños»), R.7 (Confirm con `size`), R.8 (Card, a R.19; ejemplos y página «Tamaños»), R.12, R.14 (más ejemplos y diagrama), R.15, R.24, M.9. R.13 sigue `[ ]`; R.0 espera el logo.

## 7. Verificación

`pnpm build` en verde (sin avisos de presupuesto); `pnpm ng test ui-core` 986, `pnpm ng test docs` 199, `pnpm test:cli` 202, todo en verde; `pnpm format:check` en verde.

## Alertas para el revisor y el usuario

1. **`@scope` en `components.css`** (arriba): decide si el sitio puede exigir Firefox ≥ 128.
2. **`MimiSized` siempre escribe `data-size`** (`md` si no hay `size` ni `mimiSize`): un control con `MimiSized` dentro de un contenedor con `[data-size]` que no sea `mimiSize` vuelve a `md`. Ya se corrigió en Pagination (tanda anterior) y en Chip (aquí); queda en select, checkbox, switch, tabs, date-picker, date-range, combobox, textarea y badge. No se cambió: afectaría a las pruebas de `data-size="md"`.
3. **Tooltip:** `mimiTooltipSize`; sin él toma el `[data-size]` más cercano **al abrirse**. No probado con un formulario `mimiSize` real.
4. **Menu:** el `size` llega a `MimiMenuPanel`; los submenús lo heredan por el DOM (van dentro del panel). Sin prueba de navegador.
5. **R.8 sin ejemplos ni página «Tamaños»** por componente: no se pidieron en esta tanda y no se hicieron.
6. **Archivo ajeno en `apps/docs/public`:** `dist/docs/browser` trae un `Imagen de ChatGPT 9 nov 2026, 05_44_14 p.m-1.png` que **no es de esta sesión** (probablemente un candidato de logo para R.0); no se tocó.

## Limpieza

Los servidores estáticos y el de desarrollo (puertos 4262 a 4266) se lanzaron con `timeout`; se comprueba con `netstat` al terminar. `C:\t\pw` (Playwright, capturas, copias de `dist`) queda **fuera del repo** y se borra al terminar.
