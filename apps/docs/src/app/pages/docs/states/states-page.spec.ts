import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { settle } from '../../../code/code-preview.testing';
import { contrast, parseOklch, tintedVars } from './gray-tints';
import { forcedSelector } from './state-forcer';
import { ROWS, STATES, StatesPage } from './states-page';

/** La página pinta 126 controles (18 × 7) más dos árboles: con toda la suite, unos 25 s. */
const STATES_PAGE_TIMEOUT = 60_000;

describe('Página «Estados»', () => {
  it('fuerza las seudoclases con data-force, sin tocar las escapadas de las clases', () => {
    expect(forcedSelector('.hover\\:bg-x:hover')).toBe(
      '.hover\\:bg-x:is([data-force~="hover"], :has([data-force~="hover"]))',
    );
    expect(forcedSelector('.a:focus-visible')).toBe('.a[data-force~="focus"]');
    expect(forcedSelector('.box:focus-within')).toBe(
      '.box:is([data-force~="focus"], :has([data-force~="focus"]))',
    );
    expect(forcedSelector('.b:active')).toBe(
      '.b:is([data-force~="active"], :has([data-force~="active"]))',
    );
    // Tailwind 4 con grupos: la seudoclase va dentro de :where().
    expect(forcedSelector('.g:is(:where(.group\\/select):hover *)')).toContain(
      ':where(.group\\/select):is([data-force~="hover"]',
    );
    expect(forcedSelector('.focus-visible\\:ring')).toBe('.focus-visible\\:ring');
  });

  it('los grises malva tiñen los neutros con el tono 292 y mantienen el contraste AA', () => {
    const theme: Record<string, string> = {
      '--mimi-background': 'oklch(1 0 0)',
      '--mimi-foreground': 'oklch(0.145 0 0)',
      '--mimi-muted': 'oklch(0.97 0 0)',
      '--mimi-muted-foreground': 'oklch(0.54 0 0)',
      '--mimi-input': 'oklch(1 0 0 / 15%)',
      '--mimi-primary': 'oklch(0.54 0.239 292)',
    };
    const read = (token: string) => theme[token] ?? '';
    expect(tintedVars(0, read, false)).toEqual({});
    const vars = tintedVars(0.014, read, false);
    expect(vars['--mimi-muted-foreground']).toBe('oklch(0.54 0.014 292)');
    // Casi blancos con la mitad del croma, y la transparencia se conserva.
    expect(vars['--mimi-muted']).toBe('oklch(0.97 0.007 292)');
    expect(vars['--mimi-input']).toBe('oklch(1 0.007 292 / 0.15)');
    // Los colores con croma (la marca) no se tocan.
    expect(vars['--mimi-primary']).toBeUndefined();
    expect(vars['--mimi-input-hover']).toContain('30%');
    const ratio = contrast(
      parseOklch(vars['--mimi-muted-foreground'])!,
      parseOklch(vars['--mimi-background'])!,
    );
    expect(ratio).toBeGreaterThanOrEqual(4.5);
    // El mismo par en neutro puro da prácticamente lo mismo.
    const neutral = contrast(parseOklch('oklch(0.54 0 0)')!, parseOklch('oklch(1 0 0)')!);
    expect(Math.abs(ratio - neutral)).toBeLessThan(0.2);
  });

  it(
    'pinta los 18 controles en los 7 estados, con los selectores de profundidad y grises',
    async () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(StatesPage);
      document.body.appendChild(fixture.nativeElement);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;
      expect(ROWS.length).toBe(18);
      expect(STATES.map((s) => s.id)).toEqual([
        'normal',
        'hover',
        'focus',
        'active',
        'disabled',
        'readonly',
        'error',
      ]);
      const grid = el.querySelector<HTMLElement>('[data-test="states-grid"]')!;
      expect(grid.querySelectorAll('tbody tr').length).toBe(18);
      expect(grid.querySelectorAll('[data-cell]').length).toBe(18 * 7);
      // Estados forzados: el elemento interactivo de cada celda lleva su data-force.
      const cell = (row: string, state: string) =>
        grid.querySelector<HTMLElement>(`tr[data-row="${row}"] [data-cell="${state}"]`)!;
      expect(cell('input', 'hover').querySelector('input')!.getAttribute('data-force')).toBe(
        'hover',
      );
      expect(
        cell('select', 'focus')
          .querySelector('mimi-select > div')!
          .hasAttribute('data-focus-visible'),
      ).toBe(true);
      expect(cell('number', 'active').querySelector('[data-surface="write"]')).not.toBeNull();
      expect(cell('select', 'active').querySelector('[data-surface="button"]')).not.toBeNull();
      // Estados fijos de verdad.
      expect(cell('input', 'disabled').querySelector('input')!.disabled).toBe(true);
      expect(cell('input', 'error').querySelector('input')!.getAttribute('aria-invalid')).toBe(
        'true',
      );
      expect(
        cell('select', 'error').querySelector('mimi-select > div')!.hasAttribute('data-invalid'),
      ).toBe(true);
      // Opciones: A recomendada por defecto y el neutro actual.
      expect(grid.getAttribute('data-depth')).toBe('a');
      expect(grid.getAttribute('data-gray')).toBe('neutral');
      expect(el.querySelector('[data-test="depth"]')!.querySelectorAll('button').length).toBe(3);
      expect(el.querySelector('[data-test="gray"]')!.querySelectorAll('button').length).toBe(3);
      // Tree: actual y propuesta, con la selección y el foco forzado.
      expect(el.querySelectorAll('mimi-tree').length).toBe(2);
      expect(
        el
          .querySelector<HTMLElement>('[data-test="tree-proposal"]')!
          .style.getPropertyValue('--mimi-tree-selected'),
      ).toContain('--mimi-primary-subtle');
      fixture.destroy();
    },
    STATES_PAGE_TIMEOUT,
  );
});
