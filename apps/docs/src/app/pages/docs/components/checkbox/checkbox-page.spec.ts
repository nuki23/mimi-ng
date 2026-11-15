import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { CheckboxPage } from './checkbox-page';
import { CHECKBOX_PAGE } from './checkbox.page';

describe('CheckboxPage (R.3: página propia)', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
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

  it('cumple la plantilla', () => expect(validateDocPage(CHECKBOX_PAGE)).toEqual([]));

  it(
    'cada ejemplo corre en Preview y su pestaña Código muestra el archivo real',
    async () => {
      const { fixture, el } = await setup();
      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo, tamaños, estados y seleccionar todo.
      expect(previews.length).toBe(4);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-checkbox')).not.toBeNull();
        expect(code).toContain("import { MimiCheckbox } from '@/components/ui/checkbox';");
        expect(code).toMatch(/export class Checkbox\w+Example/);
      }
      expect(el.querySelectorAll('app-install-command').length).toBe(1);
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Checkbox');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
      // La página hermana, enlazada desde la nota de Uso.
      expect(
        el.querySelector('[data-slot="usage-note"] a[href="/docs/components/switch"]'),
      ).not.toBeNull();
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

  it('demo: el botón se habilita al aceptar los términos', async () => {
    const { fixture, el } = await setup();
    const demo = el.querySelector('app-checkbox-demo-example')!;
    const terms = demo.querySelectorAll<HTMLButtonElement>('button[role="checkbox"]')[1];
    const submit = demo.querySelector<HTMLButtonElement>('button[mimiBtn]')!;
    expect(submit.disabled).toBe(true);
    terms.click();
    await fixture.whenStable();
    expect(submit.disabled).toBe(false);
  });
});
