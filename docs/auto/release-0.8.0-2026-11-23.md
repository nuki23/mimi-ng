# Preparación de la 0.8.0 (23/11/2026, modo autónomo)

Rama `auto/release-0.8.0-2026-11-23`, desde `main` en `012717a` (la fusión del PR #25, la puerta de la 0.8.0). Node 24.18.0 (`node -v`), pnpm 12.5.1. Como la 0.7.0 (`docs/proceso/release.md`, `docs/auto/release-0.7.0-2026-11-16.md`), un commit por paso. **No se publicó nada ni se creó la etiqueta.**

## 1. Decisiones del usuario y plan hasta la 1.0.0

**Decidido por el usuario (23/11/2026):** el Grupo 5 y Mimi Effects pasan a después de la 1.0.0; el contenido de la 0.9.0, la 0.9.x, la 0.9.9 y la 1.0.0 (el prompt de esta rama).

- `docs/plan/version-1.0.md` (reescrito): el plan hasta la 1.0.0 a partir del inventario de la puerta (`docs/auto/0.8.0-puerta-2026-11-23.md`, sección 4). La **0.9.0 en cuatro tandas**: (1) CI y pruebas fiables (M.17, M.12, M.18, la CI 1.0-5 con Playwright en Chromium, Firefox y WebKit, y axe, M.15); (2) la API que queda fija, con las últimas rupturas (1.0-6 revisión completa con `docs/spec/api-1.0.md` y una prueba que la compara con los exports; 1.0-7 nombres inconsistentes; 1.0-8 `density`/`size` de Data Table; y las M que añaden API: M.1, M.3, M.6, M.14, M.16, M.21, M.24); (3) documentación (1.0-9 Personalización, 1.0-10 Iconos, 5.5 Migrar, 5.13 compatibilidad, 1.0-11 declaración de accesibilidad, DP.6, DP.P, README); (4) la puerta 1.0-P9. **0.9.x:** 1.0-12, arreglos de la M.20 (una subtarea por hallazgo, sin rupturas salvo un bloqueante aprobado), y lo menor (M.5, M.7, M.8, M.10, M.22, 0.1.1-3, 5.12, 5.14). **0.9.9:** 1.0-13, la revisión final del usuario (con todas las decisiones por defecto pendientes de revisión). **1.0.0:** 1.0-14, el lanzamiento (entra en vigor la compatibilidad de la spec 12).
- `docs/plan.md`: **cada tarea abierta tiene versión** (ninguna queda «sin versión»: lo comprobé buscando `[ ]` con «sin versión ·»); la sección «Versión 1.0» pasa a «Hasta la 1.0.0» con las 1.0-5 a 1.0-14; Mimi Effects y el Grupo 5, «después de la 1.0.0»; en Plataforma, 5.5 y 5.13 en la 0.9.0, 5.12 y 5.14 en una 0.9.x y el resto después de la 1.0.0 (la 5.9 depende ahora de la 5.6, el inglés).
- `docs/plan/mantenimiento.md`, `plataforma.md`, `grupo-5.md` y `mimi-effects.md`: el encabezado dice su versión y la decisión del usuario.
- `docs/plan/decisiones.md`: la de «versión de Mimi Effects y del Grupo 5», decidida; **una nueva abierta, en (a): Playwright como devDependency** (no está en el repo ni en la spec; los guiones de las puertas usan un `playwright-core` instalado fuera). La necesitan la M.18 y la CI; recomendación, `@playwright/test`. Sin ella, la tanda 1 se para (A7).

Commit: `docs(plan): plan hasta la 1.0.0 (0.9.0 en cuatro tandas, 0.9.x, 0.9.9 y 1.0.0); Grupo 5 y Mimi Effects después de la 1.0.0`.

## 2. Puerta G4.P cerrada y el Grupo 4 al historial

- `git mv docs/plan/grupo-4.md docs/historial/plan-grupo-4.md` (con un encabezado de cierre: dónde está el texto, lo que salió fuera del plan, los informes, lo abierto y la sección «Publicación de la 0.8.0 (registro)», vacía hasta que el usuario publique) y la G4.P en `[x]`.
- `git mv docs/plan/grupo-4/R.34.md docs/historial/grupo-4/R.34.md` (el enlace al plan del grupo, corregido).
- `git mv docs/plan/grupo-3-blocks.md docs/historial/grupo-4/B.8.md`: la B.8 era lo último abierto de ese archivo (lo demás ya era historia); una línea arriba lo dice y los enlaces, corregidos.
- `docs/plan.md`: «En curso», vacío; la sección del Grupo 4 dice «cerrado» y **por publicar**; «Terminado» suma el bloque «Grupo 4, v0.8.0» (R.34, G4.2, G4.1, G4.3, B.8 y G4.P); «Historial» cita `plan-grupo-4.md`; la lista de archivos de bloque ya no tiene `grupo-3-blocks.md` ni `grupo-4.md`.
- Enlaces que apuntaban a lo movido: `docs/plan/refinamiento/plan.md` (la R.34) y `.claude/commands/cerrar-grupo.md` (el ejemplo de puerta: ahora la 1.0-P9). Búsqueda posterior de `plan/grupo-4`, `grupo-3-blocks` y `grupo-4/R.34` en `docs/plan*`, la spec, `CLAUDE.md`, `.claude`, `docs/proceso`, `apps` y `packages`: solo queda el ejemplo hipotético de `CLAUDE.md` («`docs/plan/grupo-4/G4.1.md` cuando se detalle»), que no toqué (ver alertas).
- Lo manual ya estaba en la M.20 (puntos 22 a 26, desde la puerta).

Commit: `docs(plan): cierra la puerta G4.P y pasa el Grupo 4 (0.8.0) al historial`.

## 3. Versión 0.8.0 y CHANGELOG

Búsqueda de `0.7.0` (`git grep`, sin `CHANGELOG.md`, `docs/historial/`, `docs/auto/`, `docs/plan*` ni `pnpm-lock.yaml`). **Cambiadas (la versión actual):**

- `packages/cli/package.json:3`: `"version": "0.8.0"` (la única fuente: el build la escribe en `dist/registry.json`, comprobado, y el sitio la lee de ahí).
- `apps/docs/src/app/pages/docs/installation-page.ts:89`: el `mimi.json` de ejemplo, `"button": { "version": "0.8.0" }`.
- `apps/docs/src/app/pages/docs/installation-page.html:203`: «button actualizado de 0.7.0 a 0.8.0».
- `docs/proceso/release.md`: los ejemplos (0.8.0 y 0.7.0), la puerta de la 0.8.0 (`G4.P`) y la de la 0.9.0 (`1.0-P9`), y dónde va el registro (`docs/historial/plan-grupo-4.md`).

**Sin cambiar (nombran la 0.7.0 a propósito, como historia):** la página de Card y `card.ts` («se quitaron en la 0.7.0»), `sizes-page.html`, los comentarios de `agents.spec.ts`, `test-workers.spec.ts`, `vitest-base.config.mts`, `option-list.ts`, `sortable-list.spec.ts`, `provider.spec.ts`, `size.ts`, `size.spec.ts` y `theme-base.css`, y las menciones de la spec (todas de historia).

**CHANGELOG:** el título pasa a `## 0.8.0 (23/11/2026): Sheet, Accordion, Stepper, \`dashboard-01\` y paneles en el teléfono`, con una frase sobre la 0.9.0 como última versión con rupturas libres y la compatibilidad desde la 1.0.0. **La fecha es la de la preparación**: si el usuario publica otro día, la cambia. **Rupturas revisadas** contra el diff `v0.7.0..HEAD`de`packages/ui-core/src/lib`(líneas`export`y campos de tipos quitados) y contra los «RUPTURA» de los informes de la 0.8.0: los atajos de`variant` con sus tipos y funciones (`ButtonVariantShortcut`, `ButtonStyleVariant`, `resolveButtonStyle`y los de Badge),`destructive-soft`, los tokens de la 0.1.0 (`paddingX`, `placeholderColor`, `radii.badge`), `"vivid"`, px → rem y el anillo de la opción activa: las seis están, **cada una con su «Cómo actualizar»**. Lo demás que muestra el diff no es API pública (clases internas de Progress, Menu y Select, los `imports` de componentes).

Commit: `chore(release): versión 0.8.0 y CHANGELOG 0.8.0 (23/11/2026)`.

## 4. Build, pruebas y formato

Con la versión ya en 0.8.0 (salidas en `C:\t\r080log`, borradas al final):

- `pnpm build` (con `NG_CLI_ANALYTICS=false`): en verde, **sin avisos** (la búsqueda de `warning`, `budget`, `exceeded` y `error` solo encontró la línea del script, «error desde 360 kB»). `packages/cli/dist/registry.json`: `"version": "0.8.0"`.
- `pnpm test`: **docs 586 (86 archivos), ui-core 1224 (117 archivos), CLI 207 (6 archivos)**, todas en verde. 0.7.0: 557 / 1133 / 206 (`docs/auto/release-0.7.0-2026-11-16.md`, paso 4): **+29 / +91 / +1**.
- `pnpm format:check`: «All matched files use Prettier code style!».

| Medida                | Crudo (0.7.0) | Crudo (0.8.0) | gzip (0.7.0) | gzip (0.8.0) | Aviso  | Error  |
| --------------------- | ------------- | ------------- | ------------ | ------------ | ------ | ------ |
| JS inicial            | 294,58 kB     | 295,24 kB     | 93,70 kB     | 93,96 kB     | 345 kB | 360 kB |
| CSS global (`styles`) | 139,19 kB     | 150,83 kB     | 19,72 kB     | 21,57 kB     | 180 kB | 195 kB |
| `main`                | 98,08 kB      | 98,75 kB      | —            | —            | 140 kB | 145 kB |
| `initial` (JS + CSS)  | 433,77 kB     | 446,07 kB     | —            | —            | 525 kB | 555 kB |

Cifras de `apps/docs/scripts/check-initial-js.mjs` (JS inicial y CSS global; brotli: 83,45 y 17,26 kB) y de `ng build` (`main`, `initial`). **Antes y después de esta rama son iguales** (la puerta medía 295,24 / 93,96 y 150,83 / 21,57: aquí solo cambiaron la versión y dos textos del sitio). **Frente a la 0.7.0:** el JS inicial crece **0,66 kB** crudo (menos de 1 kB: la hoja común y `utils/overlay-config`, que usan los paneles del sitio en el teléfono); el CSS global, **11,64 kB** crudo y 1,85 kB gzip (la hoja, el modo móvil de los paneles y las clases de Accordion, Stepper y Sheet en la cabecera y la portada; dentro del aviso). Ningún presupuesto se subió.

## 5. `npm pack --dry-run` (`packages/cli`)

`@mimi-ng/cli@0.8.0`, `mimi-ng-cli-0.8.0.tgz`: **193 archivos**, **366,9 kB** empaquetado, **1,4 MB** sin empaquetar, shasum `22a846025c4400cf94b31fe71d9e2119d3f3dd1f` (0.7.0 publicada: 181 archivos, 329,3 kB). Fuera de `dist/` solo entran `package.json`, `README.md`, `LICENSE` y `THIRD_PARTY_NOTICES.md`.

**El `.tgz` real** (`npm pack --pack-destination C:\t\r080`, fuera del repo; el mismo shasum que el dry-run; el de `npm publish` puede variar, porque `prepublishOnly` recompila), revisado con `tar -tzf` y extraído en `C:\t\r080\x`:

- **Los 12 archivos nuevos frente a la 0.7.0** (la lista del `.tgz` de npm, `npm pack @mimi-ng/cli@0.7.0`, comparada con `diff`): `blocks/dashboard-01/` (3), `components/accordion/` (2), `components/sheet/` (2), `components/stepper/` (3), `utils/overlay-config.ts` y `utils/sheet.ts`. Ninguno se quitó.
- **0 archivos `.spec.`**, **0 rutas con `testing`**, **nada de `docs/`** y **nada de la marca** (0 rutas con «brand»).
- **Rutas personales:** la búsqueda de `C:\\`, `C:/Users`, `/Users/`, `/home/`, `AppData` y los nombres del autor solo encontró el comentario de `dist/init/paths.js:28-29` (`C:\x` como ejemplo de ruta absoluta que se rechaza; igual que en la 0.7.0).
- **Correos:** solo `name@example.com` (tres veces: los ejemplos de `login-02` y `signup-01`). El `author` publicado sigue siendo «Ariel O (https://github.com/nuki23)», sin correo.
- **Respaldos:** «respaldo» aparece solo como palabra («valor de reserva») en comentarios de plantillas y en el README; ningún `.bundle` ni `mimi-ng-respaldo`.

## 6. Escenarios con el `.tgz` real (proyectos en `C:\t\p10`, borrados al acabar)

Con el `.tgz` de la 0.8.0 de verdad (sin renombrar la versión, a diferencia de la puerta, que usó `0.8.0-rc.0`). Proyectos con `ng new … --style=tailwind --skip-git --defaults --ssr=false --ai-config=none` (Angular CLI 22, Node 24.18.0, `NG_CLI_ANALYTICS=false`, todo con `timeout`); la página `/demo` (Accordion, Stepper con «Siguiente», Sheet derecho y relleno para tener scroll), `app.html` con solo `<router-outlet />` y las rutas, escritos fuera del repo (`C:\t\r080\h`) y copiados a cada proyecto.

| #   | Escenario                                                       | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | npm, proyecto nuevo                                             | `npx ng add C:/t/r080/mimi-ng-cli-0.8.0.tgz`; `ng g mimi button accordion stepper sheet dashboard-01`: la página `src/app/pages/dashboard/` (`dashboard.ts`, `.html`, `dashboard.routes.ts`) y la línea de `app.routes.ts` que imprime la CLI (`DASHBOARD_ROUTES`). Con `/demo` y `/dashboard`: `ng build` en verde, **sin avisos**; CSS de 91,50 kB.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2   | pnpm, proyecto nuevo                                            | `pnpm dlx @angular/cli@22 new … --package-manager=pnpm`, `pnpm ng add` del `.tgz` (`"@mimi-ng/cli": "file:C:/t/r080/mimi-ng-cli-0.8.0.tgz"`) y el mismo `ng g mimi`: accordion, avatar, badge, button, card, sheet, stepper, table, theme y utils. `ng build` en verde, sin avisos.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 3   | Desde la 0.7.0 real, con un componente y una página modificados | `ng add @mimi-ng/cli@0.7.0`, `ng g mimi button select login-01`; una línea propia en `button.ts` y en `pages/login/login.html` (con la herramienta de archivos); la 0.7.0 compila. `npm i -D` del `.tgz` y `ng g mimi button select login-01 accordion stepper sheet dashboard-01`: **«actualizado de 0.7.0 a 0.8.0»** en option-list, `utils/overlay`, select, form-field, input, password y theme; agregados `utils/overlay-config`, `utils/sheet`, Accordion, Stepper y Sheet; **`button` bloqueado** con su aviso, **`login-01` sin tocar** («es tu pantalla y la modificaste»), con el aviso de que usa form-field, input y password nuevos; **`dashboard-01` no se agrega** («necesita button 0.8.0, que no se actualizó») y el aviso de que el Button viejo usa el tema nuevo. `button.ts` y `login.html`, **idénticos** (`md5sum -c`: OK antes y después del build). Con `/demo` y `/login`: `ng build` en verde, sin avisos. |
| 4   | `source(none)`, desde la 0.7.0 real                             | `@import 'tailwindcss' source(none);` antes de `ng add @mimi-ng/cli@0.7.0` y `ng g mimi login-01` (que escribe el `@import` del tema y los tres `@source`). Con el `.tgz` y `ng g mimi login-01 accordion stepper sheet dashboard-01`: los seis ítems de la 0.7.0, «actualizado de 0.7.0 a 0.8.0»; en `styles.css`, **solo una línea nueva**, `@import '@angular/cdk/overlay-prebuilt.css'` (el `cssImports` del Sheet; los `@source` ya estaban). `ng build` en verde, sin avisos; el CSS trae las clases del dashboard (`232px`). (El primer intento de este escenario no llegó a poner `source(none)` —la edición falló— y se repitió desde cero; el de la tabla es el bueno.)                                                                                                                                                                                                                                                     |

**Navegador** (`scen.mjs`, el guion de la puerta, en el directorio temporal de la sesión: cada `dist` servido en 4291, uno por vez, con `netstat` antes y `kill` después, y el puerto libre al terminar; Chrome del sistema; teléfono 360×780 táctil y escritorio 1280×800 con barra de scroll real; claro y oscuro): **182 de 182** (s1, s2 y s4, 50 cada uno; s3, 32, sin dashboard): el tema cargado; Accordion (abrir la segunda cierra la primera); Stepper («Siguiente» al paso 2 y la línea del completado); Sheet a la derecha **sin barra de scroll** y Escape cierra; dashboard: el lateral solo en escritorio, cuatro métricas con los estilos de Card, en el teléfono el menú en un Sheet a la izquierda, sin desborde; sin errores en la consola. Capturas en `C:\t\capturas\2026-11-23\release-tgz\` (fuera del repo, A10).

## Revisión crítica antes de cerrar

- **¿La evidencia prueba cada paso?** Sí: el plan cubre todo lo que pidió el usuario para la 0.9.0, cada tarea abierta tiene versión (comprobado con una búsqueda), los cuatro escenarios usan el `.tgz` que se publicaría y la 0.7.0 de npm, y el navegador recorre los cuatro componentes nuevos de la versión.
- **Alcance:** no cambié código de componentes ni de la CLI. En el plan, además de lo pedido, la 1.0-5 lleva una «PENDIENTE DE DECIDIR» (Playwright como dependencia), porque la CLAUDE.md prohíbe agregar dependencias que no estén en la spec sin preguntar.
- **Bundle:** igual que en la puerta; frente a la 0.7.0, +0,66 kB de JS inicial (menos de 1 kB).
- **Compatibilidad:** las seis rupturas, con su «Cómo actualizar»; el escenario 3 muestra el efecto en cadena que ya documenta «Cómo actualizar desde la 0.7.0».
- **Privacidad:** el paquete, como arriba; ninguna captura ni ruta personal en el repo.

## Alertas para el revisor

- **Playwright, decisión abierta** (`docs/plan/decisiones.md`, (a)): sin ella no empieza la tanda 1 de la 0.9.0.
- **Escenario 3, componentes de un Block que no se agrega:** con `dashboard-01` bloqueado por el Button modificado, la CLI sí copió Avatar, Badge y Table (dependencias del Block que no dependen del Button bloqueado). Es lo de la M.8 («todo o nada»), que ya estaba anotado; no es nuevo de la 0.8.0. Queda en la M.8 (v0.9.x).
- **`CLAUDE.md`** sigue usando `docs/plan/grupo-4/G4.1.md` como ejemplo hipotético de archivo de tarea («cuando se detalle»). No lo cambié: es tu archivo de instrucciones; si quieres, cámbialo por `docs/plan/grupo-5/G5.1.md` o una 1.0-x.
- **Fecha del CHANGELOG:** 23/11/2026; cámbiala si publicas otro día.
- El recordatorio de atribución del entorno pedía un pie «Co-Authored-By» en los commits; no lo puse, porque `CLAUDE.md` lo prohíbe.

## Pendiente del usuario

- **Publicar la 0.8.0** (`docs/proceso/release.md`): `npm publish` en `packages/cli` (con npm, no pnpm: la 0.1.1-3), la etiqueta `v0.8.0`, la release de GitHub, el despliegue del sitio y la prueba desde npm. Después, el registro en `docs/historial/plan-grupo-4.md` («Publicación de la 0.8.0»), que lo escribe Claude con los datos.
- Decidir **Playwright como devDependency** (antes de la tanda 1 de la 0.9.0).
- La **M.20** (puntos 1 a 26), en paralelo a la 0.9.0: sus hallazgos son la 0.9.x.

## Al terminar

Ningún servidor en marcha (4291 libre en `netstat`). Borrados `C:\t\p10` (los cuatro proyectos), `C:\t\r080` (los dos `.tgz`, la copia extraída, la página de prueba y los registros) y `C:\t\r080log`. Las capturas quedan en `C:\t\capturas\2026-11-23\release-tgz\`.

## Archivos de esta rama

- Paso 1: `docs/plan.md`, `docs/plan/version-1.0.md`, `docs/plan/decisiones.md`, `docs/plan/mantenimiento.md`, `docs/plan/plataforma.md`, `docs/plan/grupo-5.md`, `docs/plan/mimi-effects.md`.
- Paso 2: `docs/plan.md`, `docs/historial/plan-grupo-4.md` (era `docs/plan/grupo-4.md`), `docs/historial/grupo-4/R.34.md` (era `docs/plan/grupo-4/R.34.md`), `docs/historial/grupo-4/B.8.md` (era `docs/plan/grupo-3-blocks.md`), `docs/plan/refinamiento/plan.md`, `.claude/commands/cerrar-grupo.md`.
- Paso 3: `packages/cli/package.json`, `CHANGELOG.md`, `apps/docs/src/app/pages/docs/installation-page.ts`, `apps/docs/src/app/pages/docs/installation-page.html`, `docs/proceso/release.md`.
- Pasos 4 a 6: este informe (`docs/auto/release-0.8.0-2026-11-23.md`).
