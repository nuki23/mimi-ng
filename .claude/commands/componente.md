---
description: Crea un componente de Mimi completo (código, página del showcase y pruebas)
argument-hint: <nombre del componente, ej. badge>
---

Crea el componente **$ARGUMENTS** de Mimi siguiendo estos pasos en orden:

1. Lee en `docs/spec.md` la sección del catálogo y todo lo que mencione a $ARGUMENTS (selector, variantes, estados).
2. Revisa en `docs/design/` cómo se ve $ARGUMENTS en todos sus estados y qué variables usa.
3. Propón un plan breve (archivos, API pública, variantes) y espera mi aprobación antes de escribir código.
4. Crea el componente en `packages/ui-core/src/lib/components/$ARGUMENTS/`:
   - El archivo del componente o directiva, cumpliendo todas las reglas de `CLAUDE.md` (signals, OnPush, `cva` con clases literales, input `class` mezclado con `cn()`, atributos `data-*`, cero colores fijos, accesibilidad).
   - `index.ts` que exporte todo. Si tiene subcomponentes, exporta también un arreglo `Mimi<Nombre>Imports`.
   - Pruebas unitarias de sus variantes, estados y accesibilidad.
5. Exporta el componente desde el `index.ts` de `ui-core`.
6. Crea su página en `apps/docs/src/app/pages/docs/components/$ARGUMENTS.page.ts`:
   - Título, descripción y comandos de instalación (`pnpm mimi add $ARGUMENTS` / `ng g @mimi-ng/cli:ui $ARGUMENTS`).
   - Un `CodePreview` por cada variante y estado.
   - Un ejemplo personalizando con `class`.
   - Tabla de API (input, tipo, valor por defecto, descripción).
7. Agrega la ruta y el enlace en el sidebar.
8. Verifica que `pnpm build` y `pnpm test` pasen, y que se vea bien en claro y oscuro.
9. Marca la tarea en `docs/plan.md` y resume qué creaste.
