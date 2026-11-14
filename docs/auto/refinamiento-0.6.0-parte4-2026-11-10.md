# Refinamiento 0.6.0, cuarta tanda (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 3](refinamiento-0.6.0-parte3-2026-11-09.md)

Alcance (prompt del 10/11/2026): decisiones del usuario, `MimiSized` sin `data-size` propio, comparación de capturas en oscuro, R.13, R.24 completa y la página «Tamaños», y la puerta de la 0.6.0 con el CHANGELOG «por publicar». **No se subió la versión ni se publicó nada.** Node 24.18.0.

## Decisiones del usuario (10/11/2026), registradas

En `docs/auto/decisiones-por-defecto.md`: (1) el sitio puede exigir `@scope`, anotado en la página de **Instalación** como requisito del sitio, no de la librería (con prueba); (2) Data Table conserva `density` y `size`, cada uno documentado en la página «Tamaños» y el solape va a la lista de nombres de la 0.9.9; (3) M.9 queda como tarea propia; (4) `MimiSized` no escribe `data-size` sin `size` propio.

## 1. `MimiSized` sin `data-size` propio

- `MimiSized` (Select, Checkbox, Switch, Tabs, Date Picker, Date Range, Combobox, Textarea, Badge, Chip, Slider, Toolbar, Calendar, Command, Tree, Sortable List, Data Table, Popover, Dropdown y Context Menu…) y **Button, Input y Avatar** escriben `data-size` **solo con `size` propio** (Button también `icon`). El `md` vive en el tema (`:root`) y cada control hereda por la cascada el `[data-size]` más cercano.
- **Overlays:** `MimiSized.effective()` (propio, `mimiSize` o el `[data-size]` más cercano del DOM) alimenta lo que se pinta fuera del anfitrión: panel del Popover, menús, Command Dialog, Calendar de los pickers.
- **Parches quitados:** Pagination ya no pasa su `size` al Select del «por página» (hereda de su anfitrión) y Chip pasó de entrada propia a `MimiSized`.
- Pruebas: `size-inherit.spec.ts` (Select, Checkbox, Switch, Tabs, Date Picker, Textarea, Badge, Chip, Button, Input, Avatar dentro de un `<form data-size="sm">`: sin atributo y con `closest('[data-size]')` = `sm`; el propio gana; el panel del Popover lleva el tamaño del contenedor), y `size.spec`, `size-controls.spec` y `page-size-scale.spec` al día.
- **En un proyecto real** (escenario 1, `<form mimiSize="sm">`, Playwright): Input, Select, Combobox y Button miden **32 px** (sm). El Combobox múltiple medía 40 por un alto fijo del campo (`h-7`) y el icono final; se arregló (ver «Revisor»).
- **Tokens de medida sobrescritos en un contenedor:** ver «Revisor», punto 4.

## 2. Separación del CSS: comparación en OSCURO

Mismo método que en claro (versión de referencia con todo en el CSS global frente a la separada; capturas de página completa sin animaciones, `localStorage` en `dark`, tema verificado en cada ruta): **43 rutas** (inicio, Introducción, Instalación, Fundamentos, Tema y 38 de componentes; en el informe anterior dije 45: eran 43). **42 idénticas; Avatar difirió una vez y repetido tres veces salió idéntico** (la carga de las imágenes). **Overlays abiertos en oscuro:** Dropdown Menu, Combobox, Date Picker, Date Range, Tooltip, Context Menu, Command, Pagination, Tags Input, Select y Popover: **11 de 11 idénticos**. (Revisé a ojo la captura del Date Picker en oscuro: el panel abierto se ve completo.) Pendiente de la comparación: foco, teclado.

## 3. R.13: pestañas Signal Forms / Reactive / Plantilla (hecha, solo código)

`apps/docs/src/app/code/forms-snippets.ts` describe **una vez** cada componente (etiqueta, campo, valor inicial, tipo, imports y el control con `{{attrs}}`) y genera los tres fragmentos; `FormsTabs` (`<app-forms-tabs component="select" />`) los pinta en pestañas con `mimi-tabs` y `app-code-block`. **17 páginas:** Input, Select, Combobox, Number Input, Password, Input Mask, Tags Input, Input OTP, Date Picker, Date Range, Color Picker, File Upload, Switch, Checkbox, Toggle Group, Slider y Tree. Los cambios de las páginas (import e `imports`) son la misma edición en 17 archivos: se hicieron con un script (texto abajo). Pruebas (`forms-tabs.spec.ts`, 4): cada fragmento lleva su `[formField]` / `formControlName` / `[(ngModel)]`, su import y su etiqueta; cada clave es una página que existe; tres pestañas; una clave desconocida falla con un mensaje claro. **Límite honesto:** son fragmentos de código, **no ejemplos en vivo**, y no se compilan (las páginas ya tienen ejemplos en vivo de los tres formularios en varios componentes); revisados contra las APIs, no ejecutados.

Script (fuera del repo; `git diff --stat` de las 17 páginas: **34 inserciones antes y después de Prettier**, 17 archivos):

```js
import fs from 'node:fs';
const root = 'C:/dev/mimi-ng/apps/docs/src/app/pages/docs/components/';
const pages = [
  'input',
  'select',
  'combobox',
  'number-input',
  'password',
  'input-mask',
  'tags-input',
  'input-otp',
  'date-picker',
  'date-range',
  'color-picker',
  'file-upload',
  'switch',
  'checkbox',
  'toggle-group',
  'slider',
  'tree',
];
const A = "import { CodeBlock } from '../../../../code/code-block';\n";
const A2 = A + "import { FormsTabs } from '../../../../code/forms-tabs';\n";
const B = '\n    CodeBlock,\n';
const B2 = B + '    FormsTabs,\n';
const edits = [];
for (const p of pages) {
  const file = `${root}${p}/${p}-page.ts`;
  const text = fs.readFileSync(file, 'utf8');
  const count = (s) => text.split(s).length - 1;
  if (count(A) !== 1 || count(B) !== 1 || text.includes('FormsTabs'))
    throw new Error(`${file}: no tiene exactamente lo esperado`);
  edits.push([file, text.replace(A, A2).replace(B, B2)]);
}
for (const [file, out] of edits) fs.writeFileSync(file, out);
```

(Las secciones HTML de las 17 páginas se agregaron con la herramienta de archivos, una por una.)

## 4. R.24 completa y la página «Tamaños»

- **R.24:** `docs/plan/refinamiento/uso-corto.md` con la **tabla de las 38 páginas** (líneas de plantilla del bloque «Uso» y del primer ejemplo), medida con un script de solo lectura. El criterio (≤ 12 líneas en el uso) **se cumple en las 36 páginas con plantilla** (Toast y Confirm usan un servicio); Dialog en plantilla (14) es la única excepción, justificada. `short-use-pages.spec.ts` lo vigila (37 pruebas). Los primeros ejemplos largos (Data Table 88, Input Mask 61, Command 55, Tree 42…) son mostradores de variantes: no se tocan.
- **«Tamaños»** (`/docs/sizes`, en la sidebar tras «Tema»): cómo se pide (en un control, `mimiSize`, `data-size`), demostración en vivo en los tres tamaños, la escala (`--mimi-size-*` por tamaño) y **qué cambia en cada componente** (22 filas). `sizes-page.spec.ts` compara la escala mostrada con `theme-base.css` (si el tema cambia y la página no, falla). Va en el CSS global (111,41 → 111,56 kB, +0,15 kB).

## 5. Puerta de la 0.6.0 (R.P6)

**Revisor independiente** (solo lectura, `18b5fea..HEAD`, todo lo hecho desde la última puerta): sin faltantes de `registry.json` (comprobó con un script cada import y peer), `size.ts`, `busy.ts`, `option-list` y Dialog sin fallos. **Cuatro hallazgos** (los tres primeros confirmados por lectura), con prueba que fallaba antes (`gate-review-fixes.spec.ts`, 5):

1. **Combobox `readonly`:** los chips se podían quitar con su X, Backspace borraba el último y Escape vaciaba el valor. Corregido en las tres vías.
2. **Password `readonly`:** no se podía quitar (`readOnly` se quedaba en `true`). Ahora el componente recuerda si lo puso él y lo devuelve; un `readonly` escrito por el usuario se respeta.
3. **Form Field:** los ids de `description` y `hint` quedaban en `aria-describedby` al desaparecer. Ahora se quitan.
4. **Tokens de medida sobrescritos en un contenedor** (`.dense { --mimi-btn-height: 2rem }`): las derivadas (`--mimi-btn-h`…) se resuelven en `:root`, así que el cambio local no llega a los controles de dentro sin un `data-size` en el contenedor. **No se cambió**: es consecuencia de poner la escala en el tema; queda en el CHANGELOG («Rupturas») y como decisión tuya (si la regresión importa, se puede leer el token directo con prioridad, pero rompe el reparto por tamaño).
   - Menores sin corregir: `effective()` lee el DOM en una plantilla OnPush (un cambio de `data-size` de un ancestro en ejecución no actualiza un panel abierto); sincronía del estado interno de `ngCombobox` con `readonly` (no confirmado); duplicado de `value` de un `<mimi-tab>` explícito contra uno generado.
   - Además, mi propia medición en el proyecto real mostró el **Combobox múltiple a 40 px en `sm`** (campo `h-7` fijo + icono final): el campo sigue ahora al chip y la caja baja el relleno en `sm`; medido **32 px**.

**Escenarios con el `.tgz`** (versión temporal `0.6.0-dev.0` en una **copia** de `packages/cli`, repaquetada tras los arreglos: **167 archivos, 291,9 kB, 0 `.spec.`, 0 `testing`, sin rutas personales ni correos**; Node 24.18.0, npm 11.16.0, pnpm 12.5.1; Tailwind 4.3.3 fijado en los proyectos de prueba por el binario que Windows bloquea):

| #     | Escenario                                                                                                                                                                   | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | npm, proyecto nuevo: `ng add` y `ng g mimi` de 24 piezas (Blocks, Select, Combobox, Slider, Toolbar, Calendar, Command, Tree, Sortable List, Data Table, Tooltip, Popover…) | páginas en `src/app/pages/{login,settings,table}` y `pricing-01` en `src/app/blocks`; `ng build` en verde (CSS 166 kB, solo el presupuesto por defecto de Angular avisa al importar todo en el inicial); `<form mimiSize="sm">` con Input, Select, Combobox múltiple, Slider y Button: **32 / 32 / 32 / 32 px** en el navegador sin ventana. («chip» no es instalable: `ng g mimi chip` responde que no es un componente; viene con Combobox y Tags Input.)                                                                                      |
| 2     | pnpm, proyecto nuevo (Button, Select, Combobox, Login, Tabla, Slider, Tooltip, Dropdown Menu)                                                                               | `ng build` en verde, CSS de 119,6 kB.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 3 + 4 | Actualización desde la **0.5.0 real de npm**, con `button.ts` y la página `settings.ts` modificados                                                                         | se agregan `utils/size`, `utils/busy`, `theme/neutral.ts` y `option-list`; se actualizan `input`, `select`, `chip`, `combobox`, `checkbox`, `form-field`, `password`, `avatar`, `badge`, `progress`, `switch`, `tabs`, `textarea`, `menu`, `dropdown-menu`, `popover` y `theme`; **`button` queda bloqueado con su aviso** y, por el todo o nada, `toast` y `login-01`; `settings-01` (página modificada) bloqueada con su aviso; `ng build` en verde; con `--overwrite` se actualizan `button`, `toast` y `login-01` y el build sigue en verde. |
| 5     | `source(none)` desde la 0.5.0 real                                                                                                                                          | `ng add` agrega `@source "./app/components/ui"`, `./app/blocks` y `./app/pages`; con la CLI nueva no se duplican; `ng build` en verde y el CSS trae las clases de la página (`400px`).                                                                                                                                                                                                                                                                                                                                                           |

**Nota de método:** el `.tgz` de prueba lleva siempre `0.6.0-dev.0`; reinstalarlo en un proyecto que ya lo tenía no regenera nada (la CLI lo ve «al día»): para probar un arreglo en un proyecto ya generado hay que usar `--overwrite`.

**Verificación final:** `pnpm build` en verde (JS inicial 334,87 kB crudo / 106,23 gzip; CSS global **111,56 kB crudo / 17,13 gzip**; `components.css` 131,3 / 19,2 kB solo en `/docs/components/…`); `pnpm ng test ui-core` **994**, `pnpm ng test docs` **243**, `pnpm test:cli` **202**, todo en verde; `pnpm format:check` en verde.

## CHANGELOG y marcadores

- **`CHANGELOG.md`:** sección «0.6.0 (por publicar)» (borrador; la versión y la fecha las pone quien publica) con **todas las rupturas** —tema por defecto violeta, `default` → `md` (y `data-size="default"`), sin `data-size` propio, Toast `outline` de color, Blocks inertes, `separatorAfter`, Select instala `option-list`, `clear` del Combobox opcional, tokens de medida en contenedores, Dialog `padding` y Data Table `size`— y «No incluido».
- **Plan:** `[x]` R.13 y R.24 (esta tanda), además de R.2, R.3, R.4, R.16 y M.23 (la anterior); `[~]` R.1 (falta la tabla de la escala en la spec), R.7, R.8, R.12, R.14, R.15 y R.P6 (a falta del logo de R.0 y de la comprobación manual).

## Pendiente del usuario / alertas

1. **Revisión manual:** lector de pantalla con un Block inerte, aspecto de Toast `outline` y de los tamaños, curva del violeta, foco y teclado con la hoja separada del sitio.
2. **Decisión (hallazgo 4):** tokens de medida sobrescritos en un contenedor sin `data-size`.
3. **R.13 son fragmentos de código, no ejemplos en vivo** (arriba).
4. `@scope`: requisito del sitio (Firefox ≥ 128), ya anotado en Instalación.
5. R.0 sigue esperando el logo (hay un PNG sin tocar en `apps/docs/public`).
6. No hecho: aspecto `data-readonly` y ejemplos de solo lectura de los seis primeros controles; M.9 completa; tabla de la escala en la spec; ejemplos de `size` por componente.

## Limpieza

Servidores estáticos y de desarrollo (puertos 4262 a 4272) lanzados con `timeout` y matados por PID; `C:\t\q60`, `C:\t\r060` y `C:\t\pw` borrados (no se tocaron las carpetas de `C:\t` que ya estaban).
