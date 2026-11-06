/**
 * Contraste de un color de la página «Tema» (plan 5.2): `oklch(L C H)` (las muestras) o `#rrggbb`
 * (el `<input type="color">`). Cálculo de WCAG 2 sobre sRGB; oklch se convierte como el
 * navegador (OKLab → LMS → sRGB lineal, recortado a la gama).
 */

/** sRGB lineal (0–1) de un color, o null si el formato no es uno de los dos. */
export function linearRgb(color: string): [number, number, number] | null {
  const text = color.trim().toLowerCase();
  const hex = /^#([0-9a-f]{6})$/.exec(text);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => decode(v / 255)) as [
      number,
      number,
      number,
    ];
  }
  const ok = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(text);
  if (!ok) return null;
  const L = ok[2] ? +ok[1] / 100 : +ok[1];
  const C = +ok[3];
  const h = (+ok[4] * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v))) as [number, number, number];
}

const decode = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

/** Luminancia relativa (WCAG 2). */
export function luminance(color: string): number {
  const rgb = linearRgb(color);
  if (!rgb) return NaN;
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/** Contraste entre dos colores (1 a 21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Los dos textos posibles sobre el color principal: el claro del diseño y el `foreground`. */
export const LIGHT_TEXT = 'oklch(0.99 0 0)';
export const DARK_TEXT = 'oklch(0.145 0 0)';

/** El texto que mejor contrasta con el color, y su contraste. */
export function bestText(color: string): { text: string; ratio: number } {
  const light = contrast(color, LIGHT_TEXT);
  const dark = contrast(color, DARK_TEXT);
  return light >= dark ? { text: LIGHT_TEXT, ratio: light } : { text: DARK_TEXT, ratio: dark };
}
