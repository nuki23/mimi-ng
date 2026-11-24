import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { MimiTableImports } from '@/components/ui/table';
import { TablePage } from './table-page';
import { TABLE_PAGE } from './table.page';

/** `[['button', 'mimiRowToggle', '']]` → `button[mimiRowToggle]` (selectores simples). */
function selectorOf(type: unknown): string {
  const def =
    (type as { ɵdir?: { selectors: unknown[][] }; ɵcmp?: { selectors: unknown[][] } }).ɵcmp ??
    (type as { ɵdir: { selectors: unknown[][] } }).ɵdir;
  return def.selectors
    .map(([tag, ...attrs]) => {
      let out = String(tag);
      for (let i = 0; i < attrs.length; i += 2) out += `[${String(attrs[i])}]`;
      return out;
    })
    .join(', ');
}

describe('TablePage (R.20)', () => {
  it('cumple la plantilla', () => expect(validateDocPage(TABLE_PAGE)).toEqual([]));

  it('los selectores de la API son los de las directivas (revisor)', () => {
    const parts = new Map(TABLE_PAGE.api.parts!.map((p) => [p.name, p.selector]));
    for (const piece of MimiTableImports) {
      const name = piece.name.replace(/^_+/, '');
      const documented = [...parts.entries()].find(([n]) => n.split(' / ').includes(name));
      expect(documented, name).toBeDefined();
      expect(documented![1].split(', '), name).toContain(selectorOf(piece));
    }
  });

  it(
    'cada ejemplo corre en Preview y su pestaña Código muestra el archivo real',
    async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          {
            provide: HighlighterService,
            useValue: { highlight: () => new Promise(() => undefined) },
          },
        ],
      });
      const fixture = TestBed.createComponent(TablePage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      expect(previews.length).toBe(5);
      // «En el teléfono»: una tabla con scroll (por defecto) y otra en stack.
      const phone = [...el.querySelectorAll('app-table-phone-example table')];
      expect(phone.map((t) => t.getAttribute('data-mobile'))).toEqual(['scroll', 'stack']);
      for (const { example, code } of previews) {
        expect(example?.querySelector('table[mimiTable]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/table';");
        expect(code).toMatch(/export class Table\w+Example/);
      }
      // La demo: ordenar por importe con el botón del encabezado.
      const demo = el.querySelector<HTMLElement>('app-table-demo-example')!;
      const amount = demo.querySelectorAll<HTMLElement>('thead th')[3];
      amount.querySelector<HTMLButtonElement>('button')!.click();
      await settle(fixture);
      expect(amount.getAttribute('aria-sort')).toBe('ascending');
      expect(demo.querySelector('tbody tr td')!.textContent!.trim()).toBe('F-1044');
      // Expandir: una sola fila abierta.
      const expand = el.querySelector<HTMLElement>('app-table-expand-example')!;
      const toggles = expand.querySelectorAll<HTMLButtonElement>('[mimiRowToggle]');
      toggles[0].click();
      await settle(fixture);
      toggles[1].click();
      await settle(fixture);
      expect([...toggles].map((t) => t.getAttribute('aria-expanded'))).toEqual([
        'false',
        'true',
        'false',
      ]);
      expect(expand.querySelector('#pedido-2')).not.toBeNull();
      // Nombre fijo: el estado lo dice aria-expanded (revisión de accesibilidad).
      expect(toggles[1].textContent!.replace(/\s+/g, ' ').trim()).toBe(
        'Detalle del pedido de Café Altura',
      );
      // Las tablas de «Tamaños» tienen nombre.
      for (const table of el.querySelectorAll('app-table-sizes-example table')) {
        expect(table.getAttribute('aria-label')).toMatch(/^Usuarios, tamaño (sm|md|lg)$/);
      }
      // Buscar anuncia el resultado en una región status (WCAG 4.1.3).
      const state = el.querySelector<HTMLElement>('app-table-state-example')!;
      const search = state.querySelector<HTMLInputElement>('input[type=search]')!;
      search.value = 'zzz';
      search.dispatchEvent(new Event('input'));
      await settle(fixture);
      expect(state.querySelector('[role="status"]')!.textContent).toContain('0 resultados');
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Table');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
