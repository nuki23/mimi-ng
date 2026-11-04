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
- [ ] 5.16 Landing v2: rediseño de la landing según `Landing v2` (`docs/design/Mimi Landing v2.dc.html`), manteniendo el lema «Los componentes son tuyos. Las actualizaciones también.» como titular (spec, sección 1). Usa Mimi Effects (Marquee, Terminal…) cuando existan; textos según la regla de la spec, sección 5.
  - Depende de: E.2, E.4 (si se usan; «cuando existan»)
