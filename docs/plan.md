# Plan de desarrollo de Mimi

Marca `[x]` al terminar cada tarea. Una tarea por sesión de Claude Code (usa `/clear` entre tareas).

## Fase 0: Preparación (la haces tú, fuera de Claude Code)

- [x] 0.1 Instalar Node.js (versión LTS compatible con Angular 22, ver angular.dev), pnpm y git.
- [ ] 0.2 Generar los diseños en Claude Design y guardarlos en `docs/design/`.
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

## Fase 4: Componentes con overlays

- [ ] 4.1 Select (estilo NG-ZORRO, con todos sus estados).
- [ ] 4.2 Dialog (servicio, X siempre visible).
- [ ] 4.3 Evaluar @angular/aria (estable en v22) en lugar de @angular/cdk para Select y Tabs.

## Fase 5: Experiencia y lanzamiento

- [ ] 5.1 Schematic `theme` (preguntas + opciones `--palette`, `--radius`).
- [ ] 5.2 Página "Temas" con personalizador en vivo y exportación de `mimi.preset.ts`.
- [ ] 5.3 Comando `mimi` (`pnpm mimi add button`, `mimi list`, `mimi theme`). Al hacerlo: volver a agregar la pestaña de pnpm en `InstallCommand` (hoy muestra `ng g ui` y la forma larga) y actualizar la prueba de comandos prohibidos (`apps/docs/src/app/commands.spec.ts`) para permitir los que ya existan.
- [ ] 5.4 `mimi update`: combina la versión nueva con los cambios del usuario usando `.mimi/base/`. La base queda formateada con el Prettier del usuario (la CLI de Angular formatea lo que escriben los schematics), así que antes de combinar hay que formatear la plantilla nueva con el Prettier del proyecto; si no, las diferencias de formato se mezclarán con los cambios reales.
- [ ] 5.5 Página "Migrar desde PrimeNG / NG-ZORRO".
- [ ] 5.6 Documentación en español e inglés.
- [ ] 5.7 Publicar `@mimi-ng/cli` en npm.
- [ ] 5.8 Buscador ⌘K en el header del showcase.
- [ ] 5.9 Selector ES/EN en el header (el idioma va como prefijo en la ruta).
- [ ] 5.10 Navegación superior del header (Documentación · Componentes · Temas), como en el diseño. Revisado en la 2.12: todavía no aporta. Documentación y Componentes ya están a un clic (botones de la landing y sidebar), y «Temas» apuntaría a una página que no existe. Hacerla cuando exista la página de Temas, junto con el buscador ⌘K, que ocupa el mismo lugar del header; «Documentación» y «Componentes» viven bajo `/docs` y necesitan una regla propia para el estado activo, y en móvil irían en el panel.
- [ ] 5.11 Cuando exista el componente Tabs (catálogo «Después»), reemplazar las pestañas hechas a mano de CodePreview e InstallCommand.
- [ ] 5.12 GitHub Actions: pruebas de la CLI en proyectos limpios con cada versión de Angular soportada.
- [ ] 5.13 Tabla de compatibilidad en la documentación.

## Decisiones pendientes

- [x] Estilo del MVP: solo Vivid (por defecto).
- [x] Formularios: Signal Forms, Reactive Forms y ngModel. Campos nativos detectan FormField o NgControl; controles propios con FormValueControl (spec, sección 8).
- [x] Idioma por defecto de los mensajes de error: inglés. `MIMI_ERROR_MESSAGES_ES` trae el español: `provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)` (el showcase lo usa). Ver spec, sección 8.
- [x] Versión exacta de Node.js y TypeScript según los requisitos de Angular 22 (ver spec, sección 2).
