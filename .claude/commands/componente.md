---
description: Crea un componente de Mimi completo (código, página del showcase y pruebas)
argument-hint: <nombre del componente, ej. badge>
---

Crea el componente **$ARGUMENTS** de Mimi siguiendo estos pasos en orden. Cumple siempre `CLAUDE.md`.

## 1. Antes de escribir código

1. Busca la tarea de $ARGUMENTS en `docs/plan.md` y **lee sus notas propias** (por ejemplo, la 2.1 pide `tabindex="-1"` en `a[mimiBtn]` con `aria-disabled` y reemplazar los botones del layout del showcase por `mimiBtn`). Cumple todas.
2. Lee en `docs/spec.md` el catálogo (sección 4) y todo lo que mencione a $ARGUMENTS: selector, variantes, tamaños, estados, formularios (sección 8).
3. Revisa $ARGUMENTS en `docs/design/Mimi Componentes.dc.html`: medidas, estados (normal, hover, foco, deshabilitado, cargando, error…), claro y oscuro.
4. Todo sale de ese diseño y de los tokens existentes (`packages/ui-core/src/lib/theme/theme-base.css`, clases de la spec 6.1). **No inventes valores.** Si falta algo o el diseño se contradice, pregúntame.
5. Propón un plan breve (archivos, API pública, variantes, tokens, decisiones) y **espera mi aprobación**.

## 2. El componente, en `packages/ui-core/src/lib/components/$ARGUMENTS/`

- Archivo del componente o directiva con las reglas de `CLAUDE.md`: OnPush, `input()`/`output()`/`model()`, objeto `host`, `inject()` en propiedades, control de flujo nuevo, zoneless.
- Elementos nativos (`button`, `input`, `textarea`, `a`) con directiva de atributo (`button[mimiBtn]`, `input[mimiInput]`…), sin romper `formControlName` ni `[(ngModel)]`.
- Variantes con `cva` y clases **completas y literales**; input `class` (alias) mezclado con `cn()`; estado en atributos `data-*` (`data-variant`, `data-size`, `data-state`, `data-disabled`).
- Importaciones: los demás archivos de ui-core con el alias y el archivo concreto (`@/components/ui/utils/cn`, `@/components/ui/utils/control-styles`, `@/components/ui/theme/provider`, `@/components/ui/<componente>`), nunca con el índice de `utils` o `theme` ni con rutas relativas que salgan de la carpeta del componente. Dentro de la carpeta, rutas relativas. `imports.spec.ts` falla si no se cumple.
- Formularios (spec 8): si es un campo nativo, detecta `FormField` o `NgControl` y pinta el error con `controlInvalidStyles`; si es un control propio, implementa `FormValueControl` / `FormCheckboxControl` (nunca `ControlValueAccessor`) y prueba que funcione con `[formField]`, `formControlName` y `[(ngModel)]`. En directivas que conviven con `[formField]` (Input, Textarea), no uses nombres de entrada que Signal Forms escribe (`invalid`, `touched`, `dirty`, `disabled`, `errors`, `required`, `name`…), salvo en controles propios que implementen `FormValueControl`, donde es intencional.
- Si es un control, reutiliza `utils/control-styles.ts`: `buttonFocusStyles`, `fieldFocusStyles`, `controlDisabledStyles`, `controlInvalidStyles` y `controlPressStyles` (este último solo en botones).
- Cascada de tokens (spec 6.2): `var(--mimi-<prefijo>-<prop>, var(--mimi-<compartida>, <respaldo>))`. Si agregas tokens por componente, regístralos en `theme/types.ts` (`MimiComponentTokens`) y el prefijo en `COMPONENT_PREFIX` de `theme/provider.ts`, con prueba en `provider.spec.ts`.
- Si agregas una sombra, un radio o una utilidad propia en `theme-base.css`, regístrala en `utils/cn.ts` (`extendTailwindMerge`) con su prueba en `cn.spec.ts`, y en la spec 6.1.
- En valores arbitrarios con `var()`, indica siempre el tipo cuando la utilidad sea ambigua: `shadow-[shadow:var(…)]`, `text-[length:var(…)]` o `text-[color:var(…)]`, `border-[length:var(…)]` o `border-[color:var(…)]`, `bg-[color:var(…)]`. Sin el tipo, tailwind-merge no resuelve el conflicto con la clase del usuario. Cubre cada caso con una prueba de `class`.
- Movimiento: `mimi-transition` + `active:scale-(--mimi-press-scale)`. Nunca `active:[transform:...]` (la transición anima `scale`, spec 6.6).
- Cero colores fijos. Íconos internos como SVG en línea con los trazos de Lucide; los del usuario por `ng-content` con `[&_svg]:size-4 [&_svg]:shrink-0`.
- Accesibilidad: foco visible, roles y atributos ARIA correctos, teclado.
- `index.ts` que exporte todo; si tiene subcomponentes, también `Mimi<Nombre>Imports`. Expórtalo desde `packages/ui-core/src/index.ts`.
- Pruebas con TestBed junto al código (`*.spec.ts`): variantes, tamaños, estados, `class` del usuario, `data-*`, accesibilidad y teclado. Durante el desarrollo usa `pnpm test:ui-core`.

## 3. La página, en `apps/docs/src/app/pages/docs/components/$ARGUMENTS/`

- `$ARGUMENTS-page.ts` y `$ARGUMENTS-page.html`, con la tipografía de las páginas existentes (`pages/docs/introduction-page.html`).
- Ruta `/docs/components/$ARGUMENTS`: hija de `docs` en `apps/docs/src/app/app.routes.ts`, lazy, con `title: '<Nombre> · Mimi'`.
- En `apps/docs/src/app/layout/docs-nav.ts` (`DOCS_NAV`), cambia el ítem de $ARGUMENTS a `status: 'ready'` (una prueba falla si un ítem `ready` no tiene ruta).
- Contenido: título, descripción, instalación con `<app-install-command name="$ARGUMENTS" />`, un ejemplo por variante y estado, un ejemplo personalizando con `class` y la tabla de API (input, tipo, valor por defecto, descripción).
- Cada ejemplo es un componente propio en `examples/$ARGUMENTS-<caso>.example.ts` y se muestra con `CodePreview`, importado **también como texto**, así el código mostrado es el real:

  ```ts
  import { ButtonVariantsExample } from './examples/button-variants.example';
  // @ts-expect-error TypeScript todavía no tipa los import attributes (spec, sección 10).
  import buttonVariantsSource from './examples/button-variants.example' with { loader: 'text' };
  ```

  ```html
  <app-code-preview [code]="buttonVariantsSource">
    <app-button-variants-example />
  </app-code-preview>
  ```

  Nunca escribas el código de un ejemplo dos veces. Para fragmentos sueltos (comandos, `mimi.json`, CSS) usa `CodeBlock`.

- Encabezados `h2`/`h3` con `id` para la TOC; no pongas etiquetas ni badges dentro del encabezado (la TOC lee su texto).

## 4. Al terminar

1. `pnpm build`, `pnpm test` y `pnpm format` (y `pnpm format:check`). El build falla si el bundle inicial del showcase supera el presupuesto de `angular.json`: si crece, averigua por qué antes de subirlo.
2. Levanta `pnpm dev` en un puerto libre y comprueba que `main.js` responde HTTP 200 sin errores en el log (`pnpm build` no detecta los fallos de resolución de `ng serve`). No lo dejes corriendo.
3. Revisa que el CSS generado no tenga colores fijos.
4. Actualiza `docs/spec.md` si cambió algo (API, tokens nuevos).
5. Registra en `docs/spec.md`, sección 4 (catálogo), los archivos del componente, sus dependencias de npm y los otros archivos de ui-core que necesita (utils, otros componentes). Servirá para el `registry.json` de la Fase 3.
6. Marca la tarea en `docs/plan.md`, haz el commit y resume qué creaste y qué revisar en el navegador, en claro y oscuro.
