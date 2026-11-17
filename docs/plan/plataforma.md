# Plan: plataforma y experiencia

[← Índice del plan](../plan.md)

## Plataforma y experiencia

Las tareas que eran la Fase 5. Conservan sus números porque el código y la spec los citan. La 5.2 y la 5.17 (con 5.17a y 5.17b) están en el Grupo 2; la 5.7 y la 5.11, en «Terminado».

- [ ] 5.1 Schematic `theme` (preguntas + opciones `--palette`, `--radius`).
- [ ] 5.3 Comando `mimi` (`pnpm mimi add button`, `mimi list`, `mimi theme`). Al hacerlo: volver a agregar la pestaña de pnpm en `InstallCommand` (hoy muestra `ng g mimi` y la forma larga) y actualizar la prueba de comandos prohibidos (`apps/docs/src/app/commands.spec.ts`) para permitir los que ya existan.
- [ ] 5.4 `mimi update`: combina la versión nueva con los cambios del usuario usando `.mimi/base/`. La base queda formateada con el Prettier del usuario (la CLI de Angular formatea lo que escriben los schematics), así que antes de combinar hay que formatear la plantilla nueva con el Prettier del proyecto; si no, las diferencias de formato se mezclarán con los cambios reales.
- [ ] 5.5 Página "Migrar desde PrimeNG / NG-ZORRO".
- [ ] 5.6 Documentación en español e inglés. Cuando exista la documentación en inglés, los READMEs (raíz y `packages/cli`) pasan a ser bilingües; hoy tienen solo una línea en inglés arriba.
- [ ] 5.8 Buscador ⌘K en el header del showcase, con Command (G3.3).
  - Depende de: G3.3
- [ ] 5.9 Selector ES/EN en el header (el idioma va como prefijo en la ruta).
- [ ] 5.10 Navegación superior del header (Documentación · Componentes · Temas), como en el diseño. Revisado en la 2.12: todavía no aporta. Documentación y Componentes ya están a un clic (botones de la landing y sidebar), y «Temas» apuntaría a una página que no existe. Hacerla cuando exista la página «Tema» (5.2), junto con el buscador ⌘K, que ocupa el mismo lugar del header; «Documentación» y «Componentes» viven bajo `/docs` y necesitan una regla propia para el estado activo, y en móvil irían en el panel.
  - Depende de: 5.2, 5.8
- [ ] 5.12 GitHub Actions: pruebas de la CLI en proyectos limpios con cada versión de Angular soportada.
- [ ] 5.13 Tabla de compatibilidad en la documentación.
- [ ] 5.14 Prerender del showcase: páginas estáticas y 404 con estado real (hoy el modo SPA de Cloudflare responde 200 y la 404 lleva `noindex`). Revisar `not_found_handling` en `wrangler.jsonc` (pasaría a `404-page` con un `404.html`).
- [ ] 5.15 Badge interactivo: variante de Badge sobre `a[mimiBadge]` o `button[mimiBadge]`, con hover y foco (mejora de un componente existente, no un componente nuevo).
- ~~5.16 Landing v2~~ **Quitada el 14/11/2026** (decidido por el usuario: no hay rediseño global y la landing actual es la definitiva). Era el rediseño de la landing según `docs/design/Mimi Landing v2.dc.html`, con Mimi Effects. El ID no se reutiliza (regla 4 del plan).
- [ ] 5.18 Migraciones automáticas con `ng update` · **después de la 1.0** · sin tamaño (idea, sin detallar). Anotada a pedido del usuario el 16/11/2026, al preparar la 0.7.0 (`docs/auto/release-0.7.0-2026-11-16.md`, paso 2). Desde la 1.0.0 los cambios son compatibles y lo que se quite vive al menos una versión menor como obsoleto (spec 12, «Rupturas y obsoletos»); la idea es que `ng update @mimi-ng/cli` traiga, además, schematics de migración (`migrations` en `package.json`, `ng-update` de Angular) que reescriban el código del usuario cuando un nombre obsoleto se quite: por ejemplo, un atributo en las plantillas o un token del preset. Preguntas para cuando se detalle: cómo convive con la regla de todo o nada y con los archivos modificados por el usuario (spec 5; los componentes copiados son suyos), si toca solo el código del usuario o también sus copias de los componentes, y su relación con `mimi update` (5.4).
