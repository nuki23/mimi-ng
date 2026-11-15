# Plantilla de las páginas de componentes

[← Spec, sección 10 (Showcase)](../spec.md#10-showcase-appsdocs)

**Variante A, completa.** Decidido por el usuario el 14/11/2026 (PD-4 y PD-4c; el texto con el que se decidió está en `docs/plan/docs-paginas/plan.md` y `parte-c.md`). Es la regla para todas las páginas de `/docs/components/…`, las de hoy y las futuras. Los Blocks tienen su propia plantilla (`pages/docs/blocks/block-doc.ts`), que se ajusta en DP.6.

## Cómo se impone

- **Una página es una configuración, no HTML.** `pages/docs/components/<nombre>/<nombre>.page.ts` exporta una constante `DocPage`; `<nombre>-page.ts` (el componente de la ruta) solo pinta `<app-doc-page [page]="page" />` (y, si el componente tiene textos, aplica su proveedor en español en `providers`). No hay `<nombre>-page.html`. Las páginas no escriben encabezados: el orden, los nombres y los `id` los pone `<app-doc-page>`.
- **La prueba:** `apps/docs/src/app/doc-page/doc-pages.spec.ts`. Falla si una carpeta de `pages/docs/components/` (o un ítem `ready` del menú en `/docs/components/`) no tiene su configuración, si su `*-page.ts` hace otra cosa, si queda un `*-page.html`, si falta una sección obligatoria, si al pintarla el orden de los h2 y los h3 no es el de la plantilla, si un ejemplo no tiene su frase delante, si pasa de un límite (abajo) o si hay nombres internos en el texto visible.
- **Aviso en desarrollo:** `<app-doc-page>` llama a `validateDocPage` y escribe en la consola `[Mimi docs] <Nombre>: …` por cada cosa que no cumple, antes de pasar la prueba.
- **Todas las páginas con la plantilla** (desde el 14/11/2026): la lista de pendientes de la migración (DP.0 a DP.5) se vació y se quitó de la prueba. Cada carpeta de `pages/docs/components/` tiene que estar registrada en `PAGES` de `doc-pages.spec.ts` con su `<nombre>.page.ts`: un componente nuevo sin página con la plantilla hace fallar la prueba.
- **Excepciones:** `EXCEPTIONS` de la prueba, con la regla y la razón. **Cada una la aprueba el usuario** y se anota abajo, en «Excepciones aprobadas», con su fecha. Si una página no cabe, primero se rediseña el ejemplo (o se parte en dos archivos con `files`, o pasa a un Block); la prueba no se cambia por cuenta propia.

## Piezas (`apps/docs/src/app/doc-page/`)

| Archivo             | Qué es                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `doc-page.types.ts` | `DocPage`, `DocExample`, `ApiRow`, `OutputRow`, `PartRow`; las categorías, las secciones y sus `id`; `DOC_PAGE_VARIANT` y `DOC_PAGE_LIMITS`.                                                                                                                                                                                                                                                                                                                                                                     |
| `doc-page.rules.ts` | `validateDocPage(page): string[]` y las medidas (palabras, frases, líneas, líneas de la plantilla de «Uso»).                                                                                                                                                                                                                                                                                                                                                                                                     |
| `doc-page.ts/html`  | `<app-doc-page [page]>`: pinta la página dentro de un `<article>` (las clases de `components.css` van con `@scope (article, …)`). Cada ejemplo lo pinta `<app-doc-example>` (`doc-example.ts`): su frase y `CodePreview`, con el componente creado por `ViewContainerRef.createComponent`. **No** se usan `NgComponentOutlet` ni `NgTemplateOutlet`: su módulo de `@angular/common` pasaba al JS inicial (+3,7 kB, medido el 14/11/2026; la misma trampa de la vista previa de los Blocks, spec 10).             |
| `api-table.ts`      | `<app-api-table kind="inputs \| outputs \| parts">` con las columnas fijas.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `more.ts`           | `<app-more summary>`: `<details>` nativo, cerrado por defecto.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `install-extras.ts` | «Qué instala»: otros ítems que copia, paquetes de npm y CSS, sin lo que ya trae `ng add`. Lee `install-map.json`, un mapa reducido del registro (solo los componentes y solo eso) que genera `apps/docs/scripts/install-map.mjs` en `pnpm build:docs` (y a mano, tras cambiar el registro); va en el repo y `doc-page.spec.ts` falla si no coincide con `packages/cli/src/registry.json` (la prueba lo lee con el alias `@mimi-ng/cli/registry.json`; el sitio, no).                                             |
| `doc-text.ts`       | `<app-doc-text [text]>`: lo que va entre comillas invertidas en un texto de la configuración se pinta como `<code>`, y `[texto](/ruta)` como un enlace interno con `routerLink` (solo rutas del sitio; decidido por el usuario el 14/11/2026, para enlazar las páginas hermanas: Input y Textarea, Select y Combobox, Checkbox y Switch). Sin HTML: el texto nunca se interpreta. `doc-pages.spec.ts` comprueba que cada enlace va a una página `ready` del menú; las palabras cuentan solo el texto del enlace. |

Las clases de `doc-page/` van en `components.css` (no en el CSS global): solo las usan las páginas de componentes.

## Reglas comunes

1. **Orden fijo.** Una sección que no aplica se omite: nunca cambia de lugar ni de nombre.
2. **Nombres e `id` fijos:**
   - h2: `Instalación` (`installation`), `Uso` (`usage`), `Ejemplos` (`examples`), `Accesibilidad y teclado` (`accessibility`) y `API` (`api`);
   - h3 de API: `Entradas` (`inputs`), `Salidas` (`outputs`), `Piezas` (`parts`), `Servicio` (`service`, opcional), `Textos` (`texts`) y `Variables CSS` (`tokens`);
   - el h3 de las pestañas de formularios: `Formularios` (`forms`).
3. **Cabecera:** el h1 con el nombre del menú (`DocPage.name` igual al título de `docs-nav.ts`) y **una frase de 12 a 25 palabras**, nominal («Botón para…»): qué es y para qué sirve, sin enumerar todas sus funciones.
4. **Demo principal**, sin título y antes de Instalación: **un** ejemplo realista del caso común, con su frase y con Vista y Código, de **60 líneas como máximo** (sumando sus archivos).
5. **Instalación:** el comando y el desplegable «Qué instala», generado desde el registro. Nada de versiones exactas: van en Fundamentos.
6. **Uso:** el código mínimo (**12 líneas** de plantilla, la medida de R.24) y, si hace falta, una nota de **dos frases y 20 palabras como máximo**. Nada de cómo está hecho por dentro. Una explicación para el usuario de más de tres frases va en un desplegable debajo (`usage.more`: un título y una lista, numerada si es un orden), como el orden de los mensajes de error de Form Field (Parte C del plan: los h2 propios de Form Field pasan «a un ejemplo `advanced` y a un desplegable en Uso»).
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
10. **API:** columnas fijas `Entrada | Tipo | Por defecto | Descripción`, `Salida | Tipo | Descripción`, `Pieza | Selector | Para qué` y `Miembro | Tipo | Descripción`. **Servicio** (`api.service`; PD-8, decidido por el usuario el 14/11/2026) es la API del servicio y de su referencia (`MimiDialogService.open(…)`, `MimiDialogRef.close(…)`, un token como `MIMI_DIALOG_DATA`), para los componentes que se usan también por código: Dialog, y Toast, Confirm y Command al migrarse; descripciones de **20 palabras como máximo**; los `data-*` en una línea debajo de Entradas (`api.dataAttributes`). **Textos** (`DocPage.texts`, una lista de proveedores `{ constant, provider, path, note? }`: varios si el componente usa los textos de otro, como el chip en el Combobox múltiple) es obligatorio si el componente tiene `<nombre>-texts.ts` en ui-core o la página aplica un `provideMimi…Text`; la frase y el código los arma `<app-doc-page>`; **Variables CSS** (`DocPage.tokens`: una tabla o una lista, la primera la del componente y las demás las de lo que usa por dentro, como el chip en Tags Input y Combobox o Progress en File Upload; PD-9, decidido por el usuario el 14/11/2026), si el componente tiene tabla en `component-tokens.ts`.
11. **Fuera de la página:** decisiones y rodeos internos (a la spec); versiones, atajos que se quitan y migraciones (al CHANGELOG); notas para el revisor. La prueba rechaza en el texto visible `rodeo`, `@angular/aria`, `@angular/cdk`, `CDK` y «decidido por defecto» (fuera de «Qué instala»).
12. **Desplegable** (`<app-more>`, cerrado): «Qué instala», el ejemplo `more` de un ejemplo, las explicaciones largas de Uso (`usage.more`) y lo que pase de 6 viñetas de accesibilidad (`accessibility.more`). Los nombres internos de la regla 11 tampoco van en estos desplegables (salvo «Qué instala»).

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
- **Escape para lo que no encaja:** solo `advanced` (un ejemplo más), `accessibility.more`, `usage.note` o `usage.more`. No hay un campo de HTML libre.
- Una página nueva: su `<nombre>.page.ts`, el envoltorio de una línea y su registro en `PAGES` de `doc-pages.spec.ts`; su `*-page.spec.ts` incluye `it('cumple la plantilla', () => expect(validateDocPage(<NOMBRE>_PAGE)).toEqual([]))`.

## Excepciones aprobadas

Ninguna.
