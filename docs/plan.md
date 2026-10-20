# Plan de desarrollo de Mimi

Marca `[x]` al terminar cada tarea. Una tarea por sesión de Claude Code (usa `/clear` entre tareas).

## Fase 0: Preparación (la haces tú, fuera de Claude Code)

- [x] 0.1 Instalar Node.js (versión LTS compatible con Angular 22, ver angular.dev), pnpm y git.
- [x] 0.2 Generar los diseños en Claude Design y guardarlos en `docs/design/`.
- [x] 0.3 Elegir el estilo del MVP: un solo tema base, Mimi.
- [x] 0.4 `git init` y primer commit con estos documentos.

## Fase 1: Base

- [x] 1.1 Monorepo: `pnpm-workspace.yaml`, `package.json` raíz con scripts (`dev`, `build`, `test`), `tsconfig.base.json` con alias a `packages/ui-core`.
- [x] 1.2 `apps/docs` con Angular 22 (zoneless, Tailwind 4) y `packages/ui-core` vacío. Verificar que el showcase arranque con `pnpm dev`.
- [x] 1.3 Tokens: `ui-core/src/lib/theme/theme-base.css` con las variables `--mimi-*` de `docs/design/`, claro y oscuro, y el bloque `@theme inline`. `@source` a `ui-core` en el `styles.css` del showcase.
- [x] 1.4 Utils: `cn.ts` y `control-styles.ts`.
- [x] 1.4b Workspace de Angular en la raíz: `angular.json` con los proyectos `docs` y `ui-core` (solo `test`), dependencias en el `package.json` raíz y pruebas de ui-core con `ng test` y TestBed.
- [x] 1.5 Tema: `types.ts` y `provideMimiTheme()` (inyecta un `<style>`, no estilos en línea). Probar cambiando el primario.
- [x] 1.6 Layout del showcase: header, sidebar, contenido, TOC, botón claro/oscuro.
- [x] 1.7 `CodePreview` (pestañas Preview/Código, botón copiar, resaltado con Shiki).

## Fase 2: Componentes básicos

Usar el comando `/componente <nombre>` para cada uno.

- [x] 2.1 Button (`a[mimiBtn]` con `aria-disabled` debe llevar también `tabindex="-1"`). Reemplazar los botones del layout del showcase por mimiBtn.
- [x] 2.2 Input (usar su propia cascada de alturas, `--mimi-input-height*` → `--mimi-control-height*`, como Button, y decidir ahí si `controlSizes` se elimina)
- [x] 2.3 Textarea
- [x] 2.4 Badge
- [x] 2.5 Card
- [x] 2.6 Separator
- [x] 2.7 Skeleton
- [x] 2.8 Avatar
- [x] 2.9 Switch
- [x] 2.10 Checkbox
- [x] 2.11 FormField + FormError (y error automático en Input y Textarea). Actualizar los ejemplos de Input y Textarea que usan #ref='mimiInput' para mostrar errores, y pasarlos a mimi-form-field + mimi-form-error.
- [x] 2.12 Página de inicio del showcase (landing) con el formulario de vitrina

## Fase 3: CLI básica

- [x] 3.1 `packages/cli` con Angular Schematics y `registry.json` (con `dependencies` y `registryDependencies`).
- [x] 3.2 Script de build que copia `ui-core/src/lib/**` a las plantillas de la CLI.
- [x] 3.3 Schematic `init`: dependencias, variables en `styles.css` (sin `@source`, ver spec 5), utils, alias en `tsconfig.json`, `mimi.json`, pregunta opcional por `@lucide/angular`.
- [x] 3.4 Schematic `ng-add` que ejecuta `init`.
- [x] 3.5 Schematic `ui`: varios componentes a la vez, menú si no hay nombres, guarda la copia original en `.mimi/base/`, no sobrescribe sin `--overwrite`.
- [x] 3.6 Registrar la colección en `schematicCollections` para permitir `ng g ui button`.
- [x] 3.7 Probar la CLI en un proyecto Angular 22 limpio, fuera del monorepo. Probada con Angular 22.2.0, pnpm y npm; segunda prueba tras las correcciones, también con un .prettierrc distinto (80 columnas, comillas dobles): sin omisiones falsas. Hallazgos:
  - [x] Si el Prettier del proyecto tiene otro estilo que ui-core, la CLI de Angular reformatea los archivos que copia Mimi y la siguiente ejecución de `ui` o `init` los toma por modificados («Omitido: … ya existe con otro contenido»). Corregido: «modificado por el usuario» = distinto de su base en `.mimi/base/`, con la versión de cada base en `.mimi/manifest.json` (spec 5).
  - [x] `init` repetido dice «Mimi quedó configurado… Agrega tu primer componente» aunque no cambió nada. Corregido: «Mimi ya estaba configurado; no hubo cambios.».
  - [x] Evaluado: `utils/field-state.ts` trae Signal Forms (10,6 kB) aunque la app solo use Reactive Forms. Evitarlo exigiría un detalle interno de Angular; se deja y se documenta el costo (spec 1 y 8).
  - Observación (no es de Mimi): `ng add <archivo.tgz>` falla con pnpm y npm («Unable to fetch package information»); para probar sin publicar: instalar el `.tgz` y ejecutar `ng add @mimi-ng/cli`.
- [x] 3.8 Leer la versión del showcase desde @mimi-ng/cli. Única fuente: `packages/cli/package.json` (showcase, `dist/registry.json`, manifiesto y `mimi.json`); ui-core ya no tiene `version`.
- [x] 3.9 Revisar la página de Instalación contra la CLI real. Incluir la nota sobre pnpm: desde pnpm 10, los scripts de instalación de las dependencias están bloqueados salvo los aprobados (en la prueba de la 3.7, con pnpm 12, `pnpm add` avisó «Ignored build scripts» para esbuild, lmdb, @parcel/watcher y msgpackr-extract, y creó `pnpm-workspace.yaml` con `allowBuilds` para completar). Se aprueban con `pnpm approve-builds` o poniendo `true` en `allowBuilds`. Ojo: mientras no se aprueben, el siguiente `pnpm add` falla con `ERR_PNPM_IGNORED_BUILDS` (lo vimos al reinstalar la CLI), y eso afectaría también a la instalación de dependencias que agendan `ng add` y `ng g ui`.

## Lanzamiento 0.1.0 (vista previa): completo

Completado el 30/09/2026: `@mimi-ng/cli@0.1.0` en npm, el sitio en https://ng.mimiworks.dev, el repositorio público y el release [v0.1.0](https://github.com/nuki23/mimi-ng/releases/tag/v0.1.0) en GitHub.

Publicar `@mimi-ng/cli` 0.1.0 antes de la Fase 4. La publicación en npm la hace el dueño del proyecto; Claude Code no publica nada.

- [x] L.1 READMEs: `packages/cli/README.md` (el que muestra npm: qué es Mimi, requisitos, `ng add`, `ng g ui`, componentes y enlace a la documentación) y `README.md` de la raíz (GitHub). Documentación en https://ng.mimiworks.dev; repositorio en https://github.com/nuki23/mimi-ng.
- [x] L.2 `package.json` de la CLI: `description`, `keywords`, `repository`, `homepage` (https://ng.mimiworks.dev), `bugs`, `author` ("Ariel O (https://github.com/nuki23)", sin correo), `license`, `engines` y `publishConfig.access: public`.
- [x] L.3 Documentación en Cloudflare Workers (archivos estáticos, modo SPA), en ng.mimiworks.dev (prerender en la Fase 5): `wrangler.jsonc`, `_headers`, `.node-version`, `pnpm build:docs` y `noindex` en la 404 (spec, sección 10, «Despliegue»). La configuración del panel de Cloudflare la hace el dueño del proyecto. Verificada en producción (30/09/2026): navegación, recarga de `/docs/components/button`, 404 en `/docs/xyz`, celular y caché de los archivos con hash.
- [x] L.3b Comando `ng g mimi <nombre>`: el schematic `ui` pasa a llamarse `mimi`, con `ui` como alias (la CLI de Angular descarta por nombre los schematics repetidos entre colecciones, así que un alias `mimi` sobre `ui` fallaría con Spartan antes que Mimi). Sitio, READMEs, `InstallCommand` y mensajes de la CLI muestran `ng g mimi` y la forma larga `ng g @mimi-ng/cli:ui`; `commands.spec.ts` prohíbe mostrar `ng g ui` (spec, sección 5).
- [x] L.4 `pnpm publish --dry-run`: lista de archivos y tamaño. Resultado (30/09/2026, repetido tras la L.3b y la L.5): 53 archivos, 37,8 kB comprimido y 133,6 kB descomprimido; `dist/` (schematics compilados, `registry.json` con la versión 0.1.0 y 37 plantillas de ui-core, sin pruebas ni `utils/index.ts`), `README.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md` y `package.json`. Sin correos ni rutas `workspace:`. pnpm 12 no lista los archivos en el dry-run de `publish`; la lista sale de `pnpm pack --dry-run --json` y los tamaños de un `pnpm pack` fuera del repositorio.
- [x] L.5 Quitar `"private": true` de la CLI (último paso antes de publicar). También: `prepublishOnly` compila la CLI antes de publicar, y `pnpm build:docs` (el build de Cloudflare) falla si `apps/docs/public` tiene archivos que no sean svg, png, ico, webp o `_headers` (`apps/docs/scripts/check-public.mjs`, con su prueba).
- [x] L.6 Después de publicar: probar `ng add @mimi-ng/cli` desde npm en un proyecto limpio; quitar «La CLI estará disponible pronto.» (landing e Instalación) y ajustar sus pruebas; `CHANGELOG.md`; etiqueta `v0.1.0` y release en GitHub; hacer público el repositorio; cuando el sitio y el paquete estén publicados, agregar a los dos READMEs una captura de pantalla del sitio y badges de npm (versión) y licencia.
  - Hecho (30/09/2026): `@mimi-ng/cli@0.1.0` publicado; prueba real desde npm en un proyecto limpio fuera del repositorio (Angular CLI 22.2.0, pnpm 12.5.1): `ng new --style=tailwind` + `ng add @mimi-ng/cli` + `ng g mimi button` + uso del botón + `ng build` sin avisos, y `ng add @mimi-ng/cli --icons` en otro proyecto limpio. Repositorio público. Quitado «La CLI estará disponible pronto.» (landing e Instalación, con sus pruebas); `CHANGELOG.md`; badges de npm y licencia en los dos READMEs; captura referenciada en `docs/assets/mimi-ng-showcase.png` (en el README de npm, por URL absoluta de GitHub: se verá en npm con la próxima publicación).
  - Hecho por el dueño del proyecto: la captura en `docs/assets/mimi-ng-showcase.png`, la etiqueta anotada `v0.1.0` sobre `cce3666` (el commit desde el que se publicó: el tarball de npm es idéntico al paquete de ese commit) y el release «v0.1.0 · Vista previa» en GitHub (release normal, como `latest` en npm).

## Versión 0.1.1

Hallazgos de la prueba real de la 0.1.0 desde npm (L.6).

- [x] 0.1.1-1 `ng add @mimi-ng/cli --icons=false` falla con "Data path "/icons" must be boolean": `ng add` pasa el valor como texto (antes de instalar el paquete no conoce su esquema). `--icons` sí funciona. Investigar en `@angular/cli` (`commands/add`) cómo se pasan las opciones y si alcanza con aceptar también `"true"`/`"false"` en el esquema o en `init`; probar `--icons=false` y `--no-icons` en un proyecto limpio. Hecho (04/10/2026): esquema propio de `ng-add` (`icons` acepta `boolean` o `string`, con la pregunta `confirmation`) que convierte `"true"`/`"false"` antes de llamar a init. Publicada como 0.1.1 desde la rama `release/0.1.x` y probada desde npm en un proyecto limpio.
- [x] 0.1.1-2 pnpm 12 creó un `pnpm-workspace.yaml` en el proyecto del usuario con `minimumReleaseAgeExclude: ['@mimi-ng/cli@0.1.0']` al instalar una versión de pocas horas (política de antigüedad mínima de pnpm). No impidió nada. Confirmar el mecanismo y el valor por defecto de `minimumReleaseAge` en pnpm 12, y decidir si la página de Instalación lo menciona (junto a la nota de pnpm). Hecho (04/10/2026): según la documentación de pnpm, `minimumReleaseAge` vale 1440 minutos (24 h) por defecto desde pnpm 11, y sin `minimumReleaseAgeStrict` configurado pnpm instala igual una versión más nueva para no fallar. Explicado en Instalación, sección pnpm («Versiones recién publicadas»). Publicada desde la rama `release/0.1.x` y probada desde npm en un proyecto limpio.
- [ ] 0.1.1-3 `pnpm publish` da 404 aunque `npm whoami` funciona (pnpm 12 no usa la sesión de `npm login`). Mientras se resuelve, publicar con `npm publish` desde `packages/cli`. Investigar cómo autentica pnpm 12.

## Hoja de ruta del catálogo

Criterio (spec, sección 4): solo componentes funcionales y difíciles de hacer bien a mano (teclado, accesibilidad, overlays, estados). Cada grupo es una versión menor. Colores, radios y sombras salen de `docs/design/`, nunca inventados. Inspiración y dependencias de cada componente: spec, sección 4, «Hoja de ruta». Cada componente nuevo registra sus tokens en `MimiComponentTokens` y su prefijo en `COMPONENT_PREFIX`, con prueba, y tiene su tabla en la spec, sección 13 (paso obligatorio de `/componente`). Los componentes con color usan variante y tono por separado (spec, sección 4).

**Diseños:** las tandas D1–D5 están hechas (exportadas el 01/10/2026). En cada tarea, «Diseño:» indica el archivo de `docs/design/` (sin el prefijo `Mimi ` ni la extensión `.dc.html`). Los textos de los diseños que contradicen la spec están en la spec, sección 13, «Correcciones pendientes del diseño».

Orden: Fase 4 → Grupo 1 → Grupo 2 → Theme Studio y Blocks → Grupo 3 → Grupo 4. Mimi Effects tiene prioridad baja y puede empezar después del Grupo 3. El Grupo 5 se prioriza según lo que pidan los usuarios después de la 0.2.0.

## Fase 4: Preparación del catálogo ampliado

- [x] D1 Diseño: tokens nuevos, Grupo 1 (incluida Pagination) y mimi-toolbar, con la hoja de tokens por componente. Archivos: `Tokens`, `F2 Tokens y Tonos`, `F2 Overlays`, `F2 Select`, `F2 Toast Tabs Toolbar`, `F7 Pagination` y `Pagination`; variables en `tokens-mimi.css`, `mimi-variables-componentes.css` y `mimi-tokens-data.js`.
- [x] 4.4 Páginas /dev fuera del build de producción (adelantado de la G1.1, 04/10/2026): las rutas están en `app/dev/dev.routes.ts`, que la configuración `production` reemplaza por una lista vacía (`fileReplacements`), y `styles.prod.css` importa `styles.css` y agrega `@source not './app/dev'`. En desarrollo (`pnpm dev`) no cambia nada. Bundle inicial: 398,27 → 392,01 kB crudos (100,02 → 98,26 kB gzip); CSS 79,02 → 73,99 kB.
- [x] 4.3 Evaluar @angular/aria (estable en v22) frente a @angular/cdk. Decisión (spec, sección 4, «Base técnica»): **combinación**. `@angular/aria` para listbox/combobox (Select), menú (Dropdown y Context Menu), tabs y toolbar; `@angular/cdk` para el posicionamiento (Overlay), Dialog, a11y y drag-drop. Sin `@angular/cdk/menu` ni `@angular/cdk/listbox`. Prueba de concepto fuera del repositorio: Select con búsqueda y menú con submenú; aria cuesta +1,4 kB gzip frente a cdk solo (CDK Overlay, +17 kB gzip, lo pagan las dos), y un control con `FormValueControl` sobre el Listbox de aria funciona con Signal Forms, Reactive Forms y ngModel.
- [x] T.0 Catálogo de tokens en la spec (sección 13), en tres niveles (globales, compartidos y por componente), con una tabla por cada uno de los 21 componentes de la hoja (los de la 0.1.0 y los del Grupo 1). Los Grupos 2 a 5 agregan sus tokens y su tabla con cada tanda.
- [x] T.0b Tokens propios de los componentes existentes (Avatar, Switch, Checkbox, FormField, Separator, Skeleton, Badge, y Textarea separado de Input), según la spec, sección 13: en el CSS del componente con la cascada de la spec 6.2, en `MimiComponentTokens` y en `COMPONENT_PREFIX`, con pruebas. Resolver las diferencias de nombres entre el código de la 0.1.0 y la hoja (Button, Input, Card; spec 13, «Reglas») sin romper los presets que ya usan los nombres viejos, y decidir si el global `--mimi-badge-radius` se renombra (choca con el token de Badge) y si `--mimi-switch-off` pasa a `components`. Hecho (06/10/2026): tokens en el CSS de cada componente con la cascada de la spec 6.2 y los valores de la 0.1.0 como respaldo (comprobado clase por clase con Tailwind); los de tamaño, radio, espaciado, tipografía y escala en `MimiComponentTokens`; los colores solo en el CSS. Nombres de la 0.1.0 compatibles hasta la 1.0, con aviso en modo desarrollo. `--mimi-badge-radius` sigue siendo el radio de Badge (`radii.badge` queda deprecado) y `--mimi-switch-off` sigue global. Tabla «Variables CSS» en cada página, desde `component-tokens.ts`.
- [x] T.1 Tokens nuevos de `tokens-mimi.css` en ui-core: tonos `success`, `warning` e `info` (con `-foreground`, `-soft`, `-soft-foreground`, `-hover`, `-ring` y sombras de color), `destructive-soft-foreground` y `destructive-soft-bg`, `--mimi-glow` y `--mimi-glow-<tono>`, `shadow-popover`, `tooltip`, `glass`, `overlay-blur` y los compartidos (foco, deshabilitado, íconos). Valores del diseño para `--mimi-overlay` (claro `oklch(0.145 0 0 / 0.38)`, oscuro `oklch(0 0 0 / 0.6)`) y `--mimi-popover` en oscuro (`oklch(0.205 0 0)`). Renombrar `--mimi-destructive-soft` (un anillo) a `--mimi-destructive-ring`, con la convención `<tono>-soft` = fondo suave, `<tono>-ring` = anillo. Registrarlos en `theme-base.css`, `types.ts`, `mimiThemeToCss` y `cn.ts` (sombras para tailwind-merge), con pruebas. Diseño: `F2 Tokens y Tonos` y `Tokens`. Hecho (01/10/2026): solo lo que usa el Grupo 1 (los keyframes nuevos no hacían falta: el Grupo 1 solo usa `mimi-spin` y `mimi-pulse`); grupo nuevo `effects` (`overlayBlur`, `glassBlur`) y compartidos en `controls`; `destructive-soft` queda como alias de `destructive-ring` hasta la 1.0 (spec 12).
- [x] V.1 Variante y tono separados en Button y Badge (spec, sección 4): variantes `solid`, `soft`, `outline`, `ghost`, `link`… y tonos `primary`, `secondary`, `success`, `warning`, `info` y `danger`. `variant="destructive"` sigue funcionando como atajo de `solid` + `danger` (compatibilidad con la 0.1.0). Necesita T.1. Diseño: `F2 Tokens y Tonos`. Hecho (01/10/2026): sin `tone`, cada variante usa su tono natural (outline y ghost, secondary); derivados nuevos `-soft-hover`, `-border` y `-subtle` con las fórmulas del diseño; atajos con `@deprecated` y aviso una vez si se combinan con `tone`; celdas sin diseño marcadas como provisionales (spec 13).
- [x] V.2 Quitar el nombre «Vivid» del código: `init` escribe `"style": "mimi"`; `init` y `ui` aceptan `"vivid"` (la 0.1.0) sin error ni aviso y no reescriben el valor existente (la CLI no lee ni valida `style`: un valor desconocido también se conserva). Pruebas en `init.spec.ts` y `ui.spec.ts`; ejemplo de `mimi.json` de Instalación; spec 12.

## Grupo 1 → v0.2.0: overlays y navegación

- [x] G1.1 Popover, con CDK Overlay. Base de posicionamiento de los demás overlays. Al empezar: instalar `@angular/aria` y `@angular/cdk` (misma versión que `@angular/core`) en el `package.json` raíz y agregarlos a las `peerDependencies` de ui-core; que `imports.spec.ts` rechace los entry points `private` de aria y cdk. Medir el bundle inicial antes y después de instalar @angular/cdk y @angular/aria. Los componentes que los usan deben llegar al showcase solo en rutas lazy, nunca en el bundle inicial. Si un aviso de presupuesto salta, se revisa antes de seguir; no se sube ningún presupuesto sin decidirlo. Paso A (hecho, 06/10/2026): presupuestos separados (spec 10): JS inicial con `apps/docs/scripts/check-initial-js.mjs` (aviso 325 kB, error 335 kB, dentro de `pnpm build`) y en `angular.json` `main` 140/145 kB, `styles` 105/115 kB e `initial` 430/450 kB. Paso B (hecho, 06/10/2026): `@angular/cdk` y `@angular/aria` 22.1.7 (la de `@angular/core`; bundle inicial sin cambios al instalar); `imports.spec.ts` rechaza entry points `private`, rutas internas y símbolos `_`/`ɵ`. Popover con `CdkConnectedOverlay` (popover nativo `'inline'`), `[(open)]`, `side`/`align` con flip, flecha decorativa, foco y animación con los valores de `--mimi-transition`; `class` y `label` en `mimi-popover` (un `class` estático en un `ng-template` no llega a la directiva). La CLI agrega `@angular/cdk/overlay-prebuilt.css` al CSS global (`cssImports`, sin duplicar) y el showcase lo importa. JS inicial +4.0 kB por código compartido de rxjs y `@angular/core` que esbuild pone en el chunk inicial; nada del CDK ni de Popover (spec 10). Diseño: `F2 Overlays`.
- [x] G1.2 Tooltip, con CDK Overlay (semántica propia: `role="tooltip"`, `aria-describedby`). Diseño: `F2 Overlays`. Hecho (07/10/2026): directiva `[mimiTooltip]` en cualquier elemento, solo texto, con `mimiTooltipSide` (top), `Align`, `Delay` (token `--mimi-tooltip-delay`), `Disabled`, `Shortcut`, `Arrow` y `Class`. WCAG 1.4.13 (puntero y foco de teclado, puente al tooltip, Escape sin mover el foco), `aria-describedby` solo si el texto no es el `aria-label`, «salto sin retraso» de 300 ms y nada en táctil. Util compartido `utils/overlay.ts` (posiciones, flip, flecha, animación, `MIMI_VIEWPORT_MARGIN`) usado también por Popover, fuera del índice de utils (regla nueva en `imports.spec.ts`; `field-state` también salió del índice). CLI: ítems `utils/overlay` y `tooltip`. JS inicial +0.19 kB.
- [x] G1.3 Dropdown Menu (submenús, búsqueda por letra), con `@angular/aria/menu` y CDK Overlay. Diseño: `F2 Overlays`. Es el primer componente con `@angular/aria`: la CLI instala `@angular/aria` en la versión exacta del `@angular/cdk` instalado (aria exige la misma versión); si el cdk no está, ambos con el rango de core. Con prueba. Hecho (12/10/2026): `mimi-dropdown-menu` con trigger y contenido en `ng-template` (como Popover), ítems `mimi-menu-*` reutilizables por el Context Menu (ítem con atajo y tono `danger`, checkbox, grupo radio provisional, etiqueta, separador y submenú). Elegir cualquier ítem cierra todo el menú. Submenú con CSS dentro del panel y volteo simple (prueba previa en Chrome: `.cdk-overlay-popover` tiene `overflow: visible`, no lo recorta). Ninguna API pública de aria enfoca el primer o el último ítem: se envía Home/End, con una prueba de alarma. CLI: versión de aria con `tree.read` y tres pruebas. JS inicial +2.0 kB (`hostDirectives` de `@angular/core`, spec 10).
- [x] G1.4 Context Menu, sobre los ítems del Dropdown Menu (aria no tiene un patrón de menú contextual: usa el `ngMenu` de siempre). Diseño: `F2 Overlays`. Hecho (13/10/2026):
  - **Ítems compartidos:** pasaron a un ítem `menu` de la CLI (tipo `util`, `components/ui/menu/`), con `MimiMenuPanel` interno, que reúne los rodeos de aria. Dropdown y Context Menu dependen de él; `ng g mimi context-menu` no copia el Dropdown. Los índices de los dos reexportan los ítems y `MimiMenuItemTone`.
  - **Componente:** `mimi-context-menu` con uno o varios `[mimiContextMenuTrigger]` y su dato (`let-x`). Se abre solo con el evento `contextmenu`: con el puntero, en el punto (origen `{x, y}` del CDK, con volteo); con Shift+F10 o la tecla de menú, junto al elemento enfocado. El panel queda dentro del host (`{type: 'parent'}`). Al hacer scroll, se cierra si se abrió con el puntero. Tiene `disabled` (menú del navegador). En táctil, solo el `contextmenu` nativo.
  - **Comprobado en Chrome real (CDP):** las teclas, el punto, el volteo vertical, la fila de la tabla, el scroll y el modo desactivado.
  - **JS inicial:** +0.42 kB.
- [x] G1.5 Select, estilo NG-ZORRO, con `FormValueControl` (spec 8) sobre `@angular/aria` (Combobox + Listbox) y CDK Overlay; el filtrado de la búsqueda lo hace Mimi. Al hacerlo, completar `MimiComponentTokens` en `theme/types.ts` (hoy tiene el comentario «select y dialog se agregan en la Fase 4»). Diseño: `F2 Select`.
  - **Alcance:** lo del diseño: selección simple (sin múltiple ni chips), buscador opcional (`search`) con contador y resaltado, limpiar, grupos, opciones deshabilitadas con `hint`, check, sin resultados, cargando, error y deshabilitado. API por datos (`options`), con `MimiOption.hint` y `MimiOptionGroup`; plantilla `mimiSelectOption` opcional; textos en `MIMI_SELECT_TEXT` (inglés y español).
  - **Estructura:** caja del alto de Input con un `<button role="combobox">` dentro; panel en `CdkConnectedOverlay` (`'inline'`, ancho del disparador, 8px). El `ngComboboxPopup` va por fuera del overlay (así `aria-haspopup` existe con el panel cerrado) y la lista es un componente interno (`MimiSelectList`) para que el listbox se registre en el popup que lo contiene. `class` va al disparador y `panelClass` al panel (regla nueva, spec 4).
  - **Formularios:** los tres sistemas, con `mimi-form-field` (etiqueta, error, `aria-describedby`). `touch` al salir el foco del Select entero, no en el `blur` del botón.
  - **Comprobado en Chrome real (CDP):** todas las teclas, el puntero, el foco, las medidas (40px junto a Input, panel a 8px y del mismo ancho, opción de 34px), el anillo igual al de Input y el árbol de accesibilidad (combobox con `hasPopup` también cerrado; panel `dialog` con nombre; input `combobox` con `activedescendant`; opciones con nombre, `selected` y `disabled` dentro de su grupo).
  - **Pendiente:** la prueba con NVDA (G1.5b) y saltar a una opción con una letra estando cerrado.
  - **Móvil (5.17):** la API no depende del overlay; un panel tipo hoja o modal se puede hacer después cambiando la estrategia de posición y las clases del panel, sin tocar entradas ni salidas.
  - **JS inicial:** +0.13 kB. **CSS global:** +4.47 kB (spec 10).
- [x] G1.5b Revisión de aria después del Select: teclado (con el overlay abierto, en navegador real), lectores de pantalla (NVDA o VoiceOver), formularios (Signal Forms, Reactive Forms y ngModel) y peso en el bundle. Si convence, se sigue con aria en el resto del Grupo 1; si no, se reemplaza por una capa propia de comportamiento (estilo Brain de Spartan) sin cambiar la API de Mimi. Registrar el resultado en la spec (sección 4, «Base técnica»).
  - **Resultado (13/10/2026): se sigue con aria** en Tabs (G1.9) y mimi-toolbar (G1.10). Teclado probado en Chrome real en los tres componentes; formularios con pruebas en el Select; aria y el CDK solo en rutas diferidas; NVDA lee bien la página del Select (prueba general del autor). Detalle y condición para revisar de nuevo, en la spec 4.
  - **Pruebas de alarma:** cada rodeo de la lista de abajo tiene una prueba que falla si aria cambia ese comportamiento. Se agregaron cinco al Select (`select.spec.ts`, con «alarma» en el nombre): el puntero activa la opción, la primera coincidencia al escribir, el panel montado durante la animación de salida, el clic en el panel que no mueve el foco y la letra con el panel cerrado.
  - **Error encontrado y corregido:** al escribir en el buscador, si la opción elegida seguía en la lista filtrada, quedaba activa ella y no la primera coincidencia. Es el tercer choque de la lista de abajo; la prueba que lo cubre ya no está omitida.

  La decisión pesó los rodeos que hizo falta en el menú (G1.3):
  - **Trigger propio:** `ngMenuTrigger` necesita `[menu]` en el botón del usuario, y eso no se puede dar sin `hostDirectives` que expongan aria ni sin el entry point `private`. Mimi pone `aria-haspopup`, `aria-expanded`, `aria-controls` y las teclas del botón.
  - **Foco inicial:** ninguna API pública enfoca el primer o el último ítem, así que Mimi envía Home/End al `ngMenu`. Lo cubre una prueba de alarma.
  - **Escape en el `ngMenu`:** aria detiene su propagación y el CDK nunca lo ve, así que Mimi lo escucha en el mismo elemento.
  - **Cierre y overlay a cargo de Mimi:** el `ngMenu` raíz sin trigger de aria está siempre «visible», no se cierra al elegir ni con Escape o Tab, y no posiciona nada.
  - **Contexto:** el contenido del usuario se pinta con el injector de dentro del `ngMenu`, para que los ítems lo encuentren por DI. Cada ítem lleva un `value` interno, porque aria lo exige y Mimi traduce `itemSelected`. aria tampoco maneja `aria-checked`.
  - **Reiniciar el menú (G1.4):** no hay API pública para reiniciar el ítem activo y los submenús al volver a abrir. Mimi recrea el `ngMenu` entero en cada apertura del Context Menu.
  - **Dato para la decisión (G1.4):** aria no aporta nada propio al menú contextual. La apertura, el punto, las teclas y el táctil son de Mimi y del CDK; aria solo da el teclado dentro del menú, igual que en el Dropdown.

  Y los del Select (G1.5), separados en dos tipos. Todos usan API pública de aria.

  **Lo que aria hace solo en el Select:** `role="combobox"`, `aria-expanded`, `aria-haspopup`, `aria-controls` y `aria-activedescendant` en el disparador (el foco no se mueve); abrir con ↓, Enter, Espacio y clic; la opción elegida activa al abrir; flechas con vuelta, Inicio/Fin y letra; saltar las deshabilitadas (`softDisabled` en falso); Escape; cerrar cuando el foco sale; `aria-selected`, `aria-disabled` y los grupos; y, con buscador, el input como combobox que maneja la lista sin perder el foco.

  **Pegamento** (integración normal):
  - **Elegir y cerrar:** el listbox no avisa al combobox. Mimi elige con el clic en una opción habilitada y, desde el teclado, con la opción activa (Enter, Espacio); luego cierra.
  - **Foco:** Mimi lo devuelve al disparador al elegir o cerrar, y evita que un clic en el panel lo mueva (`mousedown.preventDefault`); sin eso, aria cierra al hacer clic en una zona no enfocable.
  - **Clave interna:** aria compara por identidad. Cada opción lleva su posición en la lista completa y Mimi traduce con `compareWith`.
  - **Teclas con el panel cerrado:** aria exige los modificadores exactos, así que ↑, Alt+↓ y Alt+↑ los atiende Mimi escribiendo `expanded`.
  - **Espacio durante la búsqueda por letra:** aria lo toma como parte del texto; Mimi lleva la misma cuenta de tiempo para no elegir.
  - **Buscador (combobox doble):** un segundo `ngCombobox` dentro del panel (`alwaysExpanded`), como el ejemplo oficial `combobox-dialog`. Mimi lleva el foco al input al abrir, maneja Escape, Enter y Tab en él (Tab devuelve el foco al disparador para que siga desde ahí, porque el panel está fuera del orden del documento) y activa la primera coincidencia al escribir (`gotoFirst()`).
  - **El puntero activa la opción** (`gotoIndex()`): aria solo la activa con el teclado.
  - **Animación de salida:** `preserveContent` en el combobox, para que aria no destruya el panel al cerrar.
  - **Popup por fuera del overlay:** si el `ngComboboxPopup` va dentro, `aria-haspopup` desaparece con el panel cerrado.

  **Choque con el comportamiento de aria:**
  - **La opción elegida se desmarca** al volver a elegirla (Enter, Espacio o clic): aria usa `toggleOne` en la selección simple explícita y el valor queda vacío.
  - **aria vacía el valor al filtrar:** si la opción elegida queda fuera del filtro, o la lista está vacía por «cargando», el listbox emite `[]`.
  - En los dos casos Mimi no usa el `value` del listbox como valor: es solo lo que se pinta (el check y `aria-selected`), y se le vuelve a escribir cada vez que aria lo cambia. Lo cubren pruebas.
  - **aria vuelve a activar la opción elegida** cada vez que cambian las opciones, mientras no se haya usado el teclado en la lista. Al escribir en el buscador con la elegida todavía en la lista filtrada, quedaba activa ella y no la primera coincidencia, aunque Mimi llamara a `gotoFirst()` (con México elegido, «i» y Enter no cambiaban nada). Mimi lo contiene con una marca en la lista (`keepFirst`): desde que cambia la búsqueda, repone la primera opción habilitada cada vez que cambian las opciones o aria mueve la activa, hasta que el usuario la mueve con las flechas o con el puntero. Lo cubre la prueba «alarma: al escribir, la primera coincidencia queda activa aunque la elegida siga en la lista (gotoFirst)».

  **Pendiente:** con el panel cerrado, una letra no salta a la opción (el `<select>` nativo sí). aria no lo ofrece: cerrado solo atiende ↓, Enter y Espacio, y la lista no existe. Habría que escribir la búsqueda por letra en Mimi.

  **Comparado con el menú:** más rodeos en número, casi todos del buscador dentro del panel; ninguno usa API privada.

  Y los de Tabs (G1.9), con la misma separación. Todos usan API pública.

  **Pegamento:**
  - **Directivas de aria dentro de la plantilla de Mimi:** `ngTab` y `ngTabPanel` buscan a `ngTabs` por DI; exponerlas con `hostDirectives` está prohibido (spec 4).
  - **Ocultar los paneles:** aria solo les pone `inert`; Mimi los oculta con `hidden`.
  - **Pestaña por defecto:** sin valor aria no elige ninguna; Mimi elige la primera habilitada.
  - **Clic, Enter o Espacio en la pestaña que se pinta** mientras se espera otro valor: aria no emite (ya está elegida para él); Mimi toma la elección.

  **Choque con el comportamiento de aria:**
  - **aria vacía el modelo** si el valor no coincide con una pestaña (pestañas que llegan después, o la elegida que se quita). Mimi aplica la regla general de la spec 4: el valor vive en Mimi y nunca se toma el `undefined` de aria. Alarma: «alarma (choque 1)» en `tabs.spec.ts`.
  - **El `tabindex="0"` no sigue al valor después de interactuar**, y quitar la pestaña activa deja la fila sin entrada con Tab. Mimi recrea el `ngTabList` cuando el valor cambia desde fuera o cambian las pestañas, sin el foco dentro. Alarma: «alarma (choque 2)» en `tabs.spec.ts`.

  **Comparado con el Select:** menos rodeos (4 y 2 frente a 9 y 3); ninguno usa API privada.

- [x] G1.6 Dialog (servicio, X siempre visible), con `@angular/cdk/dialog`. Diseño: `F2 Overlays`.
  - **Dos formas de uso:** `MimiDialogService.open()` (base; devuelve un `MimiDialogRef` con `afterClosed()`) y `<mimi-dialog [(open)]>` en la plantilla, sobre el mismo servicio. Piezas: encabezado, título, descripción, cuerpo, pie y `[mimiDialogClose]`.
  - **Cierre:** `closeOnEscape` y `closeOnBackdropClick`, más `disableClose` como atajo. La X funciona siempre; `closeButton: false` la oculta solo para confirmaciones con sus propios botones (lo usará la G1.7).
  - **Por dentro:** solo API pública del CDK, sin extender su contenedor. Mimi abre un panel propio (`MimiDialogShell`) y atiende Escape y el fondo para animar la salida; el foco, el `aria-hidden` del resto de la página y el bloqueo del scroll son del CDK.
  - **Comprobado en Chrome real (CDP):** medidas del diseño; foco al primer campo y de vuelta al que abrió (también cuando lo abre un ítem del Dropdown: vuelve al botón del menú); Tab encerrado; salida animada con Escape, fondo y X; scroll bloqueado sin salto con barra clásica y con el header fijo en su sitio; Select dentro (encima, y Escape lo cierra primero); árbol de accesibilidad (`dialog` modal con nombre y descripción, resto de la página oculto); contenido largo con scroll en el cuerpo; y móvil a 360×640 (328px de ancho, `100dvh − 32px` de alto).
  - **JS inicial:** +0.40 kB. **CSS global:** +2.97 kB (queda en 101.28 kB; aviso en 105 kB).
  - **Después de la G1.7** (dos fallos vistos con el Confirm, arreglados en el servicio):
    - **Apilados:** con un diálogo encima de otro, el de abajo seguía en el árbol de accesibilidad (el CDK oculta el resto de la página, no los otros diálogos). Ahora lleva `aria-hidden` en su `hostElement` mientras el de arriba está abierto: se pone cuando el foco ya entró en el de arriba y se quita al empezar a cerrarse, antes de que vuelva el foco. Sin opción del CDK para esto; solo API pública (`OverlayRef.hostElement`).
    - **Desde un ítem de menú:** `open()` llamado en el evento del ítem recordaba el ítem como destino del foco, que ya no existía al cerrar (caía a `body`). Ahora el servicio abre después del render en curso, cuando el menú ya devolvió el foco a su botón. Confirm usa lo mismo (antes lo hacía por su cuenta). `afterClosed()` funciona desde el primer momento, y cerrar antes de que se abra descarta el diálogo.
    - Comprobado en Chrome: árbol de accesibilidad con un Confirm sobre un Dialog (solo el de arriba; al cerrarlo vuelve el de abajo, con el foco); foco al botón del menú con teclado y ratón; la comprobación completa del Dialog, sin cambios.
- [x] G1.7 Confirm sobre Dialog. Diseño: `F2 Overlays`.
  - **API:** `injectMimiConfirm()` devuelve `confirm(opciones): Promise<boolean>`. Se llama al declarar la propiedad: toma el injector del componente, y con él los textos de su ruta. Opciones: `title`, `description`, `confirmText`, `cancelText`, `tone` (`primary` o `danger`), `icon` (plantilla, opcional, sin ícono por defecto) y `class`.
  - **Sobre Dialog, sin tocarlo:** `alertdialog`, sin X, Escape = `false`, el clic en el fondo no cierra. Foco inicial en Cancelar con `danger` y en Confirmar con `primary`. Botones de 36px (`h-9 px-3.5`), como el diseño.
  - **Se abre después del render en curso.** Comprobado en Chrome: abierto en el mismo evento de un ítem del Dropdown, el foco volvía a `body` al cerrar (el diálogo recordaba el ítem, que ya no existía); ahora vuelve al botón del menú.
  - **Comprobado en Chrome real (CDP):** medidas del diseño (380px, relleno 20, separación 14, título 16px/700/1,3, descripción 13px/1,5, botones de 36px con 14px a los lados y 8 entre ellos, círculo de 40px con ícono de 20px); foco inicial por tono; Tab entre los dos botones; Enter, Espacio y Escape; el clic en el fondo no cierra; foco de vuelta al botón que abrió; árbol de accesibilidad (`alertdialog` modal con nombre y descripción; el ícono oculto); textos en español de la página y los de cada llamada; claro y oscuro; desde un Dropdown (teclado y ratón) y encima de un Dialog (Escape cierra solo el confirm y el foco vuelve al Dialog); móvil a 360×640 (328px).
  - **JS inicial:** +0.29 kB (la ruta y la entrada de la sidebar). **CSS global:** +0.69 kB (queda en 101.97 kB; aviso en 120 kB).
- [x] G1.8 Toast, estilo Sonner + Vuesax. Usa los tokens de T.1. Diseño: `F2 Toast Tabs Toolbar`.
  - **API:** `injectMimiToast()` con `toast()`, `success`, `info`, `warning`, `error`, `promise` y `dismiss`. Variantes `outline` y `solid`. `provideMimiToast({ position, duration, hotkey })`, opcional y global. Sin posición por toast: obligaría a manejar varias pilas a la vez (decidido en la G1.8); el ejemplo de posiciones muestra el código y una vista estática.
  - **Sin `<Toaster />`:** la pila se crea sola, al final de `body`, como popover; se vuelve a mostrar si otro popover (un Dialog) le quedó encima. Anuncios con el `LiveAnnouncer` del CDK.
  - **Accesibilidad:** con acción, sin tiempo; F8 y Escape; pausa con puntero, foco y pestaña oculta; los de atrás `inert`; el foco pasa al vecino al cerrarse; movimiento reducido.
  - **Comprobado en Chrome real (CDP):** medidas del diseño (340px a 16px del borde, 68px con una línea, relleno 12/40/12/14, X de 24px, ícono de 18px, título 14px/600, descripción 12.5px); pila colapsada (12px y 5 %, tres visibles, los demás inertes) y expandida con el puntero (8px; el hueco entre toasts no la colapsa); región «Notificaciones (F8)» antes del primer toast y anuncios (polite; assertive para error); F8, Tab y Escape (el foco vuelve al botón); con acción sigue a los 6.8 s; sin acción se cierra a los 6 s, y con el puntero encima no; promesa (cargando → éxito o error); encima de un Dialog abierto (con `aria-owns` del anunciador en el diálogo; Escape en el toast no cierra el diálogo); sólido con la sombra del tono; claro y oscuro; movimiento reducido; móvil a 360×640 (328px).
  - **JS inicial:** +0.19 kB (ruta y sidebar) y +0.28 kB por los textos en español en `app.config` (decidido por el usuario): +0.47 kB crudo en total. **CSS global:** +4.21 kB (queda en 106.18 kB; aviso en 120 kB).
- [x] G1.9 Tabs con indicador animado, estilo HeroUI, con `@angular/aria/tabs`. Después, la tarea 5.11. Diseño: `F2 Toast Tabs Toolbar`. Empezar con un spike de aria como en el Select y comparar la cuenta de rodeos.
  - **Spike (Chrome real):** aria da roles, foco itinerante, flechas con vuelta, Inicio/Fin, activación automática o manual, RTL, deshabilitadas y contenido diferido con `preserveContent`. **Rodeos: 4 de pegamento y 2 choques** (lista en la G1.5b). Borradores de dos issues para angular/components, fuera del repo.
  - **API:** `<mimi-tabs [(value)] variant preserveContent aria-label>` con `<ng-template mimiTab="valor" label [count] [disabled]>` (el contenido es el panel, diferido) y `<ng-template mimiTabLabel>` opcional para íconos. Sin `tone`. Deshabilitadas enfocables pero no elegibles.
  - **CLI:** el ítem `tabs` declara solo `@angular/aria`; la CLI agrega `@angular/cdk` con la misma versión cuando agrega aria y el proyecto no lo tiene (aria lo necesita).
  - **Comprobado en Chrome real (CDP):** medidas de las dos variantes (44px y 34px, 14px y 13,5px, contador de 20px, ícono de 15px, 14px hasta el panel); indicador con la curva del token en 0,45 s, alineado a la elegida después de clics, teclado, cambio de ancho de la ventana, letra de 20px y derecha a izquierda; sin transición con movimiento reducido; teclado (flechas con vuelta, Inicio/Fin, Tab al panel); deshabilitada enfocable y no elegible; los dos choques contenidos (valor desde un botón con el `tabindex="0"` en la elegida; valor que llega antes que su pestaña); árbol de accesibilidad; claro y oscuro; móvil a 360px (cuatro pestañas de 51px: las etiquetas se cortan con puntos suspensivos).
  - **JS inicial:** +0.23 kB (ruta y sidebar). **CSS global:** +3.30 kB (queda en 109.43 kB; aviso en 120 kB).
- [ ] G1.10 mimi-toolbar, con `@angular/aria/toolbar`, horizontal o vertical, inspirada en VsCanvasToolbar de Vuesax (sin modo Dock): píldora translúcida, ítem activo sobre un disco, anillo animado en hover y selección, tooltips, flechas, separadores, contadores, estado presionado y herramientas propias del usuario. Diseño: `F2 Toast Tabs Toolbar`. Empezar con un spike de aria como en el Select y comparar la cuenta de rodeos.
- [ ] G1.11 Pagination: píldora flotante compacta como mimi-toolbar (`[←] [input de página] / total [→] | registros por página`). Tamaño SM por defecto (hereda la altura global de control SM) y MD opcional; variantes flotante y en línea; en móvil, sin el selector de registros. Diseño: `F7 Pagination` (con `Pagination`).
- [ ] G1.12 Página «Accesibilidad y base técnica» del showcase, en Primeros pasos (ruta `/docs/foundations`), antes de publicar la 0.2.0. Contenido: qué usa Mimi por dentro (`@angular/aria` para teclado, foco y atributos ARIA; `@angular/cdk` para posicionar popups y diálogos; las dos son paquetes oficiales del equipo de Angular y `ng g mimi` las instala sola cuando un componente las necesita); por qué (la accesibilidad de un Select o de un menú es muy difícil de hacer bien a mano, y con los paquetes oficiales las correcciones llegan con `ng update`); qué es de Mimi y qué no (lo copiado es la estructura, los estilos y la API; el teclado y el foco vienen de aria; todo lo de Mimi se puede modificar); la garantía (la API de Mimi no depende de la de aria: si aria cambia, Mimi lo absorbe por dentro y el código del usuario sigue igual); una tabla de qué componentes usan cada paquete y cuáles ninguno (los de la 0.1.0); y una sección de accesibilidad con lo que Mimi garantiza en teclado, lectores de pantalla, movimiento reducido y contraste. Incluir también la regla de `class` (spec 4): «`class` va al elemento visible principal del componente; si además hay un panel aparte, se usa `panelClass`. En las directivas sobre un elemento del usuario, el panel recibe `<nombre>Class`», con la tabla de Popover, Tooltip, los menús y Select. Con la página: una línea en el README de la CLI sobre las dependencias nuevas y una pregunta frecuente en el CHANGELOG de la 0.2.0 («¿Por qué ahora se instalan @angular/aria y @angular/cdk?»).

Pendientes después del Grupo 1:

- [ ] Confirm con acción asíncrona (`onConfirm` que devuelve una promesa): «cargando» en Confirmar, sin cerrar hasta que termine y sin doble envío. El diseño no lo muestra (decidido en la G1.7). Trampas que encontró la revisión del plan:
  - **Doble clic en zoneless:** el `disabled` de `loading` llega en el render siguiente, no en el mismo evento; dos clics rápidos o Enter con autorrepetición llaman dos veces. Hace falta una marca `pending` que se revise antes de llamar.
  - **Foco a `body`:** al deshabilitarse el botón enfocado, el foco cae a `body`. Moverlo antes al contenedor del diálogo (`tabindex="-1"`), devolverlo a Confirmar si falla y poner `aria-busy` en el panel.
  - **`closeAll()` y navegación durante la acción:** cierran y resuelven `false` aunque la acción siga y quizá termine bien. Documentarlo o hacer que `closeAll()` respete el bloqueo.
  - **Cambio que exige en Dialog:** poder bloquear Escape y el fondo con el diálogo abierto. Propuesta: `disableClose` como signal en `MimiDialogRef`, leído en el momento en que llega Escape o el clic (hoy se calcula al abrir). Es API pública nueva de Dialog: spec 4, página de Dialog y pruebas.

## Grupo 2 → v0.3.0: entradas avanzadas

- [x] D2 Diseño: Grupo 2 y Theme Studio. Archivos: `F3 Archivos Tags Toggle Color` (con `Color Picker`), `F3 Combobox Fechas Hora`, `F3 Slider OTP Numero Mascara` y `Theme Studio`; variables en `mimi-variables-fase3.css` (en `tokens-mimi.css`). La hoja de tokens todavía no tiene tablas para estos componentes: se agregan antes de construirlos.
- [ ] G2.1 Toggle Group. Diseño: `F3 Archivos Tags Toggle Color`.
- [ ] G2.2 Number Input. Diseño: `F3 Slider OTP Numero Mascara`.
- [ ] G2.3 Password (mostrar/ocultar y medidor de seguridad). Diseño: `F3 Slider OTP Numero Mascara`.
- [ ] G2.4 Input Mask. Diseño: `F3 Slider OTP Numero Mascara`.
- [ ] G2.5 Input OTP. Diseño: `F3 Slider OTP Numero Mascara`.
- [ ] G2.6 Tags Input. Diseño: `F3 Archivos Tags Toggle Color`.
- [ ] G2.7 Slider (rango doble). Diseño: `F3 Slider OTP Numero Mascara`.
- [ ] G2.8 Combobox/Autocomplete (múltiple con chips). Diseño: `F3 Combobox Fechas Hora`.
- [ ] G2.9 Date Picker y Date Range. Diseño: `F3 Combobox Fechas Hora`.
- [ ] G2.10 Progress (barra y circular). Diseño: `F5 Estructura`.
- [ ] G2.11 File Upload, con Progress. Diseño: `F3 Archivos Tags Toggle Color`.
- [ ] G2.12 Color Picker (lo usa Theme Studio). Diseño: `Color Picker` (en `F3 Archivos Tags Toggle Color`).

## Theme Studio (después del Grupo 2; reemplaza la 5.2)

Solo sirve para editar los componentes de Mimi tal como existen: sin presets guardados, sin «Mis variantes» y sin tonos propios. Se construye solo con componentes de Mimi; si necesita uno que no está en el plan, se agrega. Ver spec, sección 4, «Theme Studio». Diseño: `Theme Studio` (corregir: quitar «Mis variantes» y agregar «Copiar prompt»; spec 13).

- [ ] T.2a Revisar en el diseño `--mimi-field-error` (la hoja dice `destructive-soft-foreground`; Mimi usa `destructive`, el color de la 0.1.0; spec 13). Diseñar en Claude Design las celdas provisionales de la V.1 (tono secondary, ghost y link con tono; spec 13), junto con la corrección del diseño de Theme Studio. Actualizar en el diseño los hovers de success, info y danger corregidos por contraste en la V.1. Definir en el diseño la animación de entrada y salida de los overlays (duración, curva y escala; hoy Popover usa los valores de `--mimi-transition`: 0,15 s, `cubic-bezier(.2,.8,.2,1)`, escala desde `--mimi-press-scale`) y, si conviene, un token propio. Definir también el margen mínimo de los overlays al borde de la pantalla: Popover y Tooltip usan 8px (`MIMI_VIEWPORT_MARGIN`, spec 13), que no está en el diseño. Tooltip: definir el ancho máximo (hoy `100vw − 16px`) y el margen del «salto sin retraso» (hoy 300 ms, como el retraso). Dropdown Menu (G1.3):
  - **Ancho:** el diseño mide 260px y el token `--mimi-menu-width`, 240px (el del Context Menu). Se usa el token.
  - **Submenú:** 200px sin token propio.
  - **Grupo radio** (`menuitemradio`): no está en el diseño. Es provisional, con un punto de 8px en la columna del ícono.
  - **Ítem deshabilitado con el foco de teclado:** el diseño no lo resalta. Mimi lo resalta para que se vea dónde está el foco.

  Context Menu (G1.4):
  - **Volteo:** el diseño mantiene el menú a 8px del borde. Mimi lo voltea a la izquierda o hacia arriba del punto, con el mismo margen. El diseño fijo no puede mostrar ese caso.
  - **Apertura con teclado:** el diseño no la muestra. Mimi lo abre junto al elemento enfocado, con los 8px del Dropdown.

  Select (G1.5):
  - **Alto máximo de la lista:** 280px (unas 8 opciones), sin token. No está en el diseño.
  - **Panel sin buscador:** el diseño siempre lo muestra. Mimi lo hace opcional (`search`); sin él, el mismo panel sin la barra.
  - **Anillos:** el diseño muestra el anillo de error siempre y el de foco mientras el panel está abierto. Mimi los muestra solo con el foco en el disparador, como Input. Con buscador, el foco está en el input del panel y el disparador queda sin anillo mientras está abierto.
  - **Sin opciones y sin búsqueda:** el diseño solo muestra «Sin resultados» con una búsqueda. Sin búsqueda, Mimi muestra el mismo bloque sin la segunda línea.
  - **`hint`:** el diseño lo muestra solo en la opción deshabilitada. Mimi lo muestra en cualquier opción que lo tenga.
  - **Volteo:** si el panel no cabe debajo, se abre encima, con los mismos 8px.
  - **Varios grupos:** el diseño muestra uno. Con varios, cada uno lleva su etiqueta, sin separador.

  Dialog (G1.6):
  - **Animación:** el diseño no la define. Mimi usa la de los demás overlays (0,15 s, escala desde `--mimi-press-scale`), y el fondo se desvanece en el mismo tiempo.
  - **Pantallas chicas y contenido largo:** no están en el diseño. Mimi deja 16px a cada borde (`100vw − 32px` de ancho máximo, `100dvh − 32px` de alto máximo) y pone el scroll en el cuerpo, con el encabezado y el pie fijos.
  - **Tamaños:** el diseño trae uno (420px). No hay sm, md ni lg; se cambia con `width`, `maxWidth` o `class`.
  - **Línea del título:** el diseño no da el interlineado; Mimi usa 1,25, como Popover.

  Confirm (G1.7):
  - **Botones de 36px:** ¿Button necesita un tamaño de 36px? Hoy solo tiene 40 y 32. El Confirm los fuerza con `h-9 px-3.5`.
  - **Ancho:** los 380px salen de la hoja de tokens; el diseño dibuja el panel fluido dentro de su recuadro.
  - **Ícono:** el diseño siempre muestra uno, distinto según el contenido (`upload`, `trash-2`). Mimi no pone uno por defecto; sin `icon` no hay círculo.
  - **Hover del botón de acción:** el diseño usa `color-mix(… 88%, background)`; Mimi usa el de Button (`-hover`, corregido por contraste en la V.1).
  - **Tono primary:** el círculo usa `info-soft` e `info-soft-foreground` (la variante «Neutral» del diseño), sin token propio.

  Toast (G1.8):
  - **Con acción, sin tiempo:** el diseño cierra a los 6 s también los que tienen acción («Reintentar»). Mimi no los cierra solos (WCAG 2.2.1).
  - **Región viva:** el diseño pone `aria-live` en la pila y `role="status"` en cada toast. Mimi anuncia con el `LiveAnnouncer` del CDK (una región aparte, que sigue funcionando con un diálogo modal abierto).
  - **Promesa:** el diseño muestra el resultado 4,7 s; Mimi usa la duración normal (6 s).
  - **Alto:** el diseño usa 68px fijos con elipsis en la pila; Mimi, alto natural con mínimo de 68px (zoom al 200 %), relleno vertical de 12px.
  - **Sólido sin tono y sólido con acción:** no están en el diseño. Sin tono se ve como la tarjeta; la acción en un sólido usa el `currentColor` al 16 % del círculo y de la X (24 % en hover).
  - **Posiciones, móvil, entrada y salida:** el diseño solo muestra `bottom-right`. Las otras cinco, el ancho en móvil (`100vw − 32px`), `safe-area-inset` (no se usa), la entrada (desde abajo o arriba con opacidad, 0,4 s) y la salida (0,3 s) no están en el diseño.
  - **Separación expandida:** 8px del diseño, sin token.
  - **Botón de acción de 28px:** igual que el de 36px de Confirm, no es un tamaño de Button.

  Tabs (G1.9):
  - **Deshabilitadas:** no están en el diseño. Mimi las muestra con `--mimi-disabled-opacity` y cursor de no permitido; se enfocan con las flechas pero no se eligen. Definir cómo se ven.
  - **Vertical:** fuera por ahora. Pendiente de diseño: el indicador y la píldora en vertical (aria ya maneja ↑/↓).
  - **Anchos distintos:** el indicador funciona con columnas iguales (porcentajes, sin medir). Pestañas de ancho propio no están soportadas, ni padding o gap propios en la píldora.
  - **Presión al pulsar:** el diseño usa 0,96 (subrayada) y 0,95 (píldora); Mimi usa `--mimi-press-scale` (0,975).
  - **Sin `tone`:** el diseño no tiene tonos para Tabs; el contador es fijo en `info-soft`.
  - **Alto de la píldora (34px) y duración del indicador (0,45 s):** sin token.
  - **Panel:** el diseño le da 4px 2px de relleno y 14px de separación con las pestañas (puede ser parte de la demo); Mimi los usa.
  - **Móvil:** con cuatro pestañas a 360px, cada una mide 51px y las etiquetas se cortan con puntos suspensivos. El diseño no muestra el caso.

- [ ] T.2 Modo Componente (estructura de Vuesax): lista de componentes a la izquierda; barra flotante arriba (mimi-toolbar) con Volver, Móvil/Tablet/Escritorio, Claro/Oscuro, fondo del lienzo, «Uno | Ver todos» (matriz tonos × variantes), «Código» y «Copiar prompt»; un solo componente en el lienzo; la tira de variantes abajo.
- [ ] T.3 Panel derecho: «Vista previa», que no se guarda (tono, estado, tamaño y texto), y «Estilo del componente», que sí se guarda (radio: Rounded, Squircle, Pill o un valor propio; borde; efectos: sombra, glow y escala al presionar). Cada propiedad muestra su origen (el token del que hereda, o «Mío»); pestaña «Variables» con todas las variables del componente y su cadena de herencia. Todo valor cambiado por el usuario se etiqueta «Mío».
- [ ] T.4 Modo Tema global: Simple (color principal, radio, densidad y fuente) y Avanzado (Marca, Estados, Superficies, Texto, Bordes, Forma, Profundidad, Movimiento y Tipografía), con parejas de color y su texto, indicador de contraste AA y vista previa en vivo. El color y los tamaños SM, MD y LG (compartidos por todos los controles) solo se editan aquí. Exportación de `mimi.preset.ts` para `provideMimiTheme()`.
- [ ] T.5 Radio «Squircle»: verificar el soporte actual de `corner-shape` y usarlo como mejora progresiva, con respaldo a `border-radius`.

## Blocks (después del Grupo 2)

Pantallas completas copiables con la CLI.

- [x] D5 Diseño: Blocks. Archivos: `F6 Blocks` (índice) y `Block <nombre>` de cada uno.
- [ ] B.1 Ítems de tipo `block` en el registro: `ng g mimi login-01` copia la pantalla y los componentes que usa.
- [ ] B.2 `login-01`. Diseño: `Block login-01`.
- [ ] B.3 `login-02`. Diseño: `Block login-02`.
- [ ] B.4 `signup-01` (registro). Diseño: `Block signup-01`.
- [ ] B.5 `otp-01` (código de verificación; usa Input OTP). Diseño: `Block otp-01`.
- [ ] B.6 `settings-01` (configuración). Diseño: `Block settings-01`.
- [ ] B.7 `pricing-01` (precios). Diseño: `Block pricing-01`.
- [ ] B.8 `dashboard-01` (usa Data Table: después del Grupo 3). Diseño: `Block dashboard-01`.
- [ ] B.9 `table-01` (tabla con filtros; usa Data Table: después del Grupo 3). Diseño: `Block table-01`.

## Grupo 3 → v0.4.0: datos

- [x] D3 Diseño: Grupo 3. Archivos: `F4 Command Tree Sortable`, `F4 Data Table y Pagination` (con `Data Table`) y `F4 Panel admin` (composición de referencia).
- [ ] G3.1 Tree. Diseño: `F4 Command Tree Sortable`.
- [ ] G3.2 Sortable List, con `@angular/cdk/drag-drop` y accesible con teclado. Diseño: `F4 Command Tree Sortable`.
- [ ] G3.3 Command (⌘K). Después, la tarea 5.8 (buscador de la documentación). Diseño: `F4 Command Tree Sortable`.
- [ ] G3.4 Data Table (ordenar, filtrar, paginar, seleccionar, columnas fijas). Usa Checkbox, Dropdown Menu y Pagination. Diseño: `Data Table` (en `F4 Data Table y Pagination`).

## Grupo 4 → v0.5.0: estructura

- [x] D4 Diseño: Grupo 4, Grupo 5 y Mimi Effects. Archivos: `F5 Estructura`, `F5 Dashboard y Media` y `F5 Effects`.
- [ ] G4.1 Accordion. Diseño: `F5 Estructura`.
- [ ] G4.2 Sheet/Drawer, flotante como el de shadcn (separado de los bordes, radio de tarjeta y barra de agarre en la versión inferior). Diseño: `F5 Estructura`.
- [ ] G4.3 Stepper. Diseño: `F5 Estructura`.

## Mimi Effects (prioridad baja, después del Grupo 3)

Inspirados en Magic UI. Todos respetan `prefers-reduced-motion`. Sin Globe, Icon Cloud ni partículas 3D (dependencias pesadas). Si se porta código de Magic UI (MIT), su aviso va en `THIRD_PARTY_NOTICES.md`. Diseño de todos: `F5 Effects` (keyframes en `mimi-effects.css`, también en `tokens-mimi.css`).

- [ ] E.1 Animated Theme Toggler.
- [ ] E.2 Terminal.
- [ ] E.3 Usar el Animated Theme Toggler y la Terminal en el showcase.
- [ ] E.4 Marquee.
- [ ] E.5 Bento Grid.
- [ ] E.6 Number Ticker.
- [ ] E.7 Border Beam / Shine Border.
- [ ] E.8 Magic Card.
- [ ] E.9 Blur Fade.
- [ ] E.10 Text Animate.
- [ ] E.11 Animated List.
- [ ] E.12 Confetti.
- [ ] E.13 Ripple.
- [ ] E.14 Fondos: Grid y Dot Pattern.
- [ ] E.15 Marcos Safari e iPhone.
- [ ] E.16 File Tree.
- [ ] E.17 Code Comparison.

## Grupo 5: según lo que pidan los usuarios

Prioridad según lo que pidan los usuarios después de la 0.2.0. Sin orden fijo.

- [ ] G5.1 Sidebar de dashboard. Diseño: `F5 Dashboard y Media`.
- [ ] G5.2 Time Picker. Diseño: `F3 Combobox Fechas Hora`.
- [ ] G5.3 Carousel. Diseño: `F5 Dashboard y Media`.
- [ ] G5.4 Image Preview (lightbox con zoom). Diseño: `F5 Dashboard y Media`.
- [ ] G5.5 Timeline. Diseño: `F5 Dashboard y Media`.
- [ ] G5.6 Resizable. Diseño: `F5 Dashboard y Media`.
- [ ] G5.7 Hover Card. Diseño: `F5 Dashboard y Media`.
- [ ] G5.8 Rating. Diseño: `F5 Dashboard y Media`.

## Plataforma y experiencia

Las tareas que eran la Fase 5. Conservan sus números porque el código y la spec los citan.

- [ ] 5.1 Schematic `theme` (preguntas + opciones `--palette`, `--radius`).
- ~~5.2 Página "Temas" con personalizador en vivo y exportación de `mimi.preset.ts`.~~ Reemplazada por Theme Studio (T.2–T.5).
- [ ] 5.3 Comando `mimi` (`pnpm mimi add button`, `mimi list`, `mimi theme`). Al hacerlo: volver a agregar la pestaña de pnpm en `InstallCommand` (hoy muestra `ng g mimi` y la forma larga) y actualizar la prueba de comandos prohibidos (`apps/docs/src/app/commands.spec.ts`) para permitir los que ya existan.
- [ ] 5.4 `mimi update`: combina la versión nueva con los cambios del usuario usando `.mimi/base/`. La base queda formateada con el Prettier del usuario (la CLI de Angular formatea lo que escriben los schematics), así que antes de combinar hay que formatear la plantilla nueva con el Prettier del proyecto; si no, las diferencias de formato se mezclarán con los cambios reales.
- [ ] 5.5 Página "Migrar desde PrimeNG / NG-ZORRO".
- [ ] 5.6 Documentación en español e inglés. Cuando exista la documentación en inglés, los READMEs (raíz y `packages/cli`) pasan a ser bilingües; hoy tienen solo una línea en inglés arriba.
- [x] 5.7 Publicar `@mimi-ng/cli` en npm: hecha en la 0.1.0 (ver Lanzamiento 0.1.0).
- [ ] 5.8 Buscador ⌘K en el header del showcase, con Command (G3.3).
- [ ] 5.9 Selector ES/EN en el header (el idioma va como prefijo en la ruta).
- [ ] 5.10 Navegación superior del header (Documentación · Componentes · Temas), como en el diseño. Revisado en la 2.12: todavía no aporta. Documentación y Componentes ya están a un clic (botones de la landing y sidebar), y «Temas» apuntaría a una página que no existe. Hacerla cuando exista Theme Studio, junto con el buscador ⌘K, que ocupa el mismo lugar del header; «Documentación» y «Componentes» viven bajo `/docs` y necesitan una regla propia para el estado activo, y en móvil irían en el panel.
- [x] 5.11 Cuando exista el componente Tabs (G1.9), reemplazar las pestañas hechas a mano de CodePreview e InstallCommand. Dato de la G1.9: los dos se usan solo en las páginas de componentes (lazy) y en `/dev/code`; ningún archivo del JS inicial contiene su código, así que usar Tabs sumaría 0 kB al JS inicial (el costo de aria Tabs iría a los chunks de esas páginas).
  - Hecho con `<mimi-tabs preserveContent>`: píldora en CodePreview (Copiar antes de las pestañas en el orden de Tab) y subrayado en `foreground` en InstallCommand, con las medidas de Tabs. El panel Código es diferido; el código se resalta por adelantado en tiempo libre (caché y `peek()` en `HighlighterService`) para que no aparezca sin colores. Se borró `tab-keys.ts`.
  - Arreglo en Tabs (ui-core): la fila y los paneles tenían `outline-none`, que en Tailwind 4 anula el `focus-visible:outline-2` (el anillo de foco del panel no se veía). Con prueba.
  - **Bundle:** JS inicial 326.31/102.64 → 326.27/102.64 kB (crudo/gzip; la diferencia son los nombres de los chunks). CSS global 109.43/16.46 → 108.84/16.39 kB. El chunk compartido de CodePreview pasa de 25.34/5.78 a 66.03/17.96 kB (entra aria Tabs): una página sin aria (Button) carga +40.91/+12.28 kB; las que ya usaban aria (Select, Dialog) +11.4/+2.0 kB; Tabs −3.68/−2.41 kB.
- [ ] 5.12 GitHub Actions: pruebas de la CLI en proyectos limpios con cada versión de Angular soportada.
- [ ] 5.13 Tabla de compatibilidad en la documentación.
- [ ] 5.14 Prerender del showcase: páginas estáticas y 404 con estado real (hoy el modo SPA de Cloudflare responde 200 y la 404 lleva `noindex`). Revisar `not_found_handling` en `wrangler.jsonc` (pasaría a `404-page` con un `404.html`).
- [ ] 5.15 Badge interactivo: variante de Badge sobre `a[mimiBadge]` o `button[mimiBadge]`, con hover y foco (mejora de un componente existente, no un componente nuevo).
- [ ] 5.16 Landing v2: rediseño de la landing según `Landing v2` (`docs/design/Mimi Landing v2.dc.html`), manteniendo el lema «Los componentes son tuyos. Las actualizaciones también.» como titular (spec, sección 1). Usa Mimi Effects (Marquee, Terminal…) cuando existan; textos según la regla de la spec, sección 5.
- [ ] 5.17 Revisión móvil componente por componente, después del Grupo 1: cómo se usa cada uno en pantallas chicas. Por ejemplo, en móvil el Select se abre como un panel flotante tipo modal en la parte superior, con buscador y más opciones visibles.

## Versión 1.0

Cambios que rompen, acumulados para la 1.0 (spec, sección 12, «Compatibilidad que se quita en la 1.0»).

- [ ] 1.0-1 Quitar alias destructive-soft → destructive-ring y renombrar destructive-soft-bg → destructive-soft. Antes, la nota de versión pide buscar `destructive-soft` en el proyecto y cambiarlo a `destructive-ring` (el código copiado con `ring-destructive-soft` seguiría compilando con otro color, sin error); `mimi update` (5.4) avisa si encuentra esa clase.
- [ ] 1.0-2 Quitar los atajos de variante de Button y Badge (`variant="default|secondary|destructive"`): en la nota de versión, `variant="destructive"` → `tone="danger"`, `variant="secondary"` → `tone="secondary"` y `variant="default"` se borra; y los selectores CSS propios sobre `[data-variant="destructive"]` → `[data-tone="danger"]` (spec 12).
- [ ] 1.0-3 Dejar de aceptar `"style": "vivid"` en `mimi.json` como sinónimo de `"mimi"` (la 0.1.0 lo escribe; spec 12). Decidir entonces si la CLI lo corrige al leerlo o si avisa.
- [ ] 1.0-4 Quitar los nombres de tokens de la 0.1.0 (spec 12): `--mimi-btn-padding-x` y `components.button.paddingX`, `--mimi-input-padding-x` y `components.input.paddingX`, `--mimi-input-placeholder-color` y `components.input.placeholderColor`, y `radii.badge` (queda `components.badge.radius`), con sus avisos de `provideMimiTheme`.

## Decisiones pendientes

- [x] Estilo del MVP: un solo tema base, Mimi («Mimi» de fábrica, «Mi tema» cuando el usuario lo cambia).
- [x] Formularios: Signal Forms, Reactive Forms y ngModel. Campos nativos detectan FormField o NgControl; controles propios con FormValueControl (spec, sección 8).
- [x] Idioma por defecto de los mensajes de error: inglés. `MIMI_ERROR_MESSAGES_ES` trae el español: `provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)` (el showcase lo usa). Ver spec, sección 8.
- [x] Versión exacta de Node.js y TypeScript según los requisitos de Angular 22 (ver spec, sección 2).
- [x] Variantes propias en `mimi.preset.ts`: no se harán. Theme Studio solo edita los componentes tal como existen (spec, sección 4).
