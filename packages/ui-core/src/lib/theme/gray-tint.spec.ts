import { MIMI_THEME_NEUTRAL } from './neutral';

/**
 * Grises «malva suave» (decidido por el usuario el 12/11/2026): los neutros del tema llevan el
 * tono 292 del violeta con croma baja (0,006; 0,003 en los casi blancos y casi negros) y la misma
 * luminosidad que el neutro puro. El contraste AA lo comprueba contrast.spec.ts con estos mismos
 * valores. `MIMI_THEME_NEUTRAL` vuelve a poner todos los grises en croma 0.
 */
const grayNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const grayCss = (
  grayNode.getBuiltinModule('node:fs') as { readFileSync(p: string, e: 'utf8'): string }
).readFileSync(`${grayNode.cwd()}/packages/ui-core/src/lib/theme/theme-base.css`, 'utf8');

const GRAY_TOKENS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'border',
  'input',
  'input-background',
] as const;

/** El valor de una variable en el bloque `:root` (el primero) o `.dark`. */
function grayValue(selector: ':root' | '.dark', token: string): string {
  const start = grayCss.indexOf(`\n${selector} {`);
  const body = grayCss.slice(start, grayCss.indexOf('\n}', start + 1));
  const match = new RegExp(`--mimi-${token}:\\s*([^;]+);`).exec(body);
  if (!match) throw new Error(`--mimi-${token} no está en ${selector}`);
  return match[1].trim();
}

const GRAY_OKLCH = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)/;

describe('Grises malva suave', () => {
  for (const selector of [':root', '.dark'] as const) {
    it(`${selector}: los 15 grises con tono 292 y croma 0,006 (0,003 en los extremos)`, () => {
      for (const token of GRAY_TOKENS) {
        const value = grayValue(selector, token);
        const match = GRAY_OKLCH.exec(value);
        expect(match, `${token}: ${value}`).not.toBeNull();
        const [, l, c, h] = match!.map(Number);
        expect(h, token).toBe(292);
        const edge = l > 0.96 || l < 0.2;
        expect(c, `${token}: ${value}`).toBe(edge ? 0.003 : 0.006);
      }
    });
  }

  it('MIMI_THEME_NEUTRAL vuelve a poner los grises en neutro puro (croma 0)', () => {
    const keys = [
      'background',
      'foreground',
      'card',
      'cardForeground',
      'popover',
      'popoverForeground',
      'secondary',
      'secondaryForeground',
      'muted',
      'mutedForeground',
      'accent',
      'accentForeground',
      'border',
      'input',
      'inputBackground',
    ] as const;
    for (const colors of [MIMI_THEME_NEUTRAL.colors!, MIMI_THEME_NEUTRAL.darkColors!]) {
      for (const key of keys) {
        expect(colors[key], key).toMatch(/^oklch\([\d.]+ 0 0( \/ [\d.]+%)?\)$/);
      }
    }
  });
});
