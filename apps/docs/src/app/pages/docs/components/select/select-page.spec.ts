import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { SelectPage } from './select-page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('SelectPage', () => {
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
      const fixture = TestBed.createComponent(SelectPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo y siete ejemplos (con «En el teléfono», R.34); los formularios van en las
      // pestañas, sin ejemplos vivos.
      expect(previews.length).toBe(8);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-select button[role="combobox"]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/select';");
        expect(code).toMatch(/export class Select\w+Example/);
      }
      // <mimi-option> es la forma normal: solo el último ejemplo (la alternativa) usa [options].
      const usesOptions = previews.map(({ code }) => /\[options\]="/.test(code));
      expect(usesOptions.filter(Boolean)).toHaveLength(1);
      expect(usesOptions.at(-1)).toBe(true);
      for (const { code } of previews.slice(0, -1)) expect(code).toContain('<mimi-option');
      // Los textos de la página están en español (se proveen en la página, no en app.config).
      expect(el.querySelector('button[aria-label="Limpiar selección"]')).not.toBeNull();
      // Las pestañas de formularios (R.13) y «Qué instala» con lo que trae Select.
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
      const extras = el.querySelector('app-install-extras')?.textContent ?? '';
      expect(extras).toContain('option-list');
      expect(extras).toContain('@angular/cdk/overlay-prebuilt.css');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
