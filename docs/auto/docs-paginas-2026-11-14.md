# Informe de modo autónomo: plantilla de páginas (DP.0 y piloto), rama `auto/docs-paginas-2026-11-14`

14/11/2026. `node -v`: **v24.18.0**. `main` antes de crear la rama: `b313f0b Merge pull request #16 from nuki23/auto/release-0.6.0-2026-11-13` (igual que `origin/main` tras `git fetch`). `git config user.email`: la dirección noreply del autor. **No se subió la versión ni se publicó nada.** Un commit por paso.

## 1. Registro de la publicación de la 0.6.0

**Plan breve:** leer los datos de npm y de git (no de lo que dijo el usuario) y anotarlos en «Publicación de la 0.6.0 (registro)» de `docs/historial/plan-refinamiento-0.6.0.md`, con el mismo formato que el registro de la 0.5.0 (`docs/historial/plan-grupo-3.md`). Quitar el «por publicar» del índice.

- `npm view @mimi-ng/cli dist-tags time --json`: `latest: 0.6.0`; `0.6.0: 2026-11-14T23:00:38.716Z`.
- `npm view @mimi-ng/cli@0.6.0 dist.fileCount dist.unpackedSize dist.shasum`: 169 archivos, 1 161 273 bytes, `e1edce4e3c189038bcd3f0a89eebf6ed43ae8f5e`.
- `git log -1 --oneline v0.6.0`: `b313f0b Merge pull request #16 from nuki23/auto/release-0.6.0-2026-11-13`; `git rev-parse --short v0.6.0`: `3ed07b1` (etiqueta anotada); `git ls-remote --tags origin v0.6.0`: `3ed07b1f…  refs/tags/v0.6.0`.
- La release de GitHub y la prueba desde npm: dato del usuario (el encargo). No se consultó GitHub (`gh` no se usó).
- `docs/plan.md`: la sección del refinamiento y su bloque de «Terminado» dicen «publicada el 14/11/2026».
- `prettier --check` de los dos archivos: en verde. Sin código: no se corrieron build ni pruebas en este paso (van en los pasos 4 y 5).

## 2. Tarea M.25 registrada (sin hacerla): `main` del sitio

**Plan breve:** una tarea nueva en `docs/plan/mantenimiento.md` con el siguiente número libre (M.25), versión 0.7.0, con el dato del informe de la 0.6.0 (`main` 137,83 kB, aviso 140, error 145) y el punto (3) de la M.13 que quedó sin hacer (`cn()` en la cabecera trae `tailwind-merge`, 39 kB).

- `docs/plan/mantenimiento.md`: M.25 con origen, alcance propuesto (medir módulo por módulo contra la M.13; probar la cabecera sin `cn()`; diferir lo que se pueda del shell), criterios de hecho (5 kB de margen o una recomendación para el usuario, sin subir presupuestos) y «Bloquea: R.19 a R.23, como aviso».
- `docs/plan.md`: la línea en «Mantenimiento» y en el bloque de la 0.7.0; R.P7 depende también de M.25 (aquí y en `docs/plan/refinamiento/R-0.7.0.md`).
- No se midió ni se cambió nada del sitio.

## 3. Decisiones del usuario: PD-4 y PD-4c (14/11/2026)

**Plan breve:** registrar lo que eligió el usuario en el prompt (no son decisiones por defecto) donde estaba cada pregunta, quitarlas del índice de `docs/plan/decisiones.md` y anotarlas en `docs/auto/decisiones-por-defecto.md` con la base «Decidido por el usuario».

- PD-4: **variante A**. PD-4c: (1) componente común con configuración; (2) la prueba falla desde DP.0 con la lista de pendientes que solo encoge; (3) los textos de C.3 se aplican tal como están en `parte-c.md`; (4) cada excepción la aprueba el usuario. Todas coinciden con la recomendación.
- Archivos (paso 3): `docs/plan/decisiones.md` (sección (a): «Ninguna abierta», con la nota de la decisión), `docs/plan/docs-paginas/plan.md` (PD-4 y la Parte C), `docs/plan/docs-paginas/parte-c.md` (estado y PD-4c), `docs/plan/docs-paginas/ejemplos.md` (cabecera), `docs/plan.md` (sección de las páginas y la línea de DP.0), `docs/auto/decisiones-por-defecto.md` (sección nueva).

## 4. DP.0: piezas comunes, prueba, spec de la plantilla y textos de C.3

**Plan breve** (`docs/plan/docs-paginas/parte-c.md`, C.1 a C.3): (1) `apps/docs/src/app/doc-page/` con los tipos `DocPage`, las reglas (`validateDocPage`), el componente `<app-doc-page>`, `app-api-table`, `app-more`, «Qué instala» desde el registro y un texto con código en línea; (2) `doc-pages.spec.ts` con la lista `PENDING` (las 39 carpetas, ninguna migrada todavía) y la medida del bloque «Uso» de la R.24 para las pendientes, en lugar de `short-use-pages.spec.ts`; (3) `docs/spec/plantilla-pagina.md` con la variante A y el enlace desde la spec 10; (4) los textos de C.3 tal como están. Ninguna página cambia en este paso: el piloto es el paso 5.

**Hecho:**

- **`doc-page.types.ts`:** `DocPage`, `DocExample` (con `files` y un `more` opcional, el ejemplo de un desplegable), `ApiRow`, `OutputRow`, `PartRow`; las categorías en orden, los `id` y títulos fijos de las secciones; `DOC_PAGE_VARIANT = 'A'` y `DOC_PAGE_LIMITS` (los de la variante A).
- **`doc-page.rules.ts`:** `validateDocPage(page): string[]` comprueba lo que se puede sin el sistema de archivos: frase de cabecera (12–25 palabras), demo (60 líneas), plantilla de «Uso» (12 líneas, la medida de R.24) y su nota (20 palabras, 2 frases), cada ejemplo (id kebab-case y único, frase distinta del título y de 25 palabras, 80 líneas por archivo), 8 ejemplos vivos, `forms` si el componente está en `FORMS_SPECS`, 1 a 6 viñetas de accesibilidad, al menos una entrada, 20 palabras por descripción de la API, `tokens` si hay tabla en `component-tokens.ts`, 400 palabras de prosa y los nombres internos (`rodeo`, `@angular/aria`, `@angular/cdk`, `CDK`, «decidido por defecto»).
- **`<app-doc-page>`** (`doc-page.ts` y `.html`): pinta dentro de un `<article>` el h1, la frase, la demo, Instalación (comando y «Qué instala»), Uso, Ejemplos (en el orden de las categorías; «Formularios» con las pestañas de R.13), Accesibilidad y teclado (con `more` en un desplegable) y API (Entradas con la línea de `data-*`, Salidas, Piezas, Textos con el código del proveedor y Variables CSS). Cada ejemplo lleva su frase (`data-slot="example-sentence"`) delante de `CodePreview` y se pinta con `NgComponentOutlet`. En desarrollo escribe `[Mimi docs] <Nombre>: …` en la consola por cada error de `validateDocPage`.
- **`app-api-table`** (columnas fijas), **`app-more`** (`<details>` cerrado, con el chevrón que gira y respeta el movimiento reducido), **`app-install-extras`** («Qué instala»: los ítems, paquetes y CSS de la clausura de `registryDependencies` del registro de la CLI, sin lo que ya trae `ng add`; alias nuevo `@mimi-ng/cli/registry.json` en `tsconfig.base.json`, como el de `package.json`), **`app-doc-text`** (lo que va entre comillas invertidas se pinta como `<code>`, sin HTML).
- **CSS:** las clases de `doc-page/` van en `components.css` (`@source './app/doc-page'`) y no en el global (`@source not './app/doc-page'` en `styles.css`): solo las usan las páginas de componentes, que van dentro del `@scope (article, …)`.
- **Pruebas:** `doc-page/doc-pages.spec.ts` (la del sitio: cada carpeta migrada o en `PENDING`, `PENDING_COUNT = 39`, cada ítem del menú con su carpeta, R.24 para las pendientes y, para cada migrada, el `*-page.ts` de una línea, `validateDocPage`, «Textos» si hay `*-texts.ts`, el h1 igual al menú y el orden de h2 y h3 al pintarla, con cada ejemplo con su frase y corriendo) y `doc-page/doc-page.spec.ts` (las reglas una por una, `textParts`, `installExtras` contra el registro y el componente con una página de prueba). `code/short-use-pages.spec.ts` se borra (`git rm`): su medida sigue en la prueba nueva.
- **`docs/spec/plantilla-pagina.md`** (nuevo): cómo se impone, piezas, las 12 reglas comunes, los límites de la variante A, cómo se escribe una página y «Excepciones aprobadas» (ninguna). `docs/spec.md`, sección 10, lo enlaza.
- **Textos de C.3, tal como están en `parte-c.md`:** `CLAUDE.md` (la línea de «Forma de trabajar» y la regla 11 de Angular), `.claude/commands/componente.md` (el apartado 3, sin el punto de los encabezados con `id`; además, «Angular 1–10» pasa a «1–11» en la línea de reglas) y `.claude/commands/cerrar-grupo.md` (el punto «Páginas con la plantilla» en Comprobar y su fila en Entregar).
- `docs/plan/refinamiento/uso-corto.md`: la medida de la R.24 la vigila ahora la prueba nueva.
- **M.12:** `packages/ui-core/src/lib/block-loading.spec.ts` con 20 s por caso (ver «Criterios», abajo).
- `docs/plan.md`: DP.0 `[~]` y su fila en «En curso».

**Criterios (los de este paso):**

| Criterio                               | Evidencia                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pruebas nuevas en verde                | `pnpm ng test docs --include='**/doc-page/*.spec.ts'`: 2 archivos, **52 pruebas** en verde.                                                                                                                                                                                                                                                                                                         |
| `pnpm build`                           | En verde (docs y CLI). Sin avisos de presupuesto.                                                                                                                                                                                                                                                                                                                                                   |
| `pnpm test`                            | docs **274** en verde (75 archivos); CLI **202** en verde; ui-core: **falló 3 veces** el caso `table-01` de `block-loading.spec.ts` por tiempo («Test timed out in 5000ms»), y pasó aislado (7 de 7, 2,6 s) y una vez con el árbol limpio (`git stash -u`, 1061 de 1061). La prueba no toca nada de esta rama: es el patrón de la M.12. Con 20 s para el bloque, ui-core **1061 de 1061** en verde. |
| `pnpm format` y `pnpm format:check`    | En verde (abajo, antes del commit).                                                                                                                                                                                                                                                                                                                                                                 |
| La prueba falla desde DP.0 (PD-4c.2)   | `PENDING` con las 39 carpetas y `PENDING_COUNT = 39`; una carpeta nueva sin `.page.ts` y sin estar en la lista hace fallar «cada carpeta es una página migrada o está en la lista de pendientes».                                                                                                                                                                                                   |
| Textos de C.3 tal como están (PD-4c.3) | `git diff CLAUDE.md .claude/commands/`: los tres textos, copiados de `parte-c.md`.                                                                                                                                                                                                                                                                                                                  |

**Bundle** (`check-initial-js.mjs`; gzip de `main` y `components.css` con `gzip -9`):

| Qué              | Antes (crudo / gzip) | Después (crudo / gzip)                                  |
| ---------------- | -------------------- | ------------------------------------------------------- |
| JS inicial       | 334,89 / 106,23 kB   | 334,89 / 106,23 kB                                      |
| `main`           | 137,83 / 40,51 kB    | 137,83 / 40,51 kB (el mismo hash, `main-VOJBRZLJ.js`)   |
| CSS global       | 130,77 / 18,70 kB    | 130,77 / 18,70 kB                                       |
| `components.css` | 140,94 / 19,63 kB    | 141,25 / 19,70 kB (+0,31 kB: las clases de `doc-page/`) |

El JS de `doc-page/` no entra todavía en ningún chunk (ninguna página lo usa); se mide en el paso 5.
