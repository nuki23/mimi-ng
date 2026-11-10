import { TestBed } from '@angular/core/testing';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { SwitchPage } from './switch-page';

describe('SwitchPage', () => {
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
      const fixture = TestBed.createComponent(SwitchPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // Estados, tamaños, etiquetas, Signal Forms, Reactive Forms y class (el Checkbox, aparte).
      expect(previews.length).toBe(6);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-switch, mimi-checkbox')).not.toBeNull();
        expect(code).toMatch(
          /import \{ Mimi(Switch|Checkbox) \} from '@\/components\/ui\/(switch|checkbox)';/,
        );
        expect(code).toMatch(/export class (Switch|Checkbox)\w+Example/);
      }
      expect(el.querySelectorAll('app-install-command').length).toBe(1);
      expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
        'installation',
        'usage',
        'examples',
        'api',
      ]);
      expect(el.querySelector('h3#api-switch')).not.toBeNull();
      expect(el.querySelector('h3#api-checkbox')).toBeNull();
      expect(el.querySelector('h3#sizes')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it('los tres tamaños del switch ponen su data-size', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(SwitchPage);
    await settle(fixture);
    const example = (fixture.nativeElement as HTMLElement).querySelector(
      'app-switch-sizes-example',
    )!;
    expect(
      Array.from(example.querySelectorAll('mimi-switch')).map((s) => s.getAttribute('data-size')),
    ).toEqual(['sm', 'md', 'lg']);
  });
});
