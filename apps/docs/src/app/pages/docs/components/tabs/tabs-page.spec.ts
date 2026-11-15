import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { TabsPage } from './tabs-page';
import { TABS_PAGE } from './tabs.page';

describe('TabsPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(TABS_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(TabsPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y ocho ejemplos: «Tamaños» (R.28) y «Vertical», que ya cambia según el ancho.
      expect(previews.length).toBe(9);
      expect(previews[1].code).toContain('size="lg"');
      expect(
        Array.from(el.querySelectorAll('app-tabs-sizes-example mimi-tabs')).map((t) =>
          t.getAttribute('data-size'),
        ),
      ).toEqual(['sm', null, 'lg']);
      for (const { example, code } of previews) {
        // Las pestañas del ejemplo (dentro del lienzo), no las de Preview/Código.
        expect(example?.querySelector('mimi-tabs [role="tab"]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/tabs';");
        expect(code).toMatch(/export class Tabs\w+Example/);
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Tabs');
      // La orientación vertical (B.10) y el atajo <mimi-tab label> (R.17) siguen en la página.
      expect(
        el.querySelector('app-tabs-vertical-example [aria-orientation="vertical"]'),
      ).not.toBeNull();
      const shortcutTabs = el.querySelectorAll('app-tabs-shortcut-example [role="tab"]');
      expect(Array.from(shortcutTabs).map((t) => t.getAttribute('data-value'))).toEqual([
        'profile',
        'avisos',
        'privacidad',
      ]);
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
