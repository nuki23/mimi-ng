# Parte C: que todas las páginas sigan la plantilla sin depender de la memoria

[← Plan](plan.md) · [Auditoría](auditoria.md) · [Ejemplos: Button y Select](ejemplos.md)

Encargo del 12/11/2026: **solo plan.** Que las páginas actuales y las futuras sigan la plantilla (PD-4) porque el código lo impone, no porque alguien se acuerde. Hoy cada página es su propio HTML: la auditoría encontró seis nombres para la accesibilidad y cinco formas de mostrar las salidas, y la única prueba de estructura que existe es la del bloque «Uso» (`code/short-use-pages.spec.ts`, R.24).

**PENDIENTE DE DECIDIR (usuario), junto con PD-4.** Las tres piezas (C.1 componente, C.2 prueba y C.3 reglas) dependen de la variante que se elija y se deciden con ella; las preguntas concretas están al final (PD-4c). No se aplica nada de esta parte hasta entonces: ni `CLAUDE.md`, ni `.claude/commands/`, ni el sitio.

## C.1 Un componente de página común: `app-doc-page`

### Idea

La página de un componente deja de ser HTML propio. Es **una configuración tipada** que recibe un componente del sitio, `app-doc-page`. Ese componente pinta las secciones **en el orden de la plantilla, con sus nombres e `id` fijos**. Una página no puede añadir un h2, cambiar el orden ni llamar «Teclado» a la accesibilidad, porque no escribe encabezados.

```text
apps/docs/src/app/doc-page/
  doc-page.ts          ← <app-doc-page [page]="…" />: pinta las secciones
  doc-page.types.ts    ← DocPage, DocExample, categorías y límites (uno por variante)
  doc-page.rules.ts    ← validateDocPage(page): string[] (lo usan la prueba y el aviso en desarrollo)
  api-table.ts         ← app-api-table: Entradas / Salidas / Piezas con columnas fijas
  more.ts              ← app-more: <details> común, cerrado por defecto
  install-extras.ts    ← «Qué instala», desde registry.json de la CLI
```

### La configuración (borrador de tipos)

```ts
/** Categorías de ejemplo, en el orden fijo de la plantilla (regla 8). */
export type DocExampleCategory =
  | 'sizes' // Tamaños
  | 'variants' // Variantes (tonos dentro)
  | 'states' // Estados: deshabilitado, solo lectura, carga, error
  | 'forms' // Formularios: un ejemplo vivo de validación propia, si lo hay
  | 'advanced' // Casos avanzados
  | 'custom' // Personalizar con class
  | 'alternatives'; // Alternativas ([options]…)

export interface DocExample {
  id: string; // ancla de la TOC, en kebab-case
  title: string; // h3
  sentence: string; // la frase del ejemplo (obligatoria; 25 palabras como máximo)
  component: Type<unknown>; // el ejemplo que corre en Vista
  source: string; // su archivo, importado como texto (with { loader: 'text' })
  files?: CodeFile[]; // si son varios archivos (CodePreview, 12/11/2026)
}

export interface DocPage {
  name: string; // h1; igual que el título de docs-nav.ts
  lead: string; // la frase de cabecera (12 a 25 palabras)
  demo: DocExample; // la demo principal, sin h3 (sin título)
  install: string; // nombre en el registro de la CLI → comando + «Qué instala»
  usage: { code: string; note?: string }; // 12 líneas como máximo, una o dos frases
  examples: Partial<Record<DocExampleCategory, DocExample[]>>;
  forms?: keyof typeof FORMS_SPECS; // las pestañas de R.13, en «Formularios»
  accessibility: { points: string[]; more?: string[] }; // visibles + desplegable
  api: {
    inputs: ApiRow[];
    outputs?: OutputRow[];
    parts?: PartRow[];
    dataAttributes?: string[];
  };
  texts?: { constant: string; provider: string; code: string };
  tokens?: ComponentTokensKey; // la tabla de component-tokens.ts
  providers?: Provider[]; // los textos en español del sitio (hoy, en cada *-page.ts)
}
```

### Cómo se escribe una página

```ts
// pages/docs/components/button/button.page.ts
export const BUTTON_PAGE: DocPage = {
  name: 'Button',
  lead: 'Botón para las acciones de una página, en seis tonos, tres variantes y tres tamaños.',
  demo: example(ButtonDemoExample, demoSource, { id: 'demo', title: '', sentence: '…' }),
  install: 'button',
  usage: { code: USAGE },
  examples: {
    sizes: [
      example(ButtonSizesExample, sizesSource, { id: 'sizes', title: 'Tamaños', sentence: '…' }),
    ],
    // …
  },
  accessibility: { points: ['Enter y Espacio activan…', '…'] },
  api: { inputs: BUTTON_INPUTS, dataAttributes: ['data-variant', 'data-tone', 'data-size'] },
  tokens: 'button',
};

// pages/docs/components/button/button-page.ts (5 líneas; la ruta no cambia)
@Component({ imports: [DocPageView], template: '<app-doc-page [page]="page" />' })
export class ButtonPage {
  protected readonly page = BUTTON_PAGE;
}
```

- **Los ejemplos se pintan** con `NgComponentOutlet` dentro de `CodePreview`. La importación como texto sigue igual, así que el código que se ve es el que corre.
- **Escape para lo que no encaja:** solo `advanced` (un ejemplo más) o `accessibility.more` / `usage.note` (en el desplegable). **No hay un campo de HTML libre.** Por ejemplo, los dos h2 de Form Field («Mensajes de error», «Personalizar los mensajes») pasan a un ejemplo `advanced` y a un desplegable en Uso.
- **Aviso en desarrollo:** `app-doc-page` llama a `validateDocPage` y escribe los errores en la consola (`[Mimi docs] Button: …`) mientras se escribe una página, antes de pasar la prueba.

### Cómo pinta cada variante

| Sección         | Variante A (completa)                                                                | Variante B (corta)                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Cabecera y demo | h1, frase, demo                                                                      | igual                                                                                                                    |
| Instalación     | comando + `app-more` «Qué instala»                                                   | igual                                                                                                                    |
| Uso             | código + `note`                                                                      | código; `note` va dentro de `app-more`                                                                                   |
| Ejemplos        | todas las categorías, en orden; `forms` lleva las pestañas de R.13 + su ejemplo vivo | `sizes` y `variants` en un solo h3; `states`; `forms` (solo pestañas); **un** `advanced`; el resto, enlazado a «Recetas» |
| Accesibilidad   | h2; `points` (6 como máximo) + `more` en un desplegable                              | h2; 3 `points` + el resto en un desplegable                                                                              |
| API             | h3 Entradas, Salidas, Piezas, Textos y Variables CSS                                 | una tabla (las salidas como filas `(nombre)`); Piezas, Textos y Variables CSS en desplegables                            |

**La variante es una constante del sitio** (`DOC_PAGE_VARIANT` en `doc-page.types.ts`). Las configuraciones son las mismas en las dos: con B, lo que pasa de los límites sale de la página de forma automática (los ejemplos de más van a «Recetas»), sin reescribir cada configuración. Cambiar de variante más adelante es cambiar una constante y los límites.

### Migración de las páginas actuales

Es la misma en las dos variantes; cambian los límites que se validan. Va en las tandas de [plan.md](plan.md): DP.0 trae `app-doc-page` y la migración de Button como piloto; DP.1 a DP.5 migran el resto.

Por página:

1. **Crear `<nombre>.page.ts`:**
   - pasar el h1 y la frase de cabecera (reescrita a 12–25 palabras);
   - pasar `usage` del `*-page.ts`;
   - pasar las tablas `api` (a `ApiRow`, `OutputRow` y `PartRow`, separando las salidas que hoy son filas `(x)` de las entradas).
2. **Clasificar los ejemplos** en categorías con la tabla de la [auditoría](auditoria.md):
   - los que repiten las pestañas se quitan;
   - los repetidos se juntan;
   - «Solo lectura» pasa a `states`.
   - Cada uno lleva su frase: la del párrafo actual, recortada a 25 palabras. Los párrafos largos van a `accessibility.more` o a la spec.
3. **Elegir la demo principal:** un ejemplo que ya existe o uno nuevo de hasta 60 líneas.
4. **Pasar al desplegable** «Qué instala» el texto de Instalación sobre aria y cdk (sale del registro; el de la página se borra).
5. **Reducir `*-page.ts` a 5 líneas** y borrar `*-page.html`.
6. **Quitar la página de la lista de pendientes** de la prueba (C.2), adaptar su `*-page.spec.ts` (los recuentos) y pasar Playwright (tanda).

**Con la variante B**, además:

- el paso 2 marca qué ejemplos van a «Recetas»: una página nueva, `/docs/recipes`, con una entrada por componente, generada desde las mismas configuraciones (los `advanced` que no caben);
- antes de la tanda 1 se crea la ruta y su entrada en `docs-nav.ts`.

**Los Blocks no se migran a `app-doc-page`:** ya tienen la suya (`block-doc.ts`), que se ajusta en DP.6 a los mismos nombres de sección y desplegables. La prueba de C.2 cubre solo las páginas de componentes.

## C.2 La prueba: `doc-pages.spec.ts`

En `apps/docs/src/app/doc-page/`, con dos partes: una **estática**, que lee los archivos con `fs` como `short-use-pages.spec.ts`, y otra que **pinta** cada página con TestBed.

**Falla si:**

1. **Una página no usa el componente.**
   - Cada carpeta de `pages/docs/components/` y cada ítem `ready` de `DOCS_NAV` con ruta `/docs/components/…` tiene su `<nombre>.page.ts`, y su `*-page.ts` solo pinta `<app-doc-page>`.
   - No queda ningún `*-page.html`.
   - Así cubre también los componentes **futuros**: una carpeta o un ítem del menú sin configuración hace fallar la prueba.
2. **Falta una sección obligatoria:**
   - `lead`, `demo`, `install`, `usage`, `accessibility.points` (al menos uno) y `api.inputs`;
   - `texts`, si la página aplica un `provideMimi*Text`, o si existe `components/<nombre>/<nombre>-texts.ts` en ui-core;
   - `forms`, si el componente está en `FORMS_SPECS`;
   - `tokens`, si el componente tiene tabla en `component-tokens.ts`.
3. **El orden cambia.** Al pintarla, los h2 con `id` son exactamente `installation, usage, examples, accessibility, api`, en ese orden y sin otros. Los h3 de Ejemplos siguen el orden de las categorías, y los de API, `inputs, outputs, parts, texts, tokens` (los que haya).
4. **Pasa de un límite** (los de la variante elegida):
   - ejemplos vivos (8 en A, 4 en B, sin contar la demo);
   - palabras de `lead` (12–25), de cada `sentence` (25), de `usage.note` y de cada descripción de la API (20 en A, 15 en B);
   - líneas de `usage.code` (12; la misma medida que R.24, que se jubila);
   - líneas del archivo de cada ejemplo (80; 60 en la demo);
   - `accessibility.points` (6 en A, 3 en B).
5. **Un ejemplo no tiene su frase:**
   - `sentence` vacía o igual al título;
   - al pintarla, cada `app-code-preview` debe tener delante un `[data-slot="example-sentence"]` con texto.
6. **Nombres internos en el texto visible:** `rodeo`, `@angular/aria`, `CDK` o «decidido por defecto» fuera del desplegable «Qué instala». Es la regla 11 de la plantilla.

**Excepciones:**

- **Durante la migración:** una lista `PENDING`, con las páginas que todavía no se migraron, que **solo puede encogerse**. La prueba falla si una página de la lista ya está migrada (hay que quitarla) y si la lista tiene más entradas que en la tanda anterior (un número fijo en la prueba, que baja en cada tanda). En DP.P la lista tiene que estar vacía, y la prueba lo exige.
- **Después:** `EXCEPTIONS`, como en R.24, con la regla y la razón escrita (por ejemplo, Data Table con 9 ejemplos). Cada excepción la aprueba el usuario y queda en `docs/spec/plantilla-pagina.md`.

## C.3 Reglas en los documentos (texto propuesto, **sin aplicar**)

La plantilla elegida se escribe en **`docs/spec/plantilla-pagina.md`**, un archivo nuevo que se crea en DP.0 con la variante decidida: las reglas comunes, los límites de la variante, los tipos de `DocPage` y las excepciones aprobadas. La sección 10 de `docs/spec.md` («Showcase») enlaza a él.

### `CLAUDE.md`

**Reemplazar**, en «Forma de trabajar», la línea:

> - Cada componente nuevo tiene su página en el showcase con todos sus estados.

**por:**

> - Cada componente tiene su página en el showcase, escrita **con la plantilla de página** (`docs/spec/plantilla-pagina.md`). La página es una configuración `DocPage` (`<nombre>.page.ts`) que pinta `<app-doc-page>`: nunca HTML propio, ni encabezados ni secciones a mano. Cada ejemplo lleva su categoría y su frase. Los límites (ejemplos, palabras, líneas) y el orden los comprueba `apps/docs/src/app/doc-page/doc-pages.spec.ts`; si una página no cabe, se rediseña el ejemplo o se pide una excepción al usuario, nunca se cambia la prueba por tu cuenta.

**Y añadir**, en «Reglas de Angular», después de la 10, o en una sección nueva «Reglas del sitio»:

> 11. Páginas del showcase: solo `app-doc-page` (ver arriba y `docs/spec/plantilla-pagina.md`). Un ejemplo, un archivo `examples/<nombre>-<caso>.example.ts` de 80 líneas como máximo, importado también como texto; si necesita más, en dos archivos con `files`, o pasa a un Block.

### `.claude/commands/componente.md`

**Reemplazar** el apartado «## 3. La página» desde «- `$ARGUMENTS-page.ts` y `$ARGUMENTS-page.html`…» hasta «- Contenido: …» por:

> ## 3. La página (obligatorio: con la plantilla)
>
> Lee `docs/spec/plantilla-pagina.md` antes de escribirla.
>
> - `$ARGUMENTS.page.ts`: la configuración `DocPage` (nombre, frase de cabecera, demo principal, `install`, `usage`, ejemplos por categoría con su frase, `accessibility`, `api`, `texts` y `tokens`). `$ARGUMENTS-page.ts` solo pinta `<app-doc-page [page]="page" />`. No hay `$ARGUMENTS-page.html`.
> - Ruta `/docs/components/$ARGUMENTS` en `apps/docs/src/app/pages/docs/docs.routes.ts`, lazy, con `title: '<Nombre> · Mimi'`, y el ítem de `docs-nav.ts` en `status: 'ready'`. El nombre de `DocPage.name` es el mismo que el del menú.
> - Ejemplos: los de «Ejemplos del showcase» de la tarea, cada uno en su categoría (tamaños, variantes, estados, formularios, avanzados, `class`, alternativas). Los de formularios son las pestañas de R.13 (`FORMS_SPECS`); un ejemplo vivo de formularios solo si el control valida algo propio.
> - **Paso obligatorio, antes del informe:** `pnpm ng test docs --include='**/doc-page/doc-pages.spec.ts'` en verde, sin añadir la página a ninguna lista de excepciones. En el informe, la salida de esa prueba es la evidencia del criterio «página con la plantilla».

**Y conservar** el resto del apartado: los ejemplos como componentes propios importados también como texto, «nunca escribas el código de un ejemplo dos veces» y `CodeBlock` para fragmentos sueltos. Se **quita** el punto de los encabezados `h2`/`h3` con `id`, porque ahora los pone `app-doc-page`.

### `.claude/commands/cerrar-grupo.md`

**Añadir** en «## 2. Comprobar», después de «**Conteos y listas:**»:

> - **Páginas con la plantilla:**
>   - `doc-pages.spec.ts` en verde, con la lista `PENDING` vacía;
>   - cada excepción de `EXCEPTIONS` está en `docs/spec/plantilla-pagina.md` con la aprobación del usuario y su fecha;
>   - cada componente del grupo tiene su `<nombre>.page.ts` y ningún `*-page.html`.
>   - Evidencia: la salida de la prueba y `git ls-files 'apps/docs/src/app/pages/docs/components/**/*-page.html'` vacío.

**Y en «## 3. Entregar»**, lista «Comprobado», el mismo punto como fila propia («Páginas con la plantilla»), para que el revisor la vea separada de las pruebas generales.

## PD-4c: lo que decide el usuario de esta parte

Va junto con PD-4 (variante A o B). La recomendación es la de cada pregunta:

1. **¿Un componente común con configuración** (C.1, recomendado) **o una plantilla con huecos** (`<app-doc-page>` con `<ng-template docSection="…">` y HTML libre dentro de cada sección)?
   - **Configuración (recomendado):** impone el orden y los nombres; la prueba es sencilla.
   - **Huecos:** menos reescritura en la migración, pero se sigue pudiendo meter cualquier cosa dentro de una sección.
2. **¿Cuándo empieza a fallar la prueba?**
   - **(a) Recomendado:** desde DP.0, con la lista `PENDING` que solo encoge.
   - **(b)** Solo para las páginas nuevas hasta DP.P.
3. **¿Se aplican los textos de C.3** (`CLAUDE.md`, `componente.md`, `cerrar-grupo.md`) **como están?**
   - Recomendado: sí, en el commit de DP.0, junto con `docs/spec/plantilla-pagina.md`.
   - `.claude/settings.json` no se toca.
4. **¿Las excepciones las aprueba el usuario una a una** (recomendado) **o basta con escribir la razón** en la prueba, como hoy en R.24?
