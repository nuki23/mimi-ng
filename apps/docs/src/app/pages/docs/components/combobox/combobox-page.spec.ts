import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { ComboboxPage } from './combobox-page';

describe('ComboboxPage', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
  });

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
      const fixture = TestBed.createComponent(ComboboxPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y siete ejemplos; los formularios van en las pestañas, sin ejemplos vivos.
      expect(previews.length).toBe(8);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-combobox input[role="combobox"]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/combobox';");
        expect(code).toMatch(/export class Combobox\w+Example/);
      }
      // <mimi-option> es la forma normal: solo el último ejemplo (la alternativa) usa [options].
      const usesOptions = previews.map(({ code }) => /\[options\]="/.test(code));
      expect(usesOptions.filter(Boolean)).toHaveLength(1);
      expect(usesOptions.at(-1)).toBe(true);
      for (const { code } of previews.slice(0, -1)) expect(code).toContain('<mimi-option');
      // Cada campo tiene nombre: aria-label o una etiqueta.
      for (const input of Array.from(
        el.querySelectorAll<HTMLInputElement>('mimi-combobox input'),
      )) {
        const named =
          input.getAttribute('aria-label') ||
          (input.id && el.querySelector(`label[for="${input.id}"]`));
        expect(named, input.outerHTML).toBeTruthy();
      }
      // El valor inicial pone el texto de la opción.
      const values = Array.from(el.querySelectorAll<HTMLInputElement>('mimi-combobox input')).map(
        (i) => i.value,
      );
      expect(values).toContain('Diseño');
      expect(values).toContain('Python');
      // compareWith="email": el valor guardado (otro objeto) se reconoce y muestra su texto.
      expect(values).toContain('Sol Díaz');
      // El múltiple: chips con el texto de quitar en español.
      expect(
        el
          .querySelector('mimi-combobox mimi-chip [data-slot="remove"]')!
          .getAttribute('aria-label'),
      ).toBe('Quitar Angular');
      // «Textos» con los dos proveedores (Combobox y el chip del múltiple).
      expect(el.querySelector('[data-slot="texts-sentence"]')?.textContent).toContain(
        'MIMI_COMBOBOX_TEXT_ES y MIMI_CHIP_TEXT_ES traen el español',
      );
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
