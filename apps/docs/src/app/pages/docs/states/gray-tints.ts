/*
 * Grises de la página «Estados» (12/11/2026): los neutros del tema (croma 0) teñidos con el tono
 * 292 del violeta de la marca, con croma baja y la misma luminosidad. Como la luminosidad no
 * cambia, los contrastes casi no se mueven; se calculan aquí para comprobar que siguen en AA.
 */

/** Las opciones de grises que se comparan. `chroma` 0 es el tema tal cual. */
export const GRAY_OPTIONS = [
  { id: 'neutral', label: 'Neutro puro (actual)', chroma: 0 },
  { id: 'mauve-soft', label: 'Malva suave', chroma: 0.006 },
  { id: 'mauve-medium', label: 'Malva medio', chroma: 0.014 },
] as const;
export type GrayOption = (typeof GRAY_OPTIONS)[number]['id'];

/** Tono del violeta de la marca (`--mimi-brand-*`, R.0). */
export const BRAND_HUE = 292;

/** Los neutros del tema que se tiñen (los que valen `oklch(L 0 0)`, con o sin transparencia). */
export const NEUTRAL_TOKENS = [
  '--mimi-background',
  '--mimi-foreground',
  '--mimi-card',
  '--mimi-card-foreground',
  '--mimi-popover',
  '--mimi-popover-foreground',
  '--mimi-secondary',
  '--mimi-secondary-foreground',
  '--mimi-muted',
  '--mimi-muted-foreground',
  '--mimi-accent',
  '--mimi-accent-foreground',
  '--mimi-border',
  '--mimi-input',
  '--mimi-input-background',
] as const;

const OKLCH = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/;

export interface Oklch {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

export function parseOklch(text: string): Oklch | null {
  const m = OKLCH.exec(text.trim());
  if (!m) return null;
  const l = Number(m[1]) / (m[2] ? 100 : 1);
  const alpha = m[5] === undefined ? 1 : Number(m[5]) / (m[6] ? 100 : 1);
  return { l, c: Number(m[3]), h: Number(m[4]), alpha };
}

export function formatOklch({ l, c, h, alpha }: Oklch): string {
  const base = `${+l.toFixed(4)} ${+c.toFixed(4)} ${+h.toFixed(1)}`;
  return alpha < 1 ? `oklch(${base} / ${+alpha.toFixed(3)})` : `oklch(${base})`;
}

/**
 * Las variables a escribir en la cuadrícula para una opción: cada neutro con el croma pedido y el
 * tono de la marca. `read` da el valor declarado de cada token (en claro o en oscuro). Las que el
 * tema calcula a partir de ellas (el borde con hover) se vuelven a declarar, porque una variable
 * con `var()` se resuelve donde se declara.
 */
export function tintedVars(
  chroma: number,
  read: (token: string) => string,
  dark: boolean,
): Record<string, string> {
  if (!chroma) return {};
  const vars: Record<string, string> = {};
  for (const token of NEUTRAL_TOKENS) {
    const color = parseOklch(read(token));
    if (!color || color.c !== 0) continue;
    // Un poco menos de croma en los casi blancos y casi negros, como hacen los grises teñidos.
    const edge = color.l > 0.96 || color.l < 0.2 ? 0.5 : 1;
    vars[token] = formatOklch({ ...color, c: chroma * edge, h: BRAND_HUE });
  }
  vars['--mimi-input-hover'] =
    `color-mix(in oklab, var(--mimi-foreground) ${dark ? 14 : 30}%, var(--mimi-input))`;
  return vars;
}

/** Luminancia relativa (WCAG) de un color OKLCH opaco. */
export function luminance({ l, c, h }: Oklch): number {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const r = clamp(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_);
  const g = clamp(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_);
  const bl = clamp(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_);
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

/** Contraste WCAG entre dos colores OKLCH opacos. */
export function contrast(a: Oklch, b: Oklch): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Los pares de texto que se comprueban (AA: 4,5 para texto normal). */
export const CONTRAST_PAIRS = [
  ['--mimi-foreground', '--mimi-background', 'Texto sobre el fondo'],
  ['--mimi-muted-foreground', '--mimi-background', 'Texto atenuado sobre el fondo'],
  ['--mimi-muted-foreground', '--mimi-muted', 'Texto atenuado sobre muted'],
  ['--mimi-muted-foreground', '--mimi-card', 'Texto atenuado sobre una tarjeta'],
  ['--mimi-secondary-foreground', '--mimi-secondary', 'Texto sobre secondary'],
] as const;
