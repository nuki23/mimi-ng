# Plantilla de las páginas de componentes

[← Spec, sección 10 (Showcase)](../spec.md#10-showcase-appsdocs)

**Variante A, completa.** Decidido por el usuario el 14/11/2026 (PD-4 y PD-4c; el texto con el que se decidió está en `docs/plan/docs-paginas/plan.md` y `parte-c.md`). Es la regla para todas las páginas de `/docs/components/…`, las de hoy y las futuras. Los Blocks tienen su propia plantilla (`pages/docs/blocks/block-doc.ts`), que se ajusta en DP.6.

## Cómo se impone

- **Una página es una configuración, no HTML.** `pages/docs/components/<nombre>/<nombre>.page.ts` exporta una constante `DocPage`; `<nombre>-page.ts` (el componente de la ruta) solo pinta `<app-doc-page [page]="page" />` (y, si el componente tiene textos, aplica su proveedor en español en `providers`). No hay `<nombre>-page.html`. Las páginas no escriben encabezados: el orden, los nombres y los `id` los pone `<app-doc-page>`.
- **La prueba:** `apps/docs/src/app/doc-page/doc-pages.spec.ts`. Falla si una carpeta de `pages/docs/components/` (o un ítem `ready` del menú en `/docs/components/`) no tiene su configuración, si su `*-page.ts` hace otra cosa, si queda un `*-page.html`, si falta una sección obligatoria, si al pintarla el orden de los h2 y los h3 no es el de la plantilla, si un ejemplo no tiene su frase delante, si pasa de un límite (abajo) o si hay nombres internos en el texto visible.
- **Aviso en desarrollo:** `<app-doc-page>` llama a `validateDocPage` y escribe en la consola `[Mimi docs] <Nombre>: …` por cada cosa que no cumple, antes de pasar la prueba.
- **Durante la migración** (DP.0 a DP.5): la lista `PENDING` de la prueba tiene las páginas que faltan, y `PENDING_COUNT` su tamaño. Solo encoge: al migrar una página se quita de la lista y baja el número; la prueba falla si una página de la lista ya está migrada. Las pendientes siguen con la medida del bloque «Uso» de la R.24 (12 líneas; Dialog, 14). En la puerta DP.P la lista queda vacía.
- **Excepciones:** `EXCEPTIONS` de la prueba, con la regla y la razón. **Cada una la aprueba el usuario** y se anota abajo, en «Excepciones aprobadas», con su fecha. Si una página no cabe, primero se rediseña el ejemplo (o se parte en dos archivos con `files`, o pasa a un Block); la prueba no se cambia por cuenta propia.

## Piezas (`apps/docs/src/app/doc-page/`)

| Archivo             | Qué es                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `doc-page.types.ts` | `DocPage`, `DocExample`, `ApiRow`, `OutputRow`, `PartRow`; las categorías, las secciones y sus `id`; `DOC_PAGE_VARIANT` y `DOC_PAGE_LIMITS`.                                                                                                                                                                                                                                                                                                                                                         |
| `doc-page.rules.ts` | `validateDocPage(page): string[]` y las medidas (palabras, frases, líneas, líneas de la plantilla de «Uso»).                                                                                                                                                                                                                                                                                                                                                                                         |
| `doc-page.ts/html`  | `<app-doc-page [page]>`: pinta la página dentro de un `<article>` (las clases de `components.css` van con `@scope (article, …)`). Cada ejemplo lo pinta `<app-doc-example>` (`doc-example.ts`): su frase y `CodePreview`, con el componente creado por `ViewContainerRef.createComponent`. **No** se usan `NgComponentOutlet` ni `NgTemplateOutlet`: su módulo de `@angular/common` pasaba al JS inicial (+3,7 kB, medido el 14/11/2026; la misma trampa de la vista previa de los Blocks, spec 10). |
| `api-table.ts`      | `<app-api-table kind="inputs \| outputs \| parts">` con las columnas fijas.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `more.ts`           | `<app-more summary>`: `<details>` nativo, cerrado por defecto.                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `install-extras.ts` | «Qué instala», calculado desde `packages/cli/src/registry.json` (alias `@mimi-ng/cli/registry.json`): otros ítems que copia, paquetes de npm y CSS, sin lo que ya trae `ng add`.                                                                                                                                                                                                                                                                                                                     |
| `doc-text.ts`       | `<app-doc-text [text]>`: lo que va entre comillas invertidas en un texto de la configuración se pinta como `<code>` (sin HTML: el texto nunca se interpreta).                                                                                                                                                                                                                                                                                                                                        |

Las clases de `doc-page/` van en `components.css` (no en el CSS global): solo las usan las páginas de componentes.

## Reglas comunes

1. **Orden fijo.** Una sección que no aplica se omite: nunca cambia de lugar ni de nombre.
2. **Nombres e `id` fijos:**
   - h2: `Instalación` (`installation`), `Uso` (`usage`), `Ejemplos` (`examples`), `Accesibilidad y teclado` (`accessibility`) y `API` (`api`);
   - h3 de API: `Entradas` (`inputs`), `Salidas` (`outputs`), `Piezas` (`parts`), `Textos` (`texts`) y `Variables CSS` (`tokens`);
   - el h3 de las pestañas de formularios: `Formularios` (`forms`).
3. **Cabecera:** el h1 con el nombre del menú (`DocPage.name` igual al título de `docs-nav.ts`) y **una frase de 12 a 25 palabras**, nominal («Botón para…»): qué es y para qué sirve, sin enumerar todas sus funciones.
4. **Demo principal**, sin título y antes de Instalación: **un** ejemplo realista del caso común, con su frase y con Vista y Código, de **60 líneas como máximo** (sumando sus archivos).
5. **Instalación:** el comando y el desplegable «Qué instala», generado desde el registro. Nada de versiones exactas: van en Fundamentos.
6. **Uso:** el código mínimo (**12 líneas** de plantilla, la medida de R.24) y, si hace falta, una nota de **dos frases y 20 palabras como máximo**. Nada de cómo está hecho por dentro.
7. **Cada ejemplo** lleva un h3 y **una frase de 25 palabras como máximo**, distinta del título: qué muestra y, si hace falta, cómo probarlo. En presente o en imperativo, sin nombres internos.
8. **Los ejemplos van en un orden fijo**, por categoría (`DocPage.examples`), solo con las que aplican:
   1. `sizes`: Tamaños
   2. `variants`: Variantes (los tonos dentro)
   3. `states`: Estados (deshabilitado, solo lectura, carga y error, en **un** ejemplo)
   4. `forms`: las pestañas de R.13 (`DocPage.forms`, obligatorio si el componente está en `FORMS_SPECS`). **No hay ejemplos vivos que repitan las pestañas**, salvo uno de validación si el control tiene algo propio (Input OTP, Slider de rango).
   5. `advanced`: Casos avanzados
   6. `custom`: Personalizar con `class`
   7. `alternatives`: Alternativas (`[options]` en Select y Combobox)
9. **Los ejemplos son cortos:** **80 líneas como máximo** por archivo. Si un caso necesita más, se parte en dos archivos (`files`) o pasa a un Block. Un ejemplo puede llevar otro en un desplegable (`more`; por ejemplo, la matriz variante × tono), que cuenta como ejemplo vivo.
10. **API:** columnas fijas `Entrada | Tipo | Por defecto | Descripción`, `Salida | Tipo | Descripción` y `Pieza | Selector | Para qué`; descripciones de **20 palabras como máximo**; los `data-*` en una línea debajo de Entradas (`api.dataAttributes`). **Textos** (`DocPage.texts`) es obligatorio si el componente tiene `<nombre>-texts.ts` en ui-core o la página aplica un `provideMimi…Text`; **Variables CSS** (`DocPage.tokens`), si el componente tiene tabla en `component-tokens.ts`.
11. **Fuera de la página:** decisiones y rodeos internos (a la spec); versiones, atajos que se quitan y migraciones (al CHANGELOG); notas para el revisor. La prueba rechaza en el texto visible `rodeo`, `@angular/aria`, `@angular/cdk`, `CDK` y «decidido por defecto» (fuera de «Qué instala»).
12. **Desplegable** (`<app-more>`, cerrado): «Qué instala», el ejemplo `more` de un ejemplo, y lo que pase de 6 viñetas de accesibilidad (`accessibility.more`).

## Límites de la variante A (`DOC_PAGE_LIMITS`)

| Qué                                                             | Límite       |
| --------------------------------------------------------------- | ------------ |
| Ejemplos vivos (sin la demo; los de un desplegable cuentan)     | 8            |
| Palabras de la frase de cabecera                                | de 12 a 25   |
| Palabras de la frase de cada ejemplo                            | 25           |
| Palabras de la nota de «Uso» y de cada descripción de la API    | 20           |
| Frases de la nota de «Uso»                                      | 2            |
| Líneas de la plantilla del bloque «Uso»                         | 12           |
| Líneas del archivo de cada ejemplo / de la demo                 | 80 / 60      |
| Viñetas visibles de «Accesibilidad y teclado» (al menos una)    | 6            |
| Prosa visible fuera de la API (cabecera, nota, frases, viñetas) | 400 palabras |

## Cómo se escribe una página

```ts
// pages/docs/components/button/button.page.ts
export const BUTTON_PAGE: DocPage = {
  name: 'Button',
  lead: 'Botón para las acciones de una página…',
  demo: { id: 'demo', title: '', sentence: '…', component: ButtonDemoExample, source: demoSource },
  install: 'button',
  usage: { code: USAGE, note: '…' },
  examples: { sizes: [{ id: 'sizes', title: 'Tamaños', sentence: '…', component: …, source: … }] },
  accessibility: { points: ['Enter y Espacio activan…'] },
  api: { inputs: [...], dataAttributes: ['data-variant', 'data-tone', 'data-size'] },
  tokens: 'button',
};

// pages/docs/components/button/button-page.ts (la ruta no cambia)
@Component({
  selector: 'app-button-page',
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPage {
  protected readonly page = BUTTON_PAGE;
}
```

- El código de cada ejemplo se importa también como texto (`with { loader: 'text' }`, spec 10): lo que se ve en Código es lo que corre.
- **Escape para lo que no encaja:** solo `advanced` (un ejemplo más), `accessibility.more` o `usage.note`. No hay un campo de HTML libre.
- Al migrar una página: se borra su `*-page.html`, se quita de `PENDING` (y baja `PENDING_COUNT`), se registra en `MIGRATED` de la prueba y se adapta su `*-page.spec.ts`.

## Excepciones aprobadas

Ninguna.
