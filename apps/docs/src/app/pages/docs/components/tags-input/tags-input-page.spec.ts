import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { TagsInputPage } from './tags-input-page';
import { TAGS_INPUT_PAGE } from './tags-input.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('TagsInputPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(TAGS_INPUT_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(TagsInputPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo y cinco ejemplos: el vivo de los tres formularios se fue (repetía las pestañas
      // de «Formularios»); su estado deshabilitado y su `validate` quedaron en ejemplos propios.
      expect(previews.length).toBe(6);
      // Tamaños, el primero después de la demo.
      expect(previews[1].code).toContain('size="lg"');
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-tags-input input')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/tags-input';");
        expect(code).toMatch(/export class TagsInput\w+Example/);
      }
      for (const input of Array.from(
        el.querySelectorAll<HTMLInputElement>('mimi-tags-input input'),
      )) {
        const named =
          input.getAttribute('aria-label') ||
          (input.id && el.querySelector(`label[for="${input.id}"]`));
        expect(named, input.outerHTML).toBeTruthy();
      }
      // Los textos, en español.
      expect(el.querySelector('[data-slot="remove"]')!.getAttribute('aria-label')).toBe(
        'Quitar angular',
      );
      // Deshabilitado y solo lectura: sin botones de quitar.
      expect(el.querySelectorAll('app-tags-input-states-example [data-slot="remove"]').length).toBe(
        0,
      );
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Tags Input');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
      // Variables CSS: la tabla de Tags Input y, debajo, la del chip (PD-9).
      expect(el.querySelectorAll('app-css-variables').length).toBe(2);
      expect(el.querySelector('[data-slot="tokens-of"]')?.textContent).toContain('chip');
      expect(el.textContent).toContain('--mimi-chip-');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
