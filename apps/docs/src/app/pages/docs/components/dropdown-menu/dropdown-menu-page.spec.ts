import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { DropdownMenuPage } from './dropdown-menu-page';
import { DROPDOWN_MENU_PAGE } from './dropdown-menu.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('DropdownMenuPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(DROPDOWN_MENU_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(DropdownMenuPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo (el ejemplo básico) y seis ejemplos, con «Tamaños» y «En el teléfono» (R.34).
      expect(previews.length).toBe(7);
      expect(previews.some(({ code }) => code.includes('size="lg"'))).toBe(true);
      for (const { example, code } of previews) {
        expect(
          example?.querySelector('[mimiDropdownMenuTrigger][aria-haspopup=menu]'),
        ).not.toBeNull();
        expect(code).toContain("from '@/components/ui/dropdown-menu';");
        expect(code).toMatch(/export class DropdownMenu\w+Example/);
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Dropdown Menu');
      // Las piezas de menú compartidas van en «Piezas».
      expect(el.querySelector('#parts')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
