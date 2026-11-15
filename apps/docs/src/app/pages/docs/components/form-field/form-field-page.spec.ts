import { TestBed } from '@angular/core/testing';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { FormFieldPage } from './form-field-page';

describe('FormFieldPage', () => {
  it(
    'cada ejemplo corre en Preview y su pestaña Código muestra el archivo real',
    async () => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: HighlighterService,
            useValue: { highlight: () => new Promise(() => undefined) },
          },
        ],
      });
      const fixture = TestBed.createComponent(FormFieldPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo y ocho ejemplos; los predeterminados van junto al provider (R.30).
      expect(previews.length).toBe(9);
      // R.30: las piezas (con su leyenda) y los controles propios dentro de FormField.
      expect(el.querySelectorAll('app-form-field-anatomy-example li').length).toBe(5);
      const controls = el.querySelector('app-form-field-controls-example')!;
      for (const tag of ['mimi-select', 'mimi-combobox', 'mimi-date-picker', 'mimi-tags-input']) {
        expect(controls.querySelector(`mimi-form-field ${tag}`), tag).not.toBeNull();
      }
      expect(controls.querySelector('mimi-form-field mimi-switch')).not.toBeNull();
      expect(controls.querySelector('mimi-form-field mimi-checkbox')).not.toBeNull();
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-form-field')).not.toBeNull();
        expect(code).toMatch(
          /import \{[^}]*\bMimiFormField(Imports)?\b[^}]*\} from '@\/components\/ui\/form-field';/,
        );
        expect(code).toMatch(/export class FormField\w+Example/);
      }
      // Los dos h2 propios («Mensajes de error», «Personalizar los mensajes») pasaron a ejemplos
      // avanzados y al desplegable de Uso, con el orden de los cinco niveles (cerrado).
      const more = el.querySelector<HTMLDetailsElement>('[data-slot="usage-more"] details')!;
      expect(more.open).toBe(false);
      expect(more.querySelectorAll('ol > li').length).toBe(5);
      expect(el.querySelector('#messages, #customize-messages')).toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it('los niveles 3 y 4 muestran su mensaje: provider propio y predeterminados', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(FormFieldPage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const message = (selector: string) =>
      el.querySelector(`${selector} mimi-form-error`)?.textContent?.trim();

    // Validador propio con su mensaje del provider.
    expect(message('app-form-field-messages-provider-example')).toBe(
      'Ese nombre de usuario ya existe.',
    );
    // Predeterminados en inglés, aunque la app use el español.
    expect(message('app-form-field-messages-default-example')).toBe('Enter a valid email address.');

    // required cambiado sobre la base en español.
    const input = el.querySelector<HTMLInputElement>(
      'app-form-field-messages-provider-example input',
    )!;
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    expect(message('app-form-field-messages-provider-example')).toBe('Completa este campo.');
  });
});
