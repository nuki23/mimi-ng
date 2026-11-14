import { TestBed } from '@angular/core/testing';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { CheckboxPage } from './checkbox-page';

describe('CheckboxPage (R.3: página propia)', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(CheckboxPage);
    await settle(fixture);
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it(
    'cada ejemplo corre en Preview y su pestaña Código muestra el archivo real',
    async () => {
      const { fixture, el } = await setup();
      const previews = examples(fixture);
      expect(previews.length).toBe(3);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-checkbox')).not.toBeNull();
        expect(code).toContain("import { MimiCheckbox } from '@/components/ui/checkbox';");
        expect(code).toMatch(/export class Checkbox\w+Example/);
      }
      expect(el.querySelectorAll('app-install-command').length).toBe(1);
      expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
        'installation',
        'usage',
        'examples',
        'api',
      ]);
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it('tamaños: sm, md y lg ponen su data-size', async () => {
    const { el } = await setup();
    const sizes = el.querySelector('app-checkbox-sizes-example')!;
    expect(
      Array.from(sizes.querySelectorAll('mimi-checkbox')).map((c) => c.getAttribute('data-size')),
    ).toEqual(['sm', 'md', 'lg']);
  });

  it('seleccionar todo: mixta con algunas marcadas, marcada al hacer clic', async () => {
    const { fixture, el } = await setup();
    const example = el.querySelector('app-checkbox-select-all-example')!;
    const [all, ...items] = Array.from(example.querySelectorAll('button[role="checkbox"]'));
    expect(all.getAttribute('aria-checked')).toBe('mixed');
    (all as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(all.getAttribute('aria-checked')).toBe('true');
    expect(items.every((i) => i.getAttribute('aria-checked') === 'true')).toBe(true);
  });
});
