# Checklist de release

Lo ejecuta **el usuario** (el dueño del proyecto). Claude prepara la versión, comprueba lo que puede (`/cerrar-grupo`) y da estos comandos, pero no publica nada (`CLAUDE.md`, «Forma de trabajar», «Commit y push»). Aquí no hay tokens ni claves: cada servicio usa su propio inicio de sesión.

En los comandos, `X.Y.Z` es la versión (por ejemplo, `0.4.0`) y `X.Y.W` la anterior (por ejemplo, `0.3.0`).

## Antes de publicar

1. La puerta del grupo (`G<n>.P`; en la 0.4.0, la de los Blocks, `B.P`) recorrida, con `/cerrar-grupo`, y todo lo suyo hecho: spec, CHANGELOG, conteos, `pnpm build`, `pnpm test` y `pnpm format:check` en verde.
2. La versión en `packages/cli/package.json` (`"version": "X.Y.Z"`) y la sección `## X.Y.Z (DD/MM/AAAA): …` en `CHANGELOG.md`.
3. El commit de la versión hecho y subido (`git status --short` sin cambios pendientes). La etiqueta va sobre ese commit.

## Publicar en npm

1. Comprobar la sesión de npm:

   ```sh
   npm whoami
   ```

   Si responde con un error (por ejemplo, `401`), la sesión caducó:

   ```sh
   npm login
   ```

2. Publicar desde `packages/cli`, con **npm**, no con pnpm (tarea 0.1.1-3: `pnpm publish` da 404 con pnpm 12, que no usa la sesión de `npm login`):

   ```sh
   cd packages/cli
   npm publish
   ```

   `prepublishOnly` compila la CLI antes de publicar (`scripts/build.mjs`), así que se publica un `dist/` recién compilado. npm pide el código de la verificación en dos pasos (spec 3, «Publicación»).

3. Confirmar que la versión está en npm, sin la caché local (la caché puede mostrar versiones viejas):

   ```sh
   npm view @mimi-ng/cli versions --prefer-online
   npm view @mimi-ng/cli dist-tags --prefer-online
   ```

   `X.Y.Z` tiene que aparecer en la lista y como `latest`.

## Etiqueta y release de GitHub

1. Etiqueta anotada sobre el commit de la versión, y subirla:

   ```sh
   git tag -a vX.Y.Z -m "X.Y.Z"
   git push origin vX.Y.Z
   ```

2. Release en GitHub (en el repositorio, «Releases» → «Draft a new release»):
   - Etiqueta: `vX.Y.Z`.
   - Título: «X.Y.Z — <subtítulo de la sección en el CHANGELOG>». Por ejemplo, la sección `## 0.2.0 (21/10/2026): overlays y navegación` da «0.2.0 — overlays y navegación».
   - PENDIENTE: el usuario confirma si el release de la 0.2.0 se publicó en GitHub (no consta en el repositorio).
   - Descripción: la sección `## X.Y.Z …` de `CHANGELOG.md` pegada **sin su título** (desde la primera línea debajo del `##` hasta antes de la sección de la versión anterior).
   - Marcar «Set as the latest release» («Latest»).

## Desplegar el sitio de documentación

Datos de `wrangler.jsonc` (raíz del repositorio): el Worker se llama `mimi-ng-docs`, sirve solo archivos estáticos de `./dist/docs/browser` (la salida de `pnpm build:docs`), en modo SPA (`not_found_handling: "single-page-application"`), y solo en el dominio propio, ng.mimiworks.dev (`workers_dev: false`, `preview_urls: false`). Wrangler 4 se usa con `npx`, sin instalarlo como dependencia (spec 2).

1. Compilar y desplegar:

   ```sh
   pnpm build:docs
   npx wrangler@4 deploy
   ```

   En una computadora nueva, antes:

   ```sh
   npx wrangler@4 login
   ```

2. PENDIENTE: el usuario comprueba en Cloudflare, Settings → Builds, si hay un repositorio conectado; si lo hay, cada push a main publica el sitio. (La spec 10, «Despliegue», habla de Workers Builds desde GitHub.) Si es así, el `npx wrangler@4 deploy` manual no hace falta; cuando el usuario confirme el dato, se corrige este paso.
3. Comprobar el sitio en el navegador con **Ctrl+F5** (recarga sin caché): la versión nueva en la landing y en la página de Instalación, y una página de un componente nuevo. `index.html` no tiene caché larga, pero el navegador puede mostrar la versión anterior hasta recargar.

## Probar desde npm

En un proyecto limpio, **fuera del repositorio**, en una **ruta corta** (por ejemplo, una carpeta en la raíz del disco): en Windows, el límite de 260 caracteres de las rutas rompió `ng serve` con pnpm en la 0.2.0. Los 4 escenarios (puerta del grupo, punto 5), más los de los Blocks desde la 0.4.0 (abajo):

1. **npm, proyecto nuevo:**

   ```sh
   npx @angular/cli@22 new app-npm --style=tailwind
   cd app-npm
   npx ng add @mimi-ng/cli
   npx ng g mimi button
   npx ng build
   ```

2. **pnpm, proyecto nuevo:** lo mismo con `pnpm dlx @angular/cli@22 new app-pnpm --style=tailwind --package-manager=pnpm` y `pnpm ng …`.
3. **Actualización sin cambios:** un proyecto con la versión anterior (`ng add @mimi-ng/cli@X.Y.W` y algunos componentes), y después la nueva, como dice el CHANGELOG de la 0.2.0:

   ```sh
   npm i -D @mimi-ng/cli@X.Y.Z
   npx ng g mimi <componentes que usa el proyecto>
   ```

   (con pnpm: `pnpm add -D @mimi-ng/cli@X.Y.Z` y `pnpm ng g mimi …`). La CLI tiene que decir «actualizado de X.Y.W a X.Y.Z» (spec 5, «Qué hace `mimi`»).

4. **Actualización con un archivo modificado:** como el 3, pero cambiando antes un archivo de un componente (y, si la versión trae tokens nuevos, el `theme-base.css`). La CLI tiene que bloquear ese ítem con su aviso y no tocar sus archivos (todo o nada, spec 5).

**Desde la 0.4.0, también los Blocks** (en los escenarios de arriba y uno más):

- En el 1 y el 2, agrega un Block (`ng g mimi login-01`, y `settings-01`, el que más componentes trae) y ponlo en `app.routes.ts` (la CLI no toca las rutas): `mimi.json` tiene `aliases.blocks`, la pantalla queda en `src/app/blocks/` y se ve con sus estilos.
- En el 3, `ng g mimi login-01` en el proyecto de la versión anterior: escribe `aliases.blocks` en `mimi.json` la primera vez, y avisa si falta `@source not "../.mimi";` en el CSS global.
- **5. Proyecto con `source(none)`:** como el 3, pero con `@import "tailwindcss" source(none);` en el CSS global antes de `ng add @mimi-ng/cli@X.Y.W`. Con la nueva, `ng g mimi login-01` tiene que agregar `@source "./app/blocks";` (lo dice en el resumen) y la pantalla tiene que verse con sus estilos.

En cada uno: `ng build` sin avisos y `ng serve` abre la página.

## Dónde se anota el resultado

En el historial del grupo, `docs/historial/plan-grupo-<n>.md` (la 0.4.0, en `docs/historial/plan-blocks.md`, que ya tiene la sección para el registro), en una sección «Publicación de la X.Y.Z (registro)» como la de la 0.2.0 en `plan-grupo-1.md`: fecha y hora de `npm publish`, que es `latest`, la etiqueta y su commit, si hubo release en GitHub, el despliegue y los escenarios con su resultado. Lo escribe Claude con los datos que dé el usuario, al cerrar la puerta.

## Si algo sale mal

- **`pnpm publish` da 404** aunque `npm whoami` funciona: pnpm 12 no usa la sesión de `npm login` (tarea 0.1.1-3). Publicar con `npm publish` desde `packages/cli`.
- **401 de npm** (en `npm publish` o `npm whoami`): la sesión de `npm login` caducó. Volver a entrar con `npm login` y repetir.
- **E404 o versiones viejas en `npm view`** justo después de publicar: es la caché de npm. Repetir con `--prefer-online`.
- **`ng serve` falla con pnpm en Windows** en el proyecto de prueba: la ruta es demasiado larga (límite de 260 caracteres). Mover el proyecto a una ruta corta y repetir.
