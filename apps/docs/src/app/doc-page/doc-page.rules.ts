import { COMPONENT_TOKENS } from '../code/component-tokens';
import { FORMS_SPECS } from '../code/forms-snippets';
import {
  DOC_API_SECTIONS,
  DOC_EXAMPLE_CATEGORIES,
  DOC_PAGE_LIMITS as L,
  type DocExample,
  type DocPage,
} from './doc-page.types';

/** Palabras de un texto visible (las comillas invertidas no cuentan). */
export function countWords(text: string): number {
  return text.replace(/`/g, '').split(/\s+/).filter(Boolean).length;
}

/** Frases de un texto: lo que termina en punto, cierre o exclamación. */
export function countSentences(text: string): number {
  return text
    .replace(/`[^`]*`/g, 'x')
    .split(/[.!?…](?:\s|$)/)
    .filter((part) => part.trim()).length;
}

/** Líneas de un archivo, sin las vacías del final. */
export function countLines(source: string): number {
  return source.replace(/\s+$/, '').split('\n').length;
}

/**
 * Líneas de la plantilla del bloque «Uso» (la medida de R.24): las de dentro de `template: \``.
 * Una plantilla de una línea cuenta 1; sin plantilla (un servicio), todas las líneas.
 */
export function usageTemplateLines(code: string): number {
  if (/template:\s*`[^`\n]+`/.test(code)) return 1;
  const lines = code.split('\n');
  const start = lines.findIndex((l) => /template:\s*`\s*$/.test(l));
  const end = lines.findIndex((l, i) => i > start && /^\s*`,?\s*$/.test(l));
  return start >= 0 && end > start ? end - start - 1 : countLines(code);
}

/** Nombres internos que no van en el texto visible (regla 11 de la plantilla). */
export const INTERNAL_NAMES = [
  /rodeo/i,
  /@angular\/aria/,
  /@angular\/cdk/,
  /\bCDK\b/,
  /decidido por defecto/i,
];

/** `color-picker` → `colorPicker` (las claves de component-tokens.ts). */
export const tokensKey = (name: string): string =>
  name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** Todos los ejemplos vivos de una página (sin la demo), con los de los desplegables. */
export function liveExamples(page: DocPage): DocExample[] {
  return DOC_EXAMPLE_CATEGORIES.flatMap((c) => page.examples[c] ?? []).flatMap((e) =>
    e.more ? [e, e.more as DocExample] : [e],
  );
}

/** El texto visible fuera de la API, para contar la prosa y buscar nombres internos. */
function prose(page: DocPage): string[] {
  return [
    page.lead,
    page.demo.sentence,
    page.usage.note ?? '',
    ...liveExamples(page).map((e) => e.sentence),
    ...page.accessibility.points,
  ];
}

function exampleLines(example: DocExample): number {
  return example.files?.length
    ? example.files.reduce((sum, f) => sum + countLines(f.code), 0)
    : countLines(example.source);
}

/**
 * Lo que no cumple la plantilla (variante A). Vacío si está bien. Lo usan `doc-pages.spec.ts` y
 * el aviso en desarrollo de `<app-doc-page>`. Lo que necesita el sistema de archivos (los textos
 * de ui-core, el `*-page.ts`) lo comprueba solo la prueba.
 */
export function validateDocPage(page: DocPage): string[] {
  const errors: string[] = [];
  const err = (msg: string) => errors.push(msg);

  if (!page.name.trim()) err('falta el nombre (h1)');
  const lead = countWords(page.lead);
  if (lead < L.leadMin || lead > L.leadMax)
    err(`la frase de cabecera tiene ${lead} palabras (de ${L.leadMin} a ${L.leadMax})`);
  if (!page.install.trim()) err('falta «install» (el nombre en el registro)');

  // Demo
  if (!page.demo.sentence.trim()) err('la demo no tiene su frase');
  const demoLines = exampleLines(page.demo);
  if (demoLines > L.demoLines)
    err(`la demo tiene ${demoLines} líneas (${L.demoLines} como máximo)`);

  // Uso
  const usage = usageTemplateLines(page.usage.code);
  if (usage > L.usageLines) err(`la plantilla de «Uso» tiene ${usage} líneas (${L.usageLines})`);
  if (page.usage.note) {
    const words = countWords(page.usage.note);
    if (words > L.description) err(`la nota de «Uso» tiene ${words} palabras (${L.description})`);
    const sentences = countSentences(page.usage.note);
    if (sentences > L.noteSentences)
      err(`la nota de «Uso» tiene ${sentences} frases (${L.noteSentences})`);
  }

  // Ejemplos
  for (const key of Object.keys(page.examples)) {
    if (!(DOC_EXAMPLE_CATEGORIES as readonly string[]).includes(key))
      err(`categoría de ejemplo desconocida: «${key}»`);
  }
  const live = liveExamples(page);
  if (live.length > L.examples) err(`tiene ${live.length} ejemplos vivos (${L.examples})`);
  // Los id de los h3 de la API también son fijos: un ejemplo no puede usarlos.
  const ids = new Set<string>(['demo', 'forms', ...DOC_API_SECTIONS]);
  for (const e of live) {
    const label = `ejemplo «${e.id}»`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) err(`${label}: el id no es kebab-case`);
    if (ids.has(e.id)) err(`${label}: id repetido`);
    ids.add(e.id);
    if (!e.title.trim()) err(`${label}: sin título`);
    if (!e.sentence.trim() || e.sentence.trim() === e.title.trim()) err(`${label}: sin su frase`);
    const words = countWords(e.sentence);
    if (words > L.sentence) err(`${label}: la frase tiene ${words} palabras (${L.sentence})`);
    for (const f of e.files?.length ? e.files : [{ name: e.id, code: e.source }]) {
      const lines = countLines(f.code);
      if (lines > L.exampleLines)
        err(`${label}: «${f.name}» tiene ${lines} líneas (${L.exampleLines})`);
    }
  }

  // Formularios: las pestañas de R.13 son obligatorias si el componente está en FORMS_SPECS.
  const formsKey = page.install;
  if (FORMS_SPECS[formsKey] && page.forms !== formsKey)
    err(`está en FORMS_SPECS: falta «forms: '${formsKey}'»`);
  if (page.forms && !FORMS_SPECS[page.forms])
    err(`«forms: '${page.forms}'» no está en FORMS_SPECS`);

  // Accesibilidad
  const points = page.accessibility.points.length;
  if (points === 0) err('«Accesibilidad y teclado» no tiene ninguna viñeta');
  if (points > L.accessibilityPoints)
    err(`«Accesibilidad y teclado» tiene ${points} viñetas visibles (${L.accessibilityPoints})`);

  // API
  if (page.api.inputs.length === 0) err('la API no tiene entradas');
  const rows = [
    ...page.api.inputs,
    ...(page.api.outputs ?? []),
    ...(page.api.parts ?? []),
    ...(page.api.service ?? []),
  ];
  for (const row of rows) {
    const words = countWords(row.description);
    if (words > L.description)
      err(`API «${row.name}»: la descripción tiene ${words} palabras (${L.description})`);
  }

  // Variables CSS: obligatorias si el componente tiene tabla.
  const key = tokensKey(page.install);
  if (key in COMPONENT_TOKENS && page.tokens !== key)
    err(`tiene tabla en component-tokens.ts: falta «tokens: '${key}'»`);

  // Prosa y nombres internos
  const visible = prose(page);
  const words = visible.reduce((sum, t) => sum + countWords(t), 0);
  if (words > L.prose) err(`tiene ${words} palabras de prosa visible fuera de la API (${L.prose})`);
  const apiText = rows.map((r) => r.description);
  // Los desplegables (menos «Qué instala») también son texto para el usuario.
  const folded = [...(page.usage.more?.items ?? []), ...(page.accessibility.more ?? [])];
  for (const text of [...visible, ...apiText, ...folded]) {
    const found = INTERNAL_NAMES.find((re) => re.test(text));
    if (found) err(`nombre interno en el texto visible (${found.source}): «${text}»`);
  }

  return errors;
}
