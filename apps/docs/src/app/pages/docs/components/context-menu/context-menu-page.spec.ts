import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { ContextMenuPage } from './context-menu-page';
import { CONTEXT_MENU_PAGE } from './context-menu.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('ContextMenuPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(CONTEXT_MENU_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(ContextMenuPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo (el ejemplo básico) y cuatro ejemplos.
      expect(previews.length).toBe(5);
      for (const { example, code } of previews) {
        expect(example?.querySelector('[mimiContextMenuTrigger][data-state]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/context-menu';");
        expect(code).toMatch(/export class ContextMenu\w+Example/);
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Context Menu');
      // La tabla: cada fila es un trigger y lleva además su botón con las mismas acciones.
      const table = previews.at(-1)!.example!;
      expect(table.querySelectorAll('tr[mimiContextMenuTrigger]').length).toBe(3);
      expect(table.querySelectorAll('app-file-actions-menu [mimiDropdownMenuTrigger]').length).toBe(
        3,
      );
      // Las piezas de menú compartidas van en «Piezas»; la hermana, enlazada desde la nota de Uso.
      expect(el.querySelector('#parts')).not.toBeNull();
      expect(
        el.querySelector('[data-slot="usage-note"] a[href="/docs/components/dropdown-menu"]'),
      ).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
