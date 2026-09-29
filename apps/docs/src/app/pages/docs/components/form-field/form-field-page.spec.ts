import { TestBed } from '@angular/core/testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { FormFieldPage } from './form-field-page';

describe('FormFieldPage', () => {
  it('cada ejemplo corre en Preview y su pestaña Código muestra el archivo real', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(FormFieldPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const previews = Array.from(el.querySelectorAll('app-code-preview'));
    expect(previews.length).toBe(8);
    for (const preview of previews) {
      expect(preview.querySelector('mimi-form-field')).not.toBeNull();
      const code = preview.querySelector('[role="tabpanel"] + [role="tabpanel"] pre')?.textContent;
      expect(code).toMatch(
        /import \{[^}]*\bMimiFormField(Imports)?\b[^}]*\} from '@\/components\/ui\/form-field';/,
      );
      expect(code).toMatch(/export class FormField\w+Example/);
    }
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'messages',
      'customize-messages',
      'api',
    ]);
  });

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
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
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
