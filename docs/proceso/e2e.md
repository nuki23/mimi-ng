# Pruebas de extremo a extremo (Playwright) y CI

Desde la 0.9.0 (tanda 1, M.15, M.18 y 1.0-5). Lo vigente de la arquitectura está en la spec 10, «Pruebas de extremo a extremo y CI».

## Correrlas en tu equipo

```bash
pnpm install
pnpm exec playwright install chromium firefox webkit   # una vez: los navegadores de Playwright
pnpm build:docs                                         # el sitio compilado, en dist/docs/browser
pnpm e2e                                                # los cinco proyectos
pnpm e2e --project=android                              # uno solo
pnpm e2e apps/docs/e2e/axe.spec.ts --project=chromium   # un archivo
pnpm e2e:report                                         # el informe HTML de la última corrida
```

`pnpm e2e` levanta su propio servidor (`apps/docs/e2e/serve.mjs`, puerto 4310; `MIMI_E2E_PORT` lo cambia) y lo cierra al terminar. Si el puerto ya está ocupado por un servidor tuyo del mismo sitio, lo reutiliza (fuera de la CI).

Lo que dejan (resultados, capturas y trazas de un fallo, el informe y la auditoría) va a `tmp/e2e/`, que no entra en git. Las capturas de una comprobación a mano van fuera del repo (`C:\t\capturas\<fecha>\`, CLAUDE.md, A10).

## Proyectos

| Proyecto   | Motor    | Ventana                       |
| ---------- | -------- | ----------------------------- |
| `chromium` | Chromium | 1280 × 900                    |
| `firefox`  | Firefox  | 1280 × 900                    |
| `webkit`   | WebKit   | 1280 × 900                    |
| `android`  | Chromium | 360 × 780, táctil (Pixel 7)   |
| `iphone`   | WebKit   | 360 × 780, táctil (iPhone 13) |

## Qué prueba cada archivo

- `pages.spec.ts`: cada página del menú (y la portada) abre sin errores en la consola ni scroll lateral; la 404.
- `axe.spec.ts` (Chromium y Android): axe-core en cada página, en claro y en oscuro, con WCAG 2.0 a 2.2 A y AA. Las reglas desactivadas están en `axe.ts`, cada una con su motivo; el contraste no mira lo que tiene `data-disabled` (texto de un componente inactivo, exento por el 1.4.3).
- `panels.spec.ts`: Select, Combobox, Date Picker, Date Range, Color Picker, Dropdown Menu, Popover, Dialog y Sheet abiertos desde la demo con el teclado: en el teléfono, la hoja inferior o la pantalla completa con su X de 40 px como mínimo; axe con el panel abierto; Escape lo cierra y el foco vuelve al disparador.
- `layout.spec.ts`: las líneas del Stepper (de círculo a círculo, mismo hueco), el Sheet (la página no se mueve ni se desplaza, el mismo margen, al cerrar nada salta) y, en los teléfonos, los estados de los Blocks que caben en su botón.
- `audit.spec.ts` (los teléfonos; M.18): la auditoría a 360 px de cada página con `audit.ts`. Falla si algo se sale de la pantalla a lo ancho; los controles de menos de 24 px y de menos de 44 px se guardan en `tmp/e2e/audit/<proyecto>/<página>.json` (y en el adjunto de cada prueba) para revisarlos.

## Reglas

- Sin tiempos fijos: se espera una condición (`expect(...).toBeVisible()`, `expect.poll`). Sin reintentos, tampoco en la CI: una prueba inestable tiene que verse.
- Sin recursos externos: `fixtures.ts` corta toda petición fuera del sitio (las fuentes de Google caen a la de respaldo) y fija la fecha (`FIXED_NOW`).
- Lo que falle solo en Firefox o WebKit: se arregla con su prueba si es de Mimi; si es del navegador, se deja escrito en la prueba y en el informe, sin desactivarla en silencio.

## La CI

`.github/workflows/ci.yml`, en cada PR, en cada push a `main` y en cada push a una rama `auto/…` **sin PR abierto** (una sola corrida por commit; tanda 2 de la 0.9.0):

0. **¿Corre la CI?**: en un push a `auto/…`, busca un PR abierto de esa rama (`gh pr list`, con permiso de solo lectura); si lo hay, el resto no corre (lo corre el evento del PR). Los trabajos de esos push llevan « · rama» en el nombre, para que un trabajo saltado no tenga el nombre de un check que exige `main`. Al abrir el PR, el evento del PR vuelve a correr el último commit (una vez).
1. **Formato y build**: `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm build` (con los presupuestos de `check-initial-js.mjs`); sube el sitio como artefacto.
2. **Pruebas**: `pnpm test` (docs, ui-core y la CLI), en paralelo con el build.
3. **Playwright**: un trabajo por proyecto, con el sitio del paso 1 y su navegador instalado por Playwright. Si falla, el artefacto `playwright-<proyecto>` trae el informe, las capturas y las trazas.

Lo que hace el usuario en GitHub (el agente no puede): en **Settings → Branches**, una regla para `main` que exija los checks «Formato y build», «Pruebas (docs, ui-core y CLI)» y los cinco «Playwright (…)» antes de fusionar (hecho por el usuario el 26/11/2026). **No se cambian esos nombres** sin avisar al usuario: la regla dejaría de reconocerlos.

Las acciones van en sus versiones con Node 24 (`actions/checkout@v6`, `actions/setup-node@v6`, `pnpm/action-setup@v6`, `actions/upload-artifact@v7`, `actions/download-artifact@v7`): con las v4, GitHub avisaba en cada trabajo que Node 20 está obsoleto.
