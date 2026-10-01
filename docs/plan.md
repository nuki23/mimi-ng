# Plan de desarrollo de Mimi

Marca `[x]` al terminar cada tarea. Una tarea por sesión de Claude Code (usa `/clear` entre tareas).

## Fase 0: Preparación (la haces tú, fuera de Claude Code)

- [x] 0.1 Instalar Node.js (versión LTS compatible con Angular 22, ver angular.dev), pnpm y git.
- [x] 0.2 Generar los diseños en Claude Design y guardarlos en `docs/design/`.
- [x] 0.3 Elegir el estilo del MVP: solo Vivid, como estilo por defecto.
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

- [ ] 0.1.1-1 `ng add @mimi-ng/cli --icons=false` falla con "Data path "/icons" must be boolean": `ng add` pasa el valor como texto (antes de instalar el paquete no conoce su esquema). `--icons` sí funciona. Investigar en `@angular/cli` (`commands/add`) cómo se pasan las opciones y si alcanza con aceptar también `"true"`/`"false"` en el esquema o en `init`; probar `--icons=false` y `--no-icons` en un proyecto limpio.
- [ ] 0.1.1-2 pnpm 12 creó un `pnpm-workspace.yaml` en el proyecto del usuario con `minimumReleaseAgeExclude: ['@mimi-ng/cli@0.1.0']` al instalar una versión de pocas horas (política de antigüedad mínima de pnpm). No impidió nada. Confirmar el mecanismo y el valor por defecto de `minimumReleaseAge` en pnpm 12, y decidir si la página de Instalación lo menciona (junto a la nota de pnpm).

## Hoja de ruta del catálogo

Criterio (spec, sección 4): solo componentes funcionales y difíciles de hacer bien a mano (teclado, accesibilidad, overlays, estados). Cada grupo es una versión menor. Antes de cada grupo va su tarea de diseño en Claude Design (D1–D5): colores, radios y sombras salen de `docs/design/`, nunca inventados. Inspiración y dependencias de cada componente: spec, sección 4, «Hoja de ruta».

Orden: Fase 4 → Grupo 1 → Grupo 2 → Theme Studio y Blocks → Grupo 3 → Grupo 4. Mimi Effects tiene prioridad baja y puede empezar después del Grupo 3. El Grupo 5 se prioriza según lo que pidan los usuarios después de la 0.2.0.

## Fase 4: Preparación del catálogo ampliado

- [ ] 4.3 Evaluar @angular/aria (estable en v22) frente a @angular/cdk. Decide cómo se construyen la mayoría de los componentes: base de overlays y posicionamiento, listbox, menús, tabs y el patrón toolbar. Registrar la decisión en la spec (secciones 2 y 4).
- [ ] D1 Diseño en Claude Design: tokens nuevos, Grupo 1 (incluida Pagination) y mimi-toolbar.
- [ ] T.1 Tokens nuevos (los necesita Toast), con los valores de D1: colores semánticos `success`, `warning` e `info` (claro y oscuro, con sus `-foreground` y sombras de color) y `--mimi-glow` (sombra de color con `color-mix`). Registrarlos en `theme-base.css`, `types.ts`, `mimiThemeToCss` y `cn.ts` (sombras para tailwind-merge), con pruebas.

## Grupo 1 → v0.2.0: overlays y navegación

- [ ] G1.1 Popover. Base de posicionamiento de los demás overlays.
- [ ] G1.2 Tooltip.
- [ ] G1.3 Dropdown Menu (submenús, búsqueda por letra).
- [ ] G1.4 Context Menu, sobre Dropdown Menu.
- [ ] G1.5 Select, estilo NG-ZORRO, con `FormValueControl` (spec 8). Al hacerlo, completar `MimiComponentTokens` en `theme/types.ts` (hoy tiene el comentario «select y dialog se agregan en la Fase 4»).
- [ ] G1.6 Dialog (servicio, X siempre visible).
- [ ] G1.7 Confirm: `mimi.confirm()` sobre Dialog.
- [ ] G1.8 Toast, estilo Sonner + Vuesax. Usa los tokens de T.1.
- [ ] G1.9 Tabs con indicador animado, estilo HeroUI. Después, la tarea 5.11.
- [ ] G1.10 mimi-toolbar, horizontal o vertical, inspirada en VsCanvasToolbar de Vuesax: píldora translúcida, ítem activo sobre un disco, anillo animado en hover y selección, tooltips, flechas, separadores, contadores, estado presionado y herramientas propias del usuario.
- [ ] G1.11 Pagination: píldora flotante como mimi-toolbar (`[←] [input de página] / total [→] | select de registros por página`), con variantes flotante y en línea.

## Grupo 2 → v0.3.0: entradas avanzadas

- [ ] D2 Diseño en Claude Design: Grupo 2 y Theme Studio.
- [ ] G2.1 Toggle Group.
- [ ] G2.2 Number Input.
- [ ] G2.3 Password (mostrar/ocultar y medidor de seguridad).
- [ ] G2.4 Input Mask.
- [ ] G2.5 Input OTP.
- [ ] G2.6 Tags Input.
- [ ] G2.7 Slider (rango doble).
- [ ] G2.8 Combobox/Autocomplete (múltiple con chips).
- [ ] G2.9 Date Picker y Date Range.
- [ ] G2.10 Progress (barra y circular).
- [ ] G2.11 File Upload, con Progress.
- [ ] G2.12 Color Picker (lo usa Theme Studio).

## Theme Studio (después del Grupo 2; reemplaza la 5.2)

Construido con componentes de Mimi (mimi-toolbar, Toggle Group, Select, Color Picker, Switch, Input). Ver spec, sección 4.

- [ ] T.2 Estructura: sidebar con la lista de componentes y su número de variantes, lienzo con un solo componente, tira de variantes debajo y panel de propiedades a la derecha (variante, tamaño, tono, radio, texto, block, deshabilitado, cargando, solo ícono, glow…) con «Propiedades actuales» en JSON.
- [ ] T.3 Botones «Código» (el HTML generado, para copiar) y «Copiar prompt».
- [ ] T.4 Modo «Tema global»: tokens de todo Mimi (colores, radios, alturas, sombras, movimiento) con exportación de `mimi.preset.ts`. En cada control, opciones prediseñadas más «Personalizado» con un campo libre validado (por ejemplo, un radio de 14px). Presets propios con nombre, importar y exportar.
- [ ] T.5 Radio «Squircle»: verificar el soporte actual de `corner-shape` y proponerlo como mejora progresiva, con respaldo a `border-radius`.

## Blocks (después del Grupo 2)

Pantallas completas copiables con la CLI.

- [ ] D5 Diseño en Claude Design: Blocks.
- [ ] B.1 Ítems de tipo `block` en el registro: `ng g mimi login-01` copia la pantalla y los componentes que usa.
- [ ] B.2 Login.
- [ ] B.3 Registro.
- [ ] B.4 Configuración.
- [ ] B.5 Dashboard.
- [ ] B.6 Tabla con filtros (cuando exista Data Table, G3.4).
- [ ] B.7 Precios.

## Grupo 3 → v0.4.0: datos

- [ ] D3 Diseño en Claude Design: Grupo 3.
- [ ] G3.1 Tree.
- [ ] G3.2 Sortable List, con `@angular/cdk/drag-drop` y accesible con teclado.
- [ ] G3.3 Command (⌘K). Después, la tarea 5.8 (buscador de la documentación).
- [ ] G3.4 Data Table (ordenar, filtrar, paginar, seleccionar, columnas fijas). Usa Checkbox, Dropdown Menu y Pagination.

## Grupo 4 → v0.5.0: estructura

- [ ] D4 Diseño en Claude Design: Grupo 4, Grupo 5 y Mimi Effects.
- [ ] G4.1 Accordion.
- [ ] G4.2 Sheet/Drawer, flotante como el de shadcn (separado de los bordes, radio de tarjeta y barra de agarre en la versión inferior).
- [ ] G4.3 Stepper.

## Mimi Effects (prioridad baja, después del Grupo 3)

Inspirados en Magic UI. Todos respetan `prefers-reduced-motion`. Sin Globe, Icon Cloud ni partículas 3D (dependencias pesadas). Si se porta código de Magic UI (MIT), su aviso va en `THIRD_PARTY_NOTICES.md`. Su diseño va en D4.

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

- [ ] G5.1 Sidebar de dashboard.
- [ ] G5.2 Time Picker.
- [ ] G5.3 Carousel.
- [ ] G5.4 Image Preview.
- [ ] G5.5 Timeline.
- [ ] G5.6 Resizable.
- [ ] G5.7 Hover Card.
- [ ] G5.8 Rating.

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
- [ ] 5.11 Cuando exista el componente Tabs (G1.9), reemplazar las pestañas hechas a mano de CodePreview e InstallCommand.
- [ ] 5.12 GitHub Actions: pruebas de la CLI en proyectos limpios con cada versión de Angular soportada.
- [ ] 5.13 Tabla de compatibilidad en la documentación.
- [ ] 5.14 Prerender del showcase: páginas estáticas y 404 con estado real (hoy el modo SPA de Cloudflare responde 200 y la 404 lleva `noindex`). Revisar `not_found_handling` en `wrangler.jsonc` (pasaría a `404-page` con un `404.html`).
- [ ] 5.15 Badge interactivo: variante de Badge sobre `a[mimiBadge]` o `button[mimiBadge]`, con hover y foco (mejora de un componente existente, no un componente nuevo).

## Decisiones pendientes

- [x] Estilo del MVP: solo Vivid (por defecto).
- [x] Formularios: Signal Forms, Reactive Forms y ngModel. Campos nativos detectan FormField o NgControl; controles propios con FormValueControl (spec, sección 8).
- [x] Idioma por defecto de los mensajes de error: inglés. `MIMI_ERROR_MESSAGES_ES` trae el español: `provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)` (el showcase lo usa). Ver spec, sección 8.
- [x] Versión exacta de Node.js y TypeScript según los requisitos de Angular 22 (ver spec, sección 2).
