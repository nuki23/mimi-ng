import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { SwitchPage } from './switch-page';
import { SWITCH_PAGE } from './switch.page';

describe('SwitchPage', () => {
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
    const fixture = TestBed.createComponent(SwitchPage);
    await settle(fixture);
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('cumple la plantilla', () => expect(validateDocPage(SWITCH_PAGE)).toEqual([]));

  it(
    'cada ejemplo corre en Preview y su pestaña Código muestra el archivo real',
    async () => {
      const { fixture, el } = await setup();
      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y cuatro ejemplos: los vivos de Signal Forms y Reactive Forms se fueron
      // (repetían las pestañas de «Formularios»).
      expect(previews.length).toBe(5);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-switch')).not.toBeNull();
        expect(code).toContain("import { MimiSwitch } from '@/components/ui/switch';");
        expect(code).toMatch(/export class Switch\w+Example/);
        expect(code).not.toContain('@mimi-ng/ui-core');
      }
      expect(el.querySelectorAll('app-install-command').length).toBe(1);
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Switch');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
      // La página hermana, enlazada desde la nota de Uso.
      expect(
        el.querySelector('[data-slot="usage-note"] a[href="/docs/components/checkbox"]'),
      ).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it('los tres tamaños del switch ponen su data-size', async () => {
    const { el } = await setup();
    const example = el.querySelector('app-switch-sizes-example')!;
    expect(
      Array.from(example.querySelectorAll('mimi-switch')).map((s) => s.getAttribute('data-size')),
    ).toEqual(['sm', 'md', 'lg']);
  });

  it('demo: el modo avión deshabilita el wifi', async () => {
    const { fixture, el } = await setup();
    const demo = el.querySelector('app-switch-demo-example')!;
    const [airplane, wifi] = Array.from(
      demo.querySelectorAll<HTMLButtonElement>('button[role="switch"]'),
    );
    expect(wifi.disabled).toBe(false);
    airplane.click();
    await fixture.whenStable();
    expect(airplane.getAttribute('aria-checked')).toBe('true');
    expect(wifi.disabled).toBe(true);
  });
});
