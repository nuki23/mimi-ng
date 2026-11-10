import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { ColorPickerPage } from './color-picker-page';

describe('ColorPickerPage', () => {
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
      const fixture = TestBed.createComponent(ColorPickerPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      expect(previews.length).toBe(4);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-color-picker, mimi-color-input')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/color-picker';");
        expect(code).toMatch(/export class ColorPicker\w+Example/);
      }
      // Textos en español y cada disparador con nombre.
      expect(
        el.querySelector('mimi-color-picker [role="slider"]')!.getAttribute('aria-label'),
      ).toBe('Saturación y brillo');
      for (const button of Array.from(
        el.querySelectorAll<HTMLButtonElement>('mimi-color-input button'),
      )) {
        const named =
          button.getAttribute('aria-label') ||
          (button.id && el.querySelector(`label[for="${button.id}"]`));
        expect(named, button.outerHTML).toBeTruthy();
      }
      expect(el.textContent).toContain('Contraste con blanco');
      expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
        'installation',
        'usage',
        'examples',
        'api',
      ]);
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
