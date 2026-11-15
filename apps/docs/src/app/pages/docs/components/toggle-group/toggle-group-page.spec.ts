import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { ToggleGroupPage } from './toggle-group-page';
import { TOGGLE_GROUP_PAGE } from './toggle-group.page';

describe('ToggleGroupPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(TOGGLE_GROUP_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(ToggleGroupPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y seis ejemplos: el vivo de formularios se fue (repetía las pestañas de
      // «Formularios») y Deshabilitado y Solo lectura van juntos en Estados.
      expect(previews.length).toBe(7);
      // Tamaños, el primero después de la demo.
      expect(previews[1].code).toContain('size="lg"');
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-toggle-group [mimiToggleGroupItem]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/toggle-group';");
        expect(code).toMatch(/export class ToggleGroup\w+Example/);
      }
      // Todos los grupos de los ejemplos tienen nombre.
      for (const group of Array.from(el.querySelectorAll('mimi-toggle-group'))) {
        expect(group.getAttribute('aria-label'), group.outerHTML).toBeTruthy();
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Toggle Group');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it('estados: uno deshabilitado y otro de solo lectura', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(ToggleGroupPage);
    await settle(fixture);
    const groups = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'app-toggle-group-states-example mimi-toggle-group',
    );
    expect(groups.length).toBe(2);
    expect(groups[0].hasAttribute('data-disabled')).toBe(true);
    expect(groups[1].getAttribute('aria-readonly')).toBe('true');
  });
});
