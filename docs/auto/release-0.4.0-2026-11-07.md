# Informe de modo autónomo: preparación de la 0.4.0, rama `auto/release-0.4.0-2026-11-07`

07/11/2026. `node -v`: **v24.18.0**. Rama creada desde `main` en `8f9424d` (la fusión del PR #8, los Blocks; comprobado antes de crearla, con `docs/historial/blocks/` presente), sin upstream hacia `main`. Un primer intento se detuvo porque `main` estaba en `2814fac`, sin los Blocks. `git config user.email`: la dirección noreply del autor. **No se publicó, no se hizo etiqueta ni release.**

## 1. Versión 0.4.0

Búsqueda de `0.3.0` en el repo (sin `CHANGELOG.md`, `docs/historial/`, `docs/auto/` ni `pnpm-lock.yaml`). **Cambiadas (la versión actual):**

- `packages/cli/package.json`: `"version": "0.4.0"` (la única fuente: el build la escribe en `dist/registry.json` y el sitio la lee para el badge).
- `apps/docs/src/app/pages/docs/installation-page.ts:87`: el `mimi.json` de ejemplo, `"button": { "version": "0.4.0" }`.
- `apps/docs/src/app/pages/docs/installation-page.html:189`: el ejemplo «button actualizado de 0.3.0 a 0.4.0».

**Sin cambiar (históricas o que nombran la versión anterior a propósito):** `installation-page.html:156` y `packages/cli/README.md:40` («instalaste con la 0.3.0 o una anterior»); `docs/plan.md` (M.4 «v0.3.0», M.20, «Grupo 2, v0.3.0», el historial); `docs/plan/decisiones.md:26`; `docs/plan/mantenimiento.md` (M.4, M.9, M.19, M.20); `docs/proceso/release.md:5` (el ejemplo; se actualizó en el paso 7); `docs/spec.md` (Grupo 2 (0.3.0), Select, #33974, 6b, pasos de la CLI, M.4, G1, M.19, tokens del Grupo 2, Progress); pruebas y comentarios de la CLI («proyecto de la 0.3.0»: `blocks.spec.ts`, `ui.spec.ts`, `ui/index.ts`, `utils/project.ts`); comentarios de ui-core (Date Picker, option-list, Progress, `group2-tokens.spec.ts`, `theme-base.css`: «tema anterior a la 0.3.0»).

Observación sin cambiar (no es de versión): el `mimi.json` de ejemplo de la página de Instalación no muestra `aliases.blocks`, que `ng add` escribe desde la 0.4.0.

Commit: `chore(release): versión 0.4.0`.

## 2. CHANGELOG

Título: `## 0.4.0 (07/11/2026): pantallas`. Incluye la nota de la **M.19** («Antes de actualizar», `@source not "../.mimi";`, también en «CLI» y en «Cómo actualizar desde la 0.3.0») y la de **Tabs** («Cambios en componentes publicados»: un `style="flex-direction: …"` estático en `<mimi-tabs>` ya no gana). Commit: `docs(changelog): fecha de la 0.4.0`.

## 3. Documentación de los Blocks

Sin cambios de código. En la plantilla de la página de cada Block (`BlockDoc`, sección «Instalación») y en el CHANGELOG («Blocks»): un Block es un componente Angular tuyo desde que se copia (los componentes de Mimi tienen una API estable; un Block es un punto de partida y sus entradas y salidas pueden cambiar); `aliases.blocks` de `mimi.json` se puede cambiar (por ejemplo, a `src/app/pages`), antes de agregar el Block y con una ruta relativa; la CLI no toca las rutas, se registran en `app.routes.ts`. `block-pages.spec.ts` comprueba las tres notas en las seis páginas (12 en verde). Commit: `docs(blocks): un Block es tuyo, aliases.blocks se puede cambiar y la CLI no toca las rutas`.

## 4. Build, pruebas y formato

- `pnpm build`: en verde, sin avisos de presupuesto.
- `pnpm test`: **docs 183, ui-core 838, CLI 159**, todas en verde.
- `pnpm format:check`: en verde.

| Medida                | Crudo     | gzip   | Aviso  | Error  |
| --------------------- | --------- | ------ | ------ | ------ |
| JS inicial            | 331,50 kB | 105,71 | 345 kB | 360 kB |
| CSS global (`styles`) | 154,22 kB | 22,15  | 160 kB | 175 kB |
| `main`                | 135,97 kB | —      | 140 kB | 145 kB |
| `initial` (JS + CSS)  | 485,72 kB | —      | 505 kB | 535 kB |
| `blocks.css`          | 27,26 kB  | 5,22   | —      | —      |

`blocks.css` no tiene presupuesto: es la hoja de la vista previa de los Blocks (`inject: false`), fuera del inicial. Nada cerca de un error.

## 5. `npm pack --dry-run` (`packages/cli`)

`@mimi-ng/cli@0.4.0`: **149 archivos**, 232,9 kB empaquetado, 889,2 kB sin empaquetar. Entran: `package.json`, `README.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md` y `dist/` (`collection.json`, `registry.js`, `registry.json`, `init/` 5, `ng-add/` 2, `ui/` 2, `utils/` 3, y las plantillas: `components/` 104, `blocks/` 18 (los seis Blocks, tres archivos cada uno), `theme/` 4, `utils/` 4). **Sin pruebas** (ningún `.spec.`) **ni `testing/`** (`tsconfig` los excluye). En el `.tgz` real (empaquetado en el directorio temporal y borrado después), la búsqueda de rutas absolutas y datos personales (`C:\`, `/Users/`, `/home/`, el nombre de usuario de la máquina, correos, `mimi-ng-respaldo`, `.bundle`) solo encontró el ejemplo `C:\x` de un comentario (`dist/init/paths.js`, el de la M2) y el `author` publicado, «Ariel O (https://github.com/nuki23)», sin correo.

## 6. M.12

Anotado en `docs/plan/mantenimiento.md`, M.12: la prueba de «M1» de `blocks.spec.ts` también necesitó 20 s bajo carga. Commit: `docs(plan): M.12, la prueba de M1 de la CLI también necesitó 20 s bajo carga`.

## 7. `docs/proceso/release.md`

Lo que cambió respecto a la 0.3.0: los ejemplos de versión (0.4.0 y 0.3.0); la puerta de la 0.4.0 es `B.P`; los escenarios de prueba suman los Blocks (agregar `login-01` y `settings-01` y registrarlos en las rutas; `aliases.blocks` en un proyecto anterior) y un 5.º escenario con `source(none)`; el registro de la publicación de la 0.4.0 va en `docs/historial/plan-blocks.md`. Commit: `docs(proceso): checklist de release con los escenarios de Blocks y source(none) (0.4.0)`.

## Pendiente del usuario

1. Revisar y fusionar esta rama.
2. Publicar según `docs/proceso/release.md`: `npm publish` desde `packages/cli`, etiqueta `v0.4.0` sobre el commit de la versión, release de GitHub («0.4.0 — pantallas»), despliegue y prueba desde npm (con los escenarios de los Blocks).
3. Pasar los datos de la publicación para anotarlos en `docs/historial/plan-blocks.md`.

Todos los cambios del repo se hicieron con la herramienta de archivos.
