import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { settle } from '../../../code/code-preview.testing';
import { forcedSelector } from './state-forcer';
import { ROWS, STATES, StatesPage } from './states-page';

/** La página pinta 133 celdas (19 × 7): con toda la suite, unos 25 s. */
const STATES_PAGE_TIMEOUT = 60_000;

const statesNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const statesFs = statesNode.getBuiltinModule('node:fs') as {
  readFileSync(path: string, encoding: 'utf8'): string;
  readdirSync(path: string): string[];
  existsSync(path: string): boolean;
};
const STATES_COMPONENTS = `${statesNode.cwd()}/packages/ui-core/src/lib/components`;

/**
 * Los controles de formulario de ui-core: los que implementan `FormValueControl` o
 * `FormCheckboxControl`, y los que leen el estado del formulario con `injectFieldState()` (Input y
 * Textarea, que son nativos, y los demás) o con `NgControl`. Form Field no cuenta: es el
 * envoltorio de la etiqueta y el error, no un control.
 */
function formControlFolders(): string[] {
  return statesFs
    .readdirSync(STATES_COMPONENTS)
    .filter((folder) => folder !== 'form-field')
    .filter((folder) => {
      const dir = `${STATES_COMPONENTS}/${folder}`;
      if (!statesFs.existsSync(`${dir}/${folder}.ts`)) return false;
      const files = statesFs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'));
      return files.some((f) =>
        /implements[^{]*\b(FormValueControl|FormCheckboxControl)\b|\bNgControl\b|injectFieldState\(/.test(
          statesFs.readFileSync(`${dir}/${f}`, 'utf8'),
        ),
      );
    });
}

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

  it('cada control de formulario de ui-core tiene su fila en la cuadrícula', () => {
    const folders = formControlFolders();
    // Si la detección se rompe y no encuentra nada, la prueba no debe pasar sola.
    expect(folders.length).toBeGreaterThanOrEqual(17);
    const sources = new Set(ROWS.map((row) => row.source));
    const missing = folders.filter((folder) => !sources.has(folder));
    expect(missing, 'controles sin fila en /docs/states (states-page.ts, ROWS)').toEqual([]);
    // Y cada fila apunta a una carpeta que existe.
    for (const row of ROWS) {
      expect(statesFs.existsSync(`${STATES_COMPONENTS}/${row.source}`), row.source).toBe(true);
    }
  });

  it(
    'pinta los 19 controles en los 7 estados, solo con lo elegido (sin selectores)',
    async () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(StatesPage);
      document.body.appendChild(fixture.nativeElement);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;
      expect(ROWS.length).toBe(19);
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
      expect(grid.querySelectorAll('tbody tr').length).toBe(19);
      expect(grid.querySelectorAll('[data-cell]').length).toBe(19 * 7);
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
      // Sin selectores de comparación: solo la opción elegida, la del tema.
      expect(el.querySelector('[data-test="depth"], [data-test="gray"]')).toBeNull();
      expect(grid.hasAttribute('data-depth')).toBe(false);
      expect(grid.getAttribute('style') ?? '').toBe('');
      // Tree: en la cuadrícula, con el nodo elegido y el hover en el otro; sin solo lectura ni error.
      const tree = cell('tree', 'hover').querySelector('mimi-tree')!;
      expect(tree.querySelector('[data-selected]')!.textContent).toContain('app.ts');
      expect(tree.querySelector('[data-force="hover"]')!.textContent).toContain('README.md');
      expect(cell('tree', 'readonly').querySelector('mimi-tree')).toBeNull();
      expect(el.querySelectorAll('mimi-tree').length).toBe(5);
      fixture.destroy();
    },
    STATES_PAGE_TIMEOUT,
  );
});
