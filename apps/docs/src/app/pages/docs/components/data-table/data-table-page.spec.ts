import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { DataTablePage } from './data-table-page';

describe('DataTablePage', () => {
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
      expect(previews.length).toBe(2);
      for (const { code } of previews) {
        expect(code).toContain("from '@/components/ui/data-table';");
        expect(code).toMatch(/export class DataTable\w+Example/);
      }
      // La tabla completa: 5 filas por página, con el rango en español.
      const full = previews[0].example!;
      expect(full.querySelectorAll('tbody tr').length).toBe(5);
      expect(full.querySelector('[data-slot="range"]')!.textContent).toBe('1–5 de 32');
      // Mínima, cargando y vacía.
      const states = previews[1].example!;
      expect(states.querySelectorAll('mimi-data-table').length).toBe(3);
      expect(states.querySelector('[data-slot="empty"] [data-slot="empty-action"]')).not.toBeNull();
      expect(el.querySelector('#tokens')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
