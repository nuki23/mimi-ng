import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MIMI_THEME,
  MIMI_THEME_STYLE_ID,
  applyMimiTheme,
  mimiThemeToCss,
  provideMimiTheme,
} from './provider';

describe('mimiThemeToCss', () => {
  it('devuelve cadena vacía con un preset vacío', () => {
    expect(mimiThemeToCss({})).toBe('');
    expect(mimiThemeToCss({ name: 'Solo nombre', colors: {}, components: { button: {} } })).toBe(
      '',
    );
  });

  it('pone los colores claros en :root:not(.dark)', () => {
    expect(
      mimiThemeToCss({ colors: { primary: 'oklch(0.5 0.2 290)', primaryForeground: 'white' } }),
    ).toBe(
      ':root:not(.dark) {\n' +
        '  --mimi-primary: oklch(0.5 0.2 290);\n' +
        '  --mimi-primary-foreground: white;\n' +
        '}\n',
    );
  });

  it('pone darkColors en .dark, después del modo claro', () => {
    const css = mimiThemeToCss({
      colors: { primary: 'red', inputBackground: 'white' },
      darkColors: { primary: 'pink' },
    });
    expect(css).toContain(
      ':root:not(.dark) {\n  --mimi-primary: red;\n  --mimi-input-background: white;\n}',
    );
    expect(css).toContain('.dark {\n  --mimi-primary: pink;\n}');
    expect(css.indexOf(':root:not(.dark)')).toBeLessThan(css.indexOf('.dark {'));
  });

  it('convierte controles, componentes, radios, fuentes y sombras con el mapa de nombres', () => {
    const css = mimiThemeToCss({
      radius: '4px',
      radii: { sm: '2px', card: '8px', badge: '4px' },
      fonts: { sans: 'Inter, sans-serif' },
      controls: { height: '36px', heightSm: '28px', heightLg: '44px' },
      components: {
        button: { fontWeight: 600, paddingX: '1rem' },
        input: { placeholderColor: 'gray' },
        card: { paddingHeader: '1.5rem' },
      },
      shadows: { primaryHover: 'none' },
      darkShadows: { card: 'none' },
    });
    for (const line of [
      '--mimi-radius: 4px;',
      '--mimi-radius-sm: 2px;',
      '--mimi-radius-card: 8px;',
      '--mimi-badge-radius: 4px;',
      '--mimi-font-sans: Inter, sans-serif;',
      '--mimi-control-height: 36px;',
      '--mimi-control-height-sm: 28px;',
      '--mimi-control-height-lg: 44px;',
      '--mimi-btn-font-weight: 600;',
      '--mimi-btn-padding-x: 1rem;',
      '--mimi-input-placeholder-color: gray;',
      '--mimi-card-padding-header: 1.5rem;',
      '--mimi-shadow-primary-hover: none;',
      '--mimi-shadow-card: none;',
    ]) {
      expect(css).toContain(line);
    }
    expect(css.startsWith(':root {\n  --mimi-radius: 4px;')).toBe(true);
  });

  it('omite las propiedades undefined y vacías', () => {
    const css = mimiThemeToCss({
      radius: undefined,
      colors: { primary: undefined, ring: '', secondary: 'blue' },
      controls: { height: undefined },
    });
    expect(css).toBe(':root:not(.dark) {\n  --mimi-secondary: blue;\n}\n');
  });

  it('convierte overlay en claro y en oscuro', () => {
    const css = mimiThemeToCss({
      colors: { overlay: 'oklch(0 0 0 / 40%)' },
      darkColors: { overlay: 'oklch(0 0 0 / 70%)' },
    });
    expect(css).toBe(
      ':root:not(.dark) {\n  --mimi-overlay: oklch(0 0 0 / 40%);\n}\n' +
        '.dark {\n  --mimi-overlay: oklch(0 0 0 / 70%);\n}\n',
    );
  });

  it('nunca emite los derivados con color-mix', () => {
    const css = mimiThemeToCss({
      colors: { primary: 'red', ring: 'red', destructive: 'red', success: 'green', info: 'blue' },
    });
    expect(css).not.toMatch(
      /--mimi-(primary-hover|ring-soft|destructive-soft|destructive-ring|switch-off|success-soft|success-hover|success-ring|info-soft):/,
    );
  });

  it('convierte los tonos, tooltip, glass y softMix en claro y en oscuro', () => {
    const css = mimiThemeToCss({
      colors: {
        success: 'green',
        successForeground: 'white',
        successSoftForeground: 'darkgreen',
        warningSoftForeground: 'brown',
        infoForeground: 'white',
        destructiveSoftForeground: 'darkred',
        softMix: '15%',
        tooltip: 'black',
        tooltipForeground: 'white',
        glass: 'oklch(1 0 0 / 0.5)',
        glassBorder: 'transparent',
      },
      darkColors: { success: 'lime', softMix: '20%', tooltip: 'white' },
    });
    for (const line of [
      '--mimi-success: green;',
      '--mimi-success-foreground: white;',
      '--mimi-success-soft-foreground: darkgreen;',
      '--mimi-warning-soft-foreground: brown;',
      '--mimi-info-foreground: white;',
      '--mimi-destructive-soft-foreground: darkred;',
      '--mimi-soft-mix: 15%;',
      '--mimi-tooltip: black;',
      '--mimi-tooltip-foreground: white;',
      '--mimi-glass: oklch(1 0 0 / 0.5);',
      '--mimi-glass-border: transparent;',
    ]) {
      expect(css).toContain(line);
    }
    expect(css).toContain(
      '.dark {\n  --mimi-success: lime;\n  --mimi-soft-mix: 20%;\n  --mimi-tooltip: white;\n}',
    );
  });

  it('sombras de tono y popover van a --mimi-shadow-*; el glow, a --mimi-glow-* sin «shadow-»', () => {
    const css = mimiThemeToCss({
      shadows: {
        success: 'a',
        warningHover: 'b',
        infoHover: 'c',
        popover: 'd',
        glow: 'e',
        glowPrimary: 'f',
        glowDestructive: 'g',
      },
      darkShadows: { glowInfo: 'h' },
    });
    for (const line of [
      '--mimi-shadow-success: a;',
      '--mimi-shadow-warning-hover: b;',
      '--mimi-shadow-info-hover: c;',
      '--mimi-shadow-popover: d;',
      '--mimi-glow: e;',
      '--mimi-glow-primary: f;',
      '--mimi-glow-destructive: g;',
    ]) {
      expect(css).toContain(line);
    }
    expect(css).toContain('.dark {\n  --mimi-glow-info: h;\n}');
    expect(css).not.toContain('--mimi-shadow-glow');
  });

  it('effects va a :root (igual en claro y oscuro)', () => {
    expect(mimiThemeToCss({ effects: { overlayBlur: '4px', glassBlur: '20px' } })).toBe(
      ':root {\n  --mimi-overlay-blur: 4px;\n  --mimi-glass-blur: 20px;\n}\n',
    );
  });

  it('controls: las alturas llevan control-; los compartidos van sin prefijo', () => {
    const css = mimiThemeToCss({
      controls: {
        height: '36px',
        focusRing: '0 0 0 2px red',
        focusOutline: '2px solid red',
        focusOffset: '1px',
        disabledOpacity: 0.4,
        iconSize: '1.25rem',
        iconSizeSm: '1rem',
      },
    });
    for (const line of [
      '--mimi-control-height: 36px;',
      '--mimi-focus-ring: 0 0 0 2px red;',
      '--mimi-focus-outline: 2px solid red;',
      '--mimi-focus-offset: 1px;',
      '--mimi-disabled-opacity: 0.4;',
      '--mimi-icon-size: 1.25rem;',
      '--mimi-icon-size-sm: 1rem;',
    ]) {
      expect(css).toContain(line);
    }
    expect(css).not.toMatch(/--mimi-control-(focus|disabled|icon)/);
  });

  it('agrega el bloque de movimiento reducido si el preset cambia el movimiento', () => {
    expect(mimiThemeToCss({ colors: { primary: 'red' } })).not.toContain('prefers-reduced-motion');
    const css = mimiThemeToCss({ motion: { pressScale: 0.95 } });
    expect(css).toContain('--mimi-press-scale: 0.95;');
    expect(css).toContain(
      '@media (prefers-reduced-motion: reduce) {\n  :root {\n    --mimi-press-scale: 1;\n    --mimi-press-scale-sm: 1;\n    --mimi-lift: 0;\n  }\n}',
    );
  });

  it('pressScaleSm va a --mimi-press-scale-sm y activa el bloque de movimiento reducido', () => {
    const css = mimiThemeToCss({ motion: { pressScaleSm: 0.85 } });
    expect(css).toContain(':root {\n  --mimi-press-scale-sm: 0.85;\n}');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('    --mimi-press-scale-sm: 1;');
  });

  it('shadows.thumb va a --mimi-shadow-thumb', () => {
    expect(mimiThemeToCss({ shadows: { thumb: 'none' } })).toContain('--mimi-shadow-thumb: none;');
  });

  it('ignora valores que romperían el CSS y avisa en modo desarrollo', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const css = mimiThemeToCss({
      colors: { primary: 'red; } body { display: none', ring: '</style><script>', accent: 'blue' },
    });
    expect(css).toBe(':root:not(.dark) {\n  --mimi-accent: blue;\n}\n');
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});

describe('applyMimiTheme', () => {
  let document: Document;

  beforeEach(() => {
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    document.getElementById(MIMI_THEME_STYLE_ID)?.remove();
    document.querySelectorAll('[data-test-style]').forEach((el) => el.remove());
    document.documentElement.classList.remove('dark');
  });

  const themeStyles = () => document.querySelectorAll(`style#${MIMI_THEME_STYLE_ID}`);

  it('crea un solo <style> y lo reutiliza al aplicar otro preset', () => {
    applyMimiTheme(document, { colors: { primary: 'red' } });
    const first = themeStyles()[0];
    applyMimiTheme(document, { colors: { primary: 'blue' } });

    expect(themeStyles().length).toBe(1);
    expect(themeStyles()[0]).toBe(first);
    expect(first.textContent).toContain('--mimi-primary: blue;');
    expect(first.textContent).not.toContain('red');
  });

  it('queda al final del <head>, también después de estilos agregados más tarde', () => {
    const globalCss = document.createElement('link');
    globalCss.rel = 'stylesheet';
    globalCss.setAttribute('data-test-style', '');
    document.head.appendChild(globalCss);

    applyMimiTheme(document, { radius: '4px' });
    expect(document.head.lastElementChild?.id).toBe(MIMI_THEME_STYLE_ID);

    const later = document.createElement('style');
    later.setAttribute('data-test-style', '');
    document.head.appendChild(later);
    applyMimiTheme(document, { radius: '8px' });
    expect(document.head.lastElementChild?.id).toBe(MIMI_THEME_STYLE_ID);
  });

  it('elimina el <style> con un preset vacío o null', () => {
    applyMimiTheme(document, { radius: '4px' });
    applyMimiTheme(document, {});
    expect(themeStyles().length).toBe(0);

    applyMimiTheme(document, { radius: '4px' });
    applyMimiTheme(document, null);
    expect(themeStyles().length).toBe(0);
  });

  it('en modo claro el preset le gana a theme-base.css (getComputedStyle)', () => {
    // jsdom tiene un fallo reproducible en la cascada de variables: una regla posterior que NO
    // aplica al elemento (p. ej. ':root:not(.dark)' con .dark, o hasta '.otra { --x: z }')
    // puede hacer que devuelva el valor de ':root' en lugar del de '.dark'. Por eso aquí solo se
    // comprueba el modo claro; el modo oscuro (que conserve el primario de la base o use
    // darkColors) está cubierto por las pruebas del texto CSS y se verifica en el navegador
    // en /dev/theme.
    const base = ':root { --mimi-primary: base-claro; } .dark { --mimi-primary: base-oscuro; }\n';
    const sheet = document.createElement('style');
    sheet.setAttribute('data-test-style', '');
    sheet.textContent = base + mimiThemeToCss({ radius: '4px', colors: { primary: 'violeta' } });
    document.head.appendChild(sheet);

    const html = getComputedStyle(document.documentElement);
    expect(html.getPropertyValue('--mimi-primary').trim()).toBe('violeta');
    expect(html.getPropertyValue('--mimi-radius').trim()).toBe('4px');
  });
});

describe('provideMimiTheme', () => {
  afterEach(() => TestBed.inject(DOCUMENT).getElementById(MIMI_THEME_STYLE_ID)?.remove());

  it('aplica el preset al iniciar la app y lo expone en MIMI_THEME', () => {
    const preset = { colors: { primary: 'red' } };
    TestBed.configureTestingModule({ providers: [provideMimiTheme(preset)] });

    expect(TestBed.inject(MIMI_THEME)).toBe(preset);
    const style = TestBed.inject(DOCUMENT).getElementById(MIMI_THEME_STYLE_ID);
    expect(style?.textContent).toContain('--mimi-primary: red;');
  });

  it('sin provideMimiTheme no crea ningún <style>', () => {
    const document = TestBed.inject(DOCUMENT);
    expect(document.getElementById(MIMI_THEME_STYLE_ID)).toBeNull();
  });
});

describe('theme-base.css: compatibilidad de destructive-soft con la 0.1.0 (spec 12)', () => {
  // Las pruebas corren en Node: se lee el CSS con fs, sin importarlo (ver imports.spec.ts).
  const node = (
    globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
  ).process;
  const fs = node.getBuiltinModule('node:fs') as {
    readFileSync(path: string, enc: 'utf8'): string;
  };
  const css = fs.readFileSync(
    `${node.cwd()}/packages/ui-core/src/lib/theme/theme-base.css`,
    'utf8',
  );
  const block = (selector: string) => {
    const start = css.indexOf(`${selector} {`);
    return css.slice(start, css.indexOf('\n}', start));
  };

  it('--mimi-destructive-soft es alias de --mimi-destructive-ring en claro y oscuro', () => {
    for (const selector of [':root', '.dark']) {
      expect(block(selector)).toContain('--mimi-destructive-ring: color-mix(');
      expect(block(selector)).toContain('--mimi-destructive-soft: var(--mimi-destructive-ring);');
    }
  });

  it('ring-destructive-soft sigue generando el color del anillo (Tailwind lee --color-destructive-soft)', () => {
    const theme = block('@theme inline');
    expect(theme).toContain('--color-destructive-soft: var(--mimi-destructive-ring);');
    expect(theme).toContain('--color-destructive-ring: var(--mimi-destructive-ring);');
    expect(theme).toContain('--color-destructive-soft-bg: var(--mimi-destructive-soft-bg);');
  });
});
