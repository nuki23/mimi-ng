# Checklist de release

Lo ejecuta **el usuario** (el dueño del proyecto). Claude prepara la versión, comprueba lo que puede (`/cerrar-grupo`) y da estos comandos, pero no publica nada (`CLAUDE.md`, «Forma de trabajar», «Commit y push»). Aquí no hay tokens ni claves: cada servicio usa su propio inicio de sesión.

En los comandos, `X.Y.Z` es la versión (por ejemplo, `0.3.0`) y `X.Y.W` la anterior (por ejemplo, `0.2.0`).

## Antes de publicar

1. La puerta del grupo (`G<n>.P`) recorrida, con `/cerrar-grupo`, y todo lo suyo hecho: spec, CHANGELOG, conteos, `pnpm build`, `pnpm test` y `pnpm format:check` en verde.
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
   - Título: PENDIENTE: lo decide el usuario. La 0.1.0 se llamó «v0.1.0 · Vista previa»; no consta en el repositorio si hubo release de la 0.2.0 ni su título.
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

2. PENDIENTE: lo comprueba el usuario. La spec 10 («Despliegue») dice que el build lo hace **Workers Builds desde GitHub** (`pnpm build:docs` en Cloudflare, con Node de `.node-version` y pnpm de la variable `PNPM_VERSION` del panel). Si ese build despliega solo al subir a la rama principal, el `npx wrangler@4 deploy` manual no hace falta (y no conviene hacer los dos). Anotar aquí cuál de los dos se usa.
3. Comprobar el sitio en el navegador con **Ctrl+F5** (recarga sin caché): la versión nueva en la landing y en la página de Instalación, y una página de un componente nuevo. `index.html` no tiene caché larga, pero el navegador puede mostrar la versión anterior hasta recargar.

## Probar desde npm

En un proyecto limpio, **fuera del repositorio**, en una **ruta corta** (por ejemplo, una carpeta en la raíz del disco): en Windows, el límite de 260 caracteres de las rutas rompió `ng serve` con pnpm en la 0.2.0. Los 4 escenarios (puerta del grupo, punto 5):

1. **npm, proyecto nuevo:**

   ```sh
   npx @angular/cli@22 new app-npm --style=tailwind
   cd app-npm
   npx ng add @mimi-ng/cli
   npx ng g mimi button
   npx ng build
   ```

2. **pnpm, proyecto nuevo:** lo mismo con `pnpm dlx @angular/cli@22 new app-pnpm --style=tailwind --package-manager=pnpm` y `pnpm ng …`.
3. **Actualización sin cambios:** un proyecto con la versión anterior (`ng add @mimi-ng/cli@X.Y.W` y algunos componentes), y después la nueva: instalar `@mimi-ng/cli@X.Y.Z` y volver a ejecutar `ng g mimi <los mismos componentes>`. La CLI tiene que decir «actualizado de X.Y.W a X.Y.Z» (spec 5, «Qué hace `mimi`»). PENDIENTE: lo comprueba el usuario: el comando exacto para instalar la versión nueva en un proyecto que ya la tiene (por ejemplo, `npm install -D @mimi-ng/cli@X.Y.Z`); no consta en el repositorio cómo se hizo en la 0.2.0.
4. **Actualización con un archivo modificado:** como el 3, pero cambiando antes un archivo de un componente (y, si la versión trae tokens nuevos, el `theme-base.css`). La CLI tiene que bloquear ese ítem con su aviso y no tocar sus archivos (todo o nada, spec 5).

En cada uno: `ng build` sin avisos y `ng serve` abre la página.

## Dónde se anota el resultado

En el historial del grupo, `docs/historial/plan-grupo-<n>.md`, en una sección «Publicación de la X.Y.Z (registro)» como la de la 0.2.0 en `plan-grupo-1.md`: fecha y hora de `npm publish`, que es `latest`, la etiqueta y su commit, si hubo release en GitHub, el despliegue y los 4 escenarios con su resultado. Lo escribe Claude con los datos que dé el usuario, al cerrar la puerta.

## Si algo sale mal

- **`pnpm publish` da 404** aunque `npm whoami` funciona: pnpm 12 no usa la sesión de `npm login` (tarea 0.1.1-3). Publicar con `npm publish` desde `packages/cli`.
- **`npm publish` o `npm whoami` dan 401:** la sesión de npm caducó. `npm login` y repetir.
- **`npm view` no muestra la versión recién publicada:** es la caché de npm. Repetir con `--prefer-online`.
- **`ng serve` falla con pnpm en Windows** en el proyecto de prueba: la ruta es demasiado larga (límite de 260 caracteres). Mover el proyecto a una ruta corta y repetir.
