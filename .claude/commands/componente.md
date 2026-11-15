---
description: Crea un componente de Mimi completo (código, página del showcase y pruebas)
argument-hint: <ID o nombre del componente, ej. G2.1 o toggle-group>
---

Crea el componente **$ARGUMENTS** de Mimi. Sigue el protocolo de `CLAUDE.md`, «Forma de trabajar» (al empezar: pasos a–d; al terminar: pasos e–h; «Commit y push»), y estos pasos propios de un componente.

**Reglas de `CLAUDE.md` que se cumplen:** Angular 1–11, estilos 1–11, «Forma de trabajar» (con «Bundle» y «Privacidad»). Su texto está solo en `CLAUDE.md`; aquí se citan por número y nombre.

## 1. Antes de escribir código

1. La tarea: su línea del índice (`docs/plan.md`) y su archivo en `docs/plan/` (protocolo, paso a). Lee de la plantilla «Leer antes», «Diseño», «Base técnica», «API pública propuesta», «Formularios», «Tokens», «Teclado y accesibilidad», «Trampas conocidas», «Criterios de hecho» y «Preguntas abiertas», y las notas propias de la tarea (por ejemplo, la 2.1 pedía `tabindex="-1"` en `a[mimiBtn]` con `aria-disabled`). Cumple todas.
2. Lee en `docs/spec.md` el catálogo (sección 4), la tabla de tokens de $ARGUMENTS (sección 13) y todo lo que mencione a $ARGUMENTS: selector, variantes, tamaños, estados, formularios (sección 8).
3. **El código es la fuente de verdad del diseño** (`CLAUDE.md`, «Documentos del proyecto»): los valores salen del tema (`packages/ui-core/src/lib/theme/theme-base.css`, clases de la spec 6.1), los estados de los campos de `utils/field-styles.ts` y el aspecto de los controles existentes (`/docs/states`). Si la tarea cita un archivo de `docs/design/` («Diseño:»), úsalo solo como referencia de forma (qué partes tiene, cómo se ordenan), no de valores: es histórico.
4. **No inventes valores.** Si falta un token o algo no tiene precedente en el tema, pregúntame. Lo nuevo de aspecto que quede se documenta en la spec (sección 4 o 13 del componente).
5. El plan breve del protocolo (paso d) incluye: archivos, API pública, variantes, tokens y decisiones.

## 2. El componente, en `packages/ui-core/src/lib/components/$ARGUMENTS/`

- Archivo del componente o directiva con las reglas de Angular de `CLAUDE.md` (Angular 1–5: OnPush y zoneless, `input()`/`output()`/`model()` y objeto `host`, control de flujo nuevo, `inject()` en propiedades, sin `standalone: true`).
- Elementos nativos (`button`, `input`, `textarea`, `a`): `CLAUDE.md`, Angular 6 (directivas de atributo para elementos nativos, sin romper `formControlName` ni `[(ngModel)]`).
- Variantes, `class` y estado: `CLAUDE.md`, estilos 4 (variantes con `cva`, clases completas y literales), estilos 5 (todo componente acepta `class` y lo mezcla con `cn()`) y estilos 6 (estado en atributos `data-*`).
- Importaciones: `CLAUDE.md`, Angular 9 (importaciones con el alias y el archivo concreto). Entre los archivos concretos de utils está también `@/components/ui/utils/control-styles`.
- **Base técnica (spec 4, «Base técnica»):** si el componente necesita teclado, foco y ARIA de un patrón (listbox, menú, tabs, toolbar…), usa `@angular/aria`; para posicionar popups y para diálogos, `@angular/cdk` (`overlay`, `dialog`, `a11y`). Se usan **solo por dentro**: la API pública de Mimi (selectores, entradas, salidas y tipos) es propia y nunca expone directivas ni tipos de aria o cdk. Nunca uses los entry points `private` de aria ni de cdk. Declara `@angular/aria` y `@angular/cdk` en las `peerDependencies` del ítem del registro.
- Formularios: `CLAUDE.md`, Angular 10 (formularios: `FormValueControl` / `FormCheckboxControl`, nunca `ControlValueAccessor`), y spec 8. Además: un campo nativo pinta el error con `controlInvalidStyles`; un control propio se prueba con `[formField]`, `formControlName` y `[(ngModel)]`.
- Si es un control, reutiliza `utils/control-styles.ts`: `buttonFocusStyles`, `fieldFocusStyles`, `controlDisabledStyles`, `controlInvalidStyles` y `controlPressStyles` (este último solo en botones).
- Si es un control de formulario, usa las piezas de `utils/field-styles.ts` (borde, hover, foco, clic, deshabilitado, solo lectura y error; spec, «`field-styles.ts`») y agrégale su fila en `/docs/states` (`ROWS` de `apps/docs/src/app/pages/docs/states/states-page.ts`): la prueba de esa página falla si falta.
- Cascada de tokens (spec 6.2): `var(--mimi-<prefijo>-<prop>, var(--mimi-<compartida>, <respaldo>))`.
- **Tokens del componente (obligatorio, spec 13):** usa los de su tabla en la spec, sección 13; regístralos en `theme/types.ts` (`MimiComponentTokens`, con su interfaz `Mimi<Nombre>Tokens`) y el prefijo en `COMPONENT_PREFIX` de `theme/provider.ts`, con prueba en `provider.spec.ts` (el preset genera `--mimi-<prefijo>-<propiedad>`), y agrégalos a `apps/docs/src/app/code/component-tokens.ts` (la única lista de variables; de ahí sale la tabla «Variables CSS» de la página y `component-tokens.spec.ts` la compara con el código). Es el contrato que usará el Theme Studio (`docs/futuro/theme-studio.md`), que no define variables propias. Si el componente no tiene tabla todavía, pregúntame antes de inventar tokens.
- Si agregas una sombra, un radio o una utilidad propia en `theme-base.css`, regístrala en `utils/cn.ts` (`extendTailwindMerge`) con su prueba en `cn.spec.ts`, y en la spec 6.1.
- Valores arbitrarios: `CLAUDE.md`, estilos 8 (valores arbitrarios con `var()` llevan tipo). Cubre cada caso con una prueba de `class`.
- Movimiento: `mimi-transition` + `active:scale-(--mimi-press-scale)`. Nunca `active:[transform:...]` (la transición anima `scale`, spec 6.6).
- Colores e íconos: `CLAUDE.md`, estilos 1 (cero colores fijos) y estilos 9 (íconos internos en SVG con los trazos de Lucide; los del usuario por `ng-content`).
- Accesibilidad: `CLAUDE.md`, estilos 11 (accesibilidad: foco visible, roles ARIA, teclado).
- `index.ts` que exporte todo; si tiene subcomponentes, también `Mimi<Nombre>Imports`. Expórtalo desde `packages/ui-core/src/index.ts`.
- Pruebas con TestBed junto al código (`*.spec.ts`): variantes, tamaños, estados, `class` del usuario, `data-*`, accesibilidad y teclado. Durante el desarrollo usa `pnpm test:ui-core`.

## 3. La página (obligatorio: con la plantilla)

Lee `docs/spec/plantilla-pagina.md` antes de escribirla.

- `$ARGUMENTS.page.ts`: la configuración `DocPage` (nombre, frase de cabecera, demo principal, `install`, `usage`, ejemplos por categoría con su frase, `accessibility`, `api`, `texts` y `tokens`). `$ARGUMENTS-page.ts` solo pinta `<app-doc-page [page]="page" />`. No hay `$ARGUMENTS-page.html`.
- Ruta `/docs/components/$ARGUMENTS` en `apps/docs/src/app/pages/docs/docs.routes.ts`, lazy, con `title: '<Nombre> · Mimi'`, y el ítem de `docs-nav.ts` en `status: 'ready'`. El nombre de `DocPage.name` es el mismo que el del menú.
- Ejemplos: los de «Ejemplos del showcase» de la tarea, cada uno en su categoría (tamaños, variantes, estados, formularios, avanzados, `class`, alternativas). Los de formularios son las pestañas de R.13 (`FORMS_SPECS`); un ejemplo vivo de formularios solo si el control valida algo propio.
- **Paso obligatorio, antes del informe:** `pnpm ng test docs --include='**/doc-page/doc-pages.spec.ts'` en verde, sin añadir la página a ninguna lista de excepciones. En el informe, la salida de esa prueba es la evidencia del criterio «página con la plantilla».
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

## 4. Al terminar (además del protocolo, pasos e–h)

1. Presupuestos (spec 10; `CLAUDE.md`, «Forma de trabajar», «Bundle»): JS inicial con `check-initial-js.mjs` (aviso desde 345 kB, error desde 360 kB; corre dentro de `pnpm build`), y en `angular.json` `main` 140/145 kB, CSS global (`styles`) 180/195 kB e `initial` 525/555 kB (la suma de los dos anteriores). **Si el JS inicial crece más de 1 kB**, compara el `metafile` de `ng build docs --stats-json` con y sin el cambio (por ejemplo, quitando la ruta nueva), módulo por módulo, y comprueba que el código del componente y de cdk/aria no esté en los chunks iniciales (spec 10).
2. Levanta `pnpm dev` en un puerto libre y comprueba que `main.js` responde HTTP 200 sin errores en el log (`pnpm build` no detecta los fallos de resolución de `ng serve`). No lo dejes corriendo (`CLAUDE.md`, «Forma de trabajar», «Servidores en segundo plano»).
3. Revisa que el CSS generado no tenga colores fijos.
4. Actualiza `docs/spec.md` si cambió algo (API, tokens nuevos: la tabla del componente en la sección 13).
5. Registra en `docs/spec.md`, sección 4 (catálogo), los archivos del componente, sus dependencias de npm y los otros archivos de ui-core que necesita (utils, otros componentes), y su ítem en `registry.json`.
6. En el informe (paso h), di también qué revisar en el navegador, en claro y oscuro.
