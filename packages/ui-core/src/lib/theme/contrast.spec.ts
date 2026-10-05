/**
 * Contraste AA (4,5:1) de cada texto sobre su fondo, en reposo y en hover, en claro y oscuro,
 * con los tokens reales de theme-base.css (spec 13). Sin dependencias: se resuelven var(),
 * oklch() y color-mix() como el navegador, y los colores con transparencia se componen sobre el
 * fondo de la página en sRGB.
 *
 * Las pruebas corren en Node: se lee el CSS con fs, sin importarlo (ver imports.spec.ts). Los
 * nombres de nivel superior llevan el prefijo «contrast» para no chocar con los de ese archivo.
 */

type Oklab = { L: number; a: number; b: number; alpha: number };

const contrastNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const contrastCss = (
  contrastNode.getBuiltinModule('node:fs') as { readFileSync(p: string, e: 'utf8'): string }
).readFileSync(`${contrastNode.cwd()}/packages/ui-core/src/lib/theme/theme-base.css`, 'utf8');

/** Variables --mimi-* de un bloque (`:root` o `.dark`), con los saltos de línea normalizados. */
function contrastBlock(selector: string): Map<string, string> {
  const start = contrastCss.indexOf(`\n${selector} {`);
  const body = contrastCss.slice(start, contrastCss.indexOf('\n}', start + 1));
  const vars = new Map<string, string>();
  for (const m of body.matchAll(/--mimi-([a-z0-9-]+):\s*([^;]+);/g)) {
    vars.set(m[1], m[2].replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim());
  }
  return vars;
}

/** Divide por comas de primer nivel (no las de dentro de paréntesis). */
function contrastSplit(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of text) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else current += ch;
  }
  parts.push(current.trim());
  return parts;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

function contrastResolver(mode: Map<string, string>) {
  const percent = (text: string): number => {
    const v = text.startsWith('var(') ? resolveRaw(text) : text;
    return parseFloat(v) / 100;
  };
  const resolveRaw = (text: string): string => {
    const name = /^var\(--mimi-([a-z0-9-]+)\)$/.exec(text)?.[1];
    const value = name ? mode.get(name) : undefined;
    if (value === undefined) throw new Error(`Variable sin resolver: ${text}`);
    return value;
  };

  const color = (text: string): Oklab => {
    text = text.trim();
    if (text === 'transparent') return { L: 0, a: 0, b: 0, alpha: 0 };
    if (text.startsWith('var(')) return color(resolveRaw(text));
    const oklch = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+)(%?))?\)$/.exec(text);
    if (oklch) {
      const [, L, C, H, alpha, pct] = oklch;
      const al = alpha === undefined ? 1 : pct ? +alpha / 100 : +alpha;
      return { L: +L, a: +C * Math.cos(toRad(+H)), b: +C * Math.sin(toRad(+H)), alpha: al };
    }
    const mix = /^color-mix\(in (oklab|oklch), (.*)\)$/.exec(text);
    if (mix) return colorMix(mix[1] as 'oklab' | 'oklch', contrastSplit(mix[2]));
    throw new Error(`Color no soportado: ${text}`);
  };

  /** color-mix con las reglas de CSS: porcentajes normalizados y alfa si suman menos de 100 %. */
  function colorMix(space: 'oklab' | 'oklch', args: string[]): Oklab {
    const parse = (arg: string) => {
      const m = /^(.*?)(?: ((?:var\([^)]*\))|[\d.]+%))?$/.exec(arg)!;
      return { c: color(m[1]), p: m[2] === undefined ? undefined : percent(m[2]) };
    };
    const [x, y] = args.map(parse);
    let p1 = x.p ?? (y.p === undefined ? 0.5 : 1 - y.p);
    let p2 = y.p ?? 1 - p1;
    const sum = p1 + p2;
    const alphaMult = sum < 1 ? sum : 1;
    p1 /= sum;
    p2 /= sum;
    // Interpolación premultiplicada por alfa; los componentes de un color transparente no cuentan.
    const alpha = x.c.alpha * p1 + y.c.alpha * p2;
    const w1 = (x.c.alpha * p1) / (alpha || 1);
    const w2 = (y.c.alpha * p2) / (alpha || 1);
    let L = x.c.L * w1 + y.c.L * w2;
    let a: number;
    let b: number;
    if (space === 'oklab') {
      a = x.c.a * w1 + y.c.a * w2;
      b = x.c.b * w1 + y.c.b * w2;
    } else {
      // En oklch el tono de un gris no cuenta (powerless): se usa el del otro color.
      const lch = (c: Oklab) => ({ C: Math.hypot(c.a, c.b), H: Math.atan2(c.b, c.a) });
      const A = lch(x.c);
      const B = lch(y.c);
      const H = A.C < 1e-4 ? B.H : B.C < 1e-4 || y.c.alpha === 0 ? A.H : A.H * w1 + B.H * w2;
      const C = A.C * w1 + B.C * w2;
      a = C * Math.cos(H);
      b = C * Math.sin(H);
      if (y.c.alpha === 0) L = x.c.L;
    }
    return { L, a, b, alpha: alpha * alphaMult };
  }

  return { color };
}

function toLinearSrgb({ L, a, b }: Oklab): number[] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((v) => Math.min(1, Math.max(0, v)));
}
const encode = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const decode = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

/** Luminancia relativa del color, compuesto sobre `page` si tiene transparencia. */
function luminance(c: Oklab, page: Oklab): number {
  const fg = toLinearSrgb(c).map(encode);
  const bg = toLinearSrgb(page).map(encode);
  const rgb = fg.map((v, i) => decode(v * c.alpha + bg[i] * (1 - c.alpha)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/** [qué es, texto, fondo]: cada combinación de Button y Badge, en reposo y en hover. */
const CONTRAST_PAIRS: [string, string, string][] = [
  ['primary solid', 'primary-foreground', 'primary'],
  ['primary solid hover', 'primary-foreground', 'primary-hover'],
  ['primary soft', 'secondary-foreground', 'secondary'],
  ['primary soft hover', 'secondary-foreground', 'primary-soft-hover'],
  ['primary outline', 'secondary-foreground', 'background'],
  ['primary outline hover', 'secondary-foreground', 'primary-subtle'],
  ['primary link', 'primary', 'background'],
  ['secondary solid', 'secondary-foreground', 'secondary'],
  ['secondary solid hover', 'secondary-foreground', 'secondary-hover'],
  ['secondary soft', 'foreground', 'muted'],
  ['outline/ghost neutros', 'foreground', 'card'],
  ['outline/ghost neutros hover', 'accent-foreground', 'accent'],
  ['badge outline', 'foreground', 'background'],
  ...(['success', 'warning', 'info', 'destructive'] as const).flatMap(
    (t): [string, string, string][] => {
      const soft = t === 'destructive' ? 'destructive-soft-bg' : `${t}-soft`;
      return [
        [`${t} solid`, `${t}-foreground`, t],
        [`${t} solid hover`, `${t}-foreground`, `${t}-hover`],
        [`${t} soft`, `${t}-soft-foreground`, soft],
        [`${t} soft hover`, `${t}-soft-foreground`, `${t}-soft-hover`],
        [`${t} outline, ghost y link`, `${t}-soft-foreground`, 'background'],
        [`${t} outline hover`, `${t}-soft-foreground`, `${t}-subtle`],
        [`${t} ghost hover`, `${t}-soft-foreground`, soft],
      ];
    },
  ),
];

describe('Contraste AA de los tokens (theme-base.css)', () => {
  const light = contrastBlock(':root');
  const dark = new Map([...light, ...contrastBlock('.dark')]);

  for (const [modeName, mode] of [
    ['claro', light],
    ['oscuro', dark],
  ] as const) {
    const { color } = contrastResolver(mode);
    const page = color('var(--mimi-background)');
    it.each(CONTRAST_PAIRS)(`${modeName}: %s (%s sobre %s) ≥ 4,5:1`, (_, text, bg) => {
      const bgColor = color(`var(--mimi-${bg})`);
      // El fondo puede ser translúcido: se compone sobre la página.
      const bgLum = luminance(bgColor, page);
      const textLum = luminance(color(`var(--mimi-${text})`), bgColor.alpha < 1 ? page : bgColor);
      const [hi, lo] = [bgLum, textLum].sort((p, q) => q - p);
      const ratio = (hi + 0.05) / (lo + 0.05);
      expect(ratio, `${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('reproduce las cifras de contraste del diseño (F2 Tokens y Tonos, en reposo)', () => {
    const { color } = contrastResolver(light);
    const ratio = (text: string, bg: string) => {
      const a = luminance(color(`var(--mimi-${text})`), color('var(--mimi-background)'));
      const b = luminance(color(`var(--mimi-${bg})`), color('var(--mimi-background)'));
      const [hi, lo] = [a, b].sort((p, q) => q - p);
      return (hi + 0.05) / (lo + 0.05);
    };
    expect(ratio('success-foreground', 'success')).toBeCloseTo(4.81, 1);
    expect(ratio('warning-foreground', 'warning')).toBeCloseTo(7.64, 1);
    expect(ratio('info-foreground', 'info')).toBeCloseTo(4.79, 1);
    expect(ratio('destructive-foreground', 'destructive')).toBeCloseTo(4.56, 1);
    expect(ratio('success-soft-foreground', 'success-soft')).toBeCloseTo(6.83, 1);
  });
});
