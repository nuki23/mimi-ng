import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { TextareaPage } from './textarea-page';
import { TEXTAREA_PAGE } from './textarea.page';

describe('TextareaPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(TEXTAREA_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(TextareaPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo, los tamaños y los estados.
      expect(previews.length).toBe(3);
      expect(previews[1].code).toContain('size="lg"');
      for (const { example, code } of previews) {
        expect(example?.querySelector('[mimiTextarea]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/textarea';");
        expect(code).not.toContain('@mimi-ng/ui-core');
      }
      // Solo Textarea: ni la instalación ni los ejemplos de Input.
      expect(el.querySelectorAll('app-install-command').length).toBe(1);
      expect(el.querySelector('[mimiInput]')).toBeNull();
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Textarea');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
      // Estados: deshabilitado, solo lectura y con error.
      const states = el.querySelectorAll<HTMLTextAreaElement>(
        'app-textarea-states-example textarea',
      );
      expect(states[0].disabled).toBe(true);
      expect(states[1].readOnly).toBe(true);
      expect(states[2].getAttribute('aria-invalid')).toBe('true');
      // La página hermana, enlazada desde la nota de Uso.
      expect(
        el.querySelector('[data-slot="usage-note"] a[href="/docs/components/input"]'),
      ).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
