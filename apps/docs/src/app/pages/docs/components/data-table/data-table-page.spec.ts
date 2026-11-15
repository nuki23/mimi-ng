import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { DataTablePage } from './data-table-page';
import { DATA_TABLE_PAGE } from './data-table.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('DataTablePage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(DATA_TABLE_PAGE)).toEqual([]));

  it('la fila elegida se documenta con data-selected, no con aria-selected (como el código)', () => {
    const texts = [
      ...DATA_TABLE_PAGE.accessibility.points,
      ...(DATA_TABLE_PAGE.accessibility.more ?? []),
    ].join(' ');
    expect(texts).toContain('`data-selected`');
    expect(texts).not.toMatch(/lleva `aria-selected`/);
    expect(DATA_TABLE_PAGE.api.dataAttributes).toContain('data-selected (en la fila)');
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
      const fixture = TestBed.createComponent(DataTablePage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo, tamaños, estados y tres casos avanzados.
      expect(previews.length).toBe(6);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-data-table table')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/data-table';");
        expect(code).toMatch(/export class DataTable\w+Example/);
      }
      const [demo, sizes, states, cells, selection, server] = previews.map((p) => p.example!);
      // La demo: 5 filas por página, con el rango y las casillas en español.
      expect(demo.querySelectorAll('tbody tr').length).toBe(5);
      expect(demo.querySelector('[data-slot="range"]')!.textContent).toBe('1–5 de 7');
      expect(demo.querySelector('[aria-label="Seleccionar Hotel Brisa"]')).not.toBeNull();
      // size y density, cada uno por su lado.
      const tables = Array.from(sizes.querySelectorAll('mimi-data-table'));
      expect(tables.map((t) => t.getAttribute('data-size'))).toEqual(['sm', 'md', 'lg', null]);
      expect(tables.at(-1)!.getAttribute('data-density')).toBe('comfortable');
      // Mínima, cargando y vacía.
      expect(states.querySelectorAll('mimi-data-table').length).toBe(3);
      expect(states.querySelector('[data-slot="empty"] [data-slot="empty-action"]')).not.toBeNull();
      // Las celdas a medida y la columna fija, con los 32 clientes.
      expect(cells.querySelector('[data-slot="range"]')!.textContent).toBe('1–5 de 32');
      expect(cells.querySelector('tbody td .font-semibold')!.textContent).toBe('Hotel Brisa 1');
      // Selección: casillas, flecha de detalle y menú de acciones en cada fila.
      expect(selection.querySelector('tbody [data-slot="expand"]')).not.toBeNull();
      expect(selection.querySelector('tbody [aria-label^="Acciones de "]')).not.toBeNull();
      // Servidor: la página que devuelve (después de su espera de 500 ms).
      await new Promise((resolve) => setTimeout(resolve, 600));
      await settle(fixture);
      expect(server.querySelector('table[aria-busy]')).toBeNull();
      expect(server.querySelectorAll('tbody tr').length).toBe(5);
      expect(server.querySelector('[data-slot="range"]')!.textContent).toBe('1–5 de 32');
      // Varios archivos en los avanzados, y las tablas de textos y de tokens.
      expect(el.querySelector('#texts')).not.toBeNull();
      expect(el.querySelector('#tokens')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
