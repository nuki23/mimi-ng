# Plan de desarrollo de Mimi

Marca `[x]` al terminar cada tarea. Una tarea por sesión de Claude Code (usa `/clear` entre tareas).

## Fase 0: Preparación (la haces tú, fuera de Claude Code)

- [ ] 0.1 Instalar Node.js (versión LTS compatible con Angular 22, ver angular.dev), pnpm y git.
- [ ] 0.2 Generar los diseños en Claude Design y guardarlos en `docs/design/`.
- [x] 0.3 Elegir el estilo del MVP: solo Vivid, como estilo por defecto.
- [ ] 0.4 `git init` y primer commit con estos documentos.

## Fase 1: Base

- [x] 1.1 Monorepo: `pnpm-workspace.yaml`, `package.json` raíz con scripts (`dev`, `build`, `test`), `tsconfig.base.json` con alias a `packages/ui-core`.
- [x] 1.2 `apps/docs` con Angular 22 (zoneless, Tailwind 4) y `packages/ui-core` vacío. Verificar que el showcase arranque con `pnpm dev`.
- [ ] 1.3 Tokens: `ui-core/src/lib/theme/theme-base.css` con las variables `--mimi-*` de `docs/design/`, claro y oscuro, y el bloque `@theme inline`. `@source` a `ui-core` en el `styles.css` del showcase.
- [ ] 1.4 Utils: `cn.ts` y `control-styles.ts`.
- [ ] 1.5 Tema: `types.ts` y `provideMimiTheme()` (inyecta un `<style>`, no estilos en línea). Probar cambiando el primario.
- [ ] 1.6 Layout del showcase: header, sidebar, contenido, TOC, botón claro/oscuro.
- [ ] 1.7 `CodePreview` (pestañas Preview/Código, botón copiar, resaltado con Shiki).

## Fase 2: Componentes básicos

Usar el comando `/componente <nombre>` para cada uno.

- [ ] 2.1 Button
- [ ] 2.2 Input
- [ ] 2.3 Textarea
- [ ] 2.4 Badge
- [ ] 2.5 Card
- [ ] 2.6 Separator
- [ ] 2.7 Skeleton
- [ ] 2.8 Avatar
- [ ] 2.9 Switch
- [ ] 2.10 Checkbox
- [ ] 2.11 FormField + FormError (y error automático en Input y Textarea)
- [ ] 2.12 Página de inicio del showcase (landing) con el formulario de vitrina

## Fase 3: CLI básica

- [ ] 3.1 `packages/cli` con Angular Schematics y `registry.json` (con `dependencies` y `registryDependencies`).
- [ ] 3.2 Script de build que copia `ui-core/src/lib/**` a las plantillas de la CLI.
- [ ] 3.3 Schematic `init`: dependencias, variables en `styles.css`, `@source`, utils, alias en `tsconfig.json`, `mimi.json`, pregunta opcional por `@lucide/angular`.
- [ ] 3.4 Schematic `ng-add` que ejecuta `init`.
- [ ] 3.5 Schematic `ui`: varios componentes a la vez, menú si no hay nombres, guarda la copia original en `.mimi/base/`, no sobrescribe sin `--overwrite`.
- [ ] 3.6 Registrar la colección en `schematicCollections` para permitir `ng g ui button`.
- [ ] 3.7 Probar la CLI en un proyecto Angular 22 limpio, fuera del monorepo.

## Fase 4: Componentes con overlays

- [ ] 4.1 Select (estilo NG-ZORRO, con todos sus estados).
- [ ] 4.2 Dialog (servicio, X siempre visible).

## Fase 5: Experiencia y lanzamiento

- [ ] 5.1 Schematic `theme` (preguntas + opciones `--palette`, `--radius`).
- [ ] 5.2 Página "Temas" con personalizador en vivo y exportación de `mimi.preset.ts`.
- [ ] 5.3 Comando `mimi` (`pnpm mimi add button`, `mimi list`, `mimi theme`).
- [ ] 5.4 `mimi update`: combina la versión nueva con los cambios del usuario usando `.mimi/base/`.
- [ ] 5.5 Página "Migrar desde PrimeNG / NG-ZORRO".
- [ ] 5.6 Documentación en español e inglés.
- [ ] 5.7 Publicar `@mimi-ng/cli` en npm.

## Decisiones pendientes

- [x] Estilo del MVP: solo Vivid (por defecto).
- [ ] Formularios: Reactive Forms, Signal Forms o ambos (revisar el estado de Signal Forms en Angular 22).
- [ ] Idioma por defecto de los mensajes de error.
- [x] Versión exacta de Node.js y TypeScript según los requisitos de Angular 22 (ver spec, sección 2).
