import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { settle } from '../../../code/code-preview.testing';
import { forcedSelector } from './state-forcer';
import { ROWS, STATES, StatesPage } from './states-page';

/** La página pinta 140 celdas (20 × 7): con toda la suite, unos 25 s. */
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
    'pinta las 20 filas (19 controles y Password a la vista) en los 7 estados, solo con lo elegido',
    async () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(StatesPage);
      document.body.appendChild(fixture.nativeElement);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;
      expect(ROWS.length).toBe(20);
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
      expect(grid.querySelectorAll('tbody tr').length).toBe(20);
      expect(grid.querySelectorAll('[data-cell]').length).toBe(20 * 7);
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

  it(
    'no enfoca ningún control al cargar (13/11/2026)',
    async () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const focused: string[] = [];
      const log = (event: FocusEvent) =>
        focused.push((event.target as HTMLElement).tagName.toLowerCase());
      document.addEventListener('focusin', log, true);
      const fixture = TestBed.createComponent(StatesPage);
      document.body.appendChild(fixture.nativeElement);
      await settle(fixture);
      await new Promise((r) => setTimeout(r, 50));
      document.removeEventListener('focusin', log, true);
      expect(focused).toEqual([]);
      expect((fixture.nativeElement as HTMLElement).contains(document.activeElement)).toBe(false);
      fixture.destroy();
    },
    STATES_PAGE_TIMEOUT,
  );

  it(
    'Password: oculto en todas las columnas; la fila «mostrar», con el texto a la vista',
    async () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(StatesPage);
      document.body.appendChild(fixture.nativeElement);
      await settle(fixture);
      const grid = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
        '[data-test="states-grid"]',
      )!;
      const types = (row: string) =>
        STATES.map((s) => {
          const input = grid.querySelector<HTMLInputElement>(
            `tr[data-row="${row}"] [data-cell="${s.id}"] input`,
          );
          return input?.type ?? 'no aplica';
        });
      expect(types('password')).toEqual(STATES.map(() => 'password'));
      // Deshabilitado no deja mostrarla (el botón del ojo está deshabilitado): «No aplica».
      expect(types('password-show')).toEqual(
        STATES.map((s) => (s.id === 'disabled' ? 'no aplica' : 'text')),
      );
      // El botón del ojo dice que está pulsado (no se cambió el type por fuera).
      const toggle = grid.querySelector(
        'tr[data-row="password-show"] [data-cell="normal"] [data-slot="toggle"]',
      )!;
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
      fixture.destroy();
    },
    STATES_PAGE_TIMEOUT,
  );
});
