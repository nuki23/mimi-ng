import type { Type } from '@angular/core';
import type { CodeFile } from '../code/code-preview';
import type { TokenComponent } from '../code/component-tokens';

/**
 * La plantilla de las páginas de componentes (`docs/spec/plantilla-pagina.md`; PD-4, variante A,
 * decidida por el usuario el 14/11/2026). Una página es una configuración `DocPage`; la pinta
 * `<app-doc-page>` con el orden, los nombres y los `id` fijos. La comprueba `doc-pages.spec.ts`.
 *
 * En los textos (`lead`, `sentence`, `note`, `points`, descripciones de la API), lo que va entre
 * comillas invertidas se pinta como código: `` `tone` `` → `<code>tone</code>`.
 */

/** La variante de la plantilla: una constante del sitio (cambiarla es cambiar los límites). */
export const DOC_PAGE_VARIANT = 'A' as const;

/** Los límites de la variante A (spec/plantilla-pagina.md, «Límites»). */
export const DOC_PAGE_LIMITS = {
  /** Ejemplos vivos, sin contar la demo (los de un desplegable cuentan). */
  examples: 8,
  /** Palabras de la frase de cabecera. */
  leadMin: 12,
  leadMax: 25,
  /** Palabras de la frase de cada ejemplo. */
  sentence: 25,
  /** Palabras de la nota de «Uso» y de cada descripción de la API. */
  description: 20,
  /** Frases de la nota de «Uso». */
  noteSentences: 2,
  /** Líneas de la plantilla del bloque «Uso» (la medida de R.24). */
  usageLines: 12,
  /** Líneas del archivo de cada ejemplo, y de la demo (sumando sus archivos). */
  exampleLines: 80,
  demoLines: 60,
  /** Viñetas visibles de «Accesibilidad y teclado». */
  accessibilityPoints: 6,
  /** Prosa visible fuera de la API (cabecera, nota de Uso, frases y viñetas). */
  prose: 400,
} as const;

/** Categorías de ejemplo, en el orden fijo de la plantilla (regla 8). */
export const DOC_EXAMPLE_CATEGORIES = [
  'sizes',
  'variants',
  'states',
  'forms',
  'advanced',
  'custom',
  'alternatives',
] as const;
export type DocExampleCategory = (typeof DOC_EXAMPLE_CATEGORIES)[number];

/** Los `id` fijos de las secciones (h2), en orden. */
export const DOC_SECTIONS = ['installation', 'usage', 'examples', 'accessibility', 'api'] as const;
export const DOC_SECTION_TITLES: Record<(typeof DOC_SECTIONS)[number], string> = {
  installation: 'Instalación',
  usage: 'Uso',
  examples: 'Ejemplos',
  accessibility: 'Accesibilidad y teclado',
  api: 'API',
};

/** Los `id` fijos de los h3 de la API, en orden (los que haya). */
export const DOC_API_SECTIONS = ['inputs', 'outputs', 'parts', 'texts', 'tokens'] as const;
export const DOC_API_TITLES: Record<(typeof DOC_API_SECTIONS)[number], string> = {
  inputs: 'Entradas',
  outputs: 'Salidas',
  parts: 'Piezas',
  texts: 'Textos',
  tokens: 'Variables CSS',
};

/** El h3 de las pestañas de formularios (R.13), dentro de Ejemplos. */
export const DOC_FORMS_ID = 'forms';

export interface DocExample {
  /** Ancla del h3 (y de la TOC), en kebab-case. */
  id: string;
  /** El h3. En la demo no se pinta. */
  title: string;
  /** Qué muestra y cómo probarlo: obligatoria, 25 palabras como máximo, distinta del título. */
  sentence: string;
  /** El ejemplo que corre en Vista. */
  component: Type<unknown>;
  /** Su archivo, importado como texto (`with { loader: 'text' }`). */
  source: string;
  /** Si son varios archivos (CodePreview `files`): se cuentan las líneas de cada uno. */
  files?: readonly CodeFile[];
  /**
   * Un ejemplo más en un desplegable cerrado debajo de este (por ejemplo, la matriz variante ×
   * tono). Su `title` es el texto del desplegable. Cuenta como ejemplo vivo.
   */
  more?: Omit<DocExample, 'more'>;
}

/** Fila de «Entradas». */
export interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Fila de «Salidas». */
export interface OutputRow {
  name: string;
  type: string;
  description: string;
}

/** Fila de «Piezas»: las directivas y componentes que acompañan al principal. */
export interface PartRow {
  name: string;
  selector: string;
  description: string;
}

/** Un proveedor de textos: `provideMimiSelectText(MIMI_SELECT_TEXT_ES)`. */
export interface DocTexts {
  constant: string;
  provider: string;
  /** Lo que va después de `@/components/ui/`. */
  path: string;
  /** Para qué es, si no es el del propio componente (un comentario en el código). */
  note?: string;
}

export interface DocPage {
  /** El h1: el mismo título del menú (`docs-nav.ts`). */
  name: string;
  /** La frase de cabecera: qué es y para qué sirve (12 a 25 palabras). */
  lead: string;
  /** La demo principal, sin h3: el caso común, 60 líneas como máximo. */
  demo: DocExample;
  /** Nombre en el registro de la CLI: el comando y «Qué instala». Es también el de la carpeta. */
  install: string;
  /**
   * El código mínimo (12 líneas de plantilla) y, si hace falta, una o dos frases. `more`: una
   * explicación para el usuario de más de tres frases (regla 12), en un desplegable cerrado
   * debajo; por ejemplo, el orden de los mensajes de error de Form Field.
   */
  usage: {
    code: string;
    note?: string;
    more?: { summary: string; items: readonly string[]; ordered?: boolean };
  };
  /** Los ejemplos por categoría; se pintan en el orden de `DOC_EXAMPLE_CATEGORIES`. */
  examples: Partial<Record<DocExampleCategory, readonly DocExample[]>>;
  /** Clave de `FORMS_SPECS`: las pestañas de R.13, en «Formularios». */
  forms?: string;
  /** Viñetas visibles (6 como máximo) y el resto, en un desplegable. */
  accessibility: { points: readonly string[]; more?: readonly string[] };
  api: {
    inputs: readonly ApiRow[];
    outputs?: readonly OutputRow[];
    parts?: readonly PartRow[];
    /** Los `data-*` del componente: una línea debajo de Entradas. */
    dataAttributes?: readonly string[];
  };
  /**
   * Los textos propios: por cada proveedor, la constante en español, el proveedor y el archivo
   * (`select`, o `combobox/combobox-texts` para no traer el componente entero). El código lo arma
   * la página. Varios si el componente usa los textos de otro (Combobox múltiple, los del chip).
   */
  texts?: readonly DocTexts[];
  /** La tabla de `component-tokens.ts`. */
  tokens?: TokenComponent;
}
