import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { TablePage } from './table-page';
import { TABLE_PAGE } from './table.page';

describe('TablePage (R.20)', () => {
  it('cumple la plantilla', () => expect(validateDocPage(TABLE_PAGE)).toEqual([]));

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
      expect(previews.length).toBe(4);
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
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Table');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
