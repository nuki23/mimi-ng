/*
 * Conversiones de color del Color Picker (G2.12). El valor es siempre hex de 6 dígitos en
 * minúsculas (decidido por defecto, opción (a)); se elige en HSV (como el diseño) y se puede ver
 * y escribir en OKLCH, recortado a sRGB.
 */

export interface MimiRgb {
  r: number;
  g: number;
  b: number;
}

export interface MimiHsv {
  /** Tono, 0–360. */
  h: number;
  /** Saturación y brillo, 0–1. */
  s: number;
  v: number;
}

/** Formato en el que se ve y se escribe el color. */
export type MimiColorFormat = 'hex' | 'oklch';

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

/** `#4f46e5`, `#fff` (con o sin `#`, mayúsculas o minúsculas) → hex de 6 dígitos, o null. */
export function mimiNormalizeHex(text: string | null | undefined): string | null {
  // Un formulario puede mandar `null` o `undefined` (ngModel antes de escribir el valor).
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((text ?? '').trim());
  if (!match) return null;
  const hex = match[1].toLowerCase();
  return '#' + (hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex);
}

export function mimiHexToRgb(hex: string): MimiRgb | null {
  const normal = mimiNormalizeHex(hex);
  if (!normal) return null;
  const n = parseInt(normal.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function mimiRgbToHex({ r, g, b }: MimiRgb): string {
  return (
    '#' +
    [r, g, b]
      .map((c) =>
        Math.round(clamp(c, 0, 255))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

export function mimiRgbToHsv({ r, g, b }: MimiRgb): MimiHsv {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

export function mimiHsvToRgb({ h, s, v }: MimiHsv): MimiRgb {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

/** sRGB → OKLCH (`l` 0–1, `c` ≥ 0, `h` 0–360). */
export function mimiRgbToOklch({ r, g, b }: MimiRgb): { l: number; c: number; h: number } {
  const [lr, lg, lb] = [r / 255, g / 255, b / 255].map(toLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: C < 1e-4 ? 0 : H };
}

/** OKLCH → sRGB. `clipped` dice si estaba fuera de sRGB y se recortó. */
export function mimiOklchToRgb(
  l: number,
  c: number,
  h: number,
): { rgb: MimiRgb; clipped: boolean } {
  const hr = (h * Math.PI) / 180;
  const A = c * Math.cos(hr);
  const B = c * Math.sin(hr);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const linear = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ].map(fromLinear);
  const clipped = linear.some((x) => x < -1e-4 || x > 1 + 1e-4);
  const [r, g, b] = linear.map((x) => clamp(x) * 255);
  return { rgb: { r, g, b }, clipped };
}

/** `oklch(0.511 0.230 276.9)`. */
export function mimiFormatOklch(hex: string): string {
  const rgb = mimiHexToRgb(hex);
  if (!rgb) return '';
  const { l, c, h } = mimiRgbToOklch(rgb);
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

/**
 * Lee un color escrito: hex (`#4f46e5`, `#fff`) u `oklch(L C H)` (L en 0–1 o en %). Devuelve el
 * hex y si se recortó a sRGB, o null si no se entiende.
 */
export function mimiParseColor(
  text: string | null | undefined,
): { hex: string; clipped: boolean } | null {
  const hex = mimiNormalizeHex(text);
  if (hex) return { hex, clipped: false };
  const match = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/i.exec(
    (text ?? '').trim(),
  );
  if (!match) return null;
  const l = +match[1] / (match[2] ? 100 : 1);
  const c = +match[3];
  const h = +match[4];
  if ([l, c, h].some(Number.isNaN) || l > 1) return null;
  const { rgb, clipped } = mimiOklchToRgb(l, c, h);
  return { hex: mimiRgbToHex(rgb), clipped };
}
