import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiBlock } from './block';
import { MimiLoadingService, injectMimiLoading, provideMimiLoading } from './loading';
import { MIMI_LOADING_TEXT_ES, provideMimiLoadingText } from './loading-texts';

const overlay = () =>
  document.querySelector<HTMLElement>('.cdk-overlay-container mimi-loading-overlay');

@Component({
  imports: [MimiBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button data-test="outside">Fuera</button>
    <section
      data-test="card"
      class="rounded-lg"
      [mimiBlock]="busy()"
      mimiBlockMessage="Guardando…"
      [mimiBlockDelay]="0"
      [mimiBlockMinDuration]="0"
    >
      <input data-test="name" />
      <button data-test="save">Guardar</button>
    </section>
  `,
})
class BlockHost {
  readonly busy = signal(false);
}

@Component({ template: '' })
class Caller {
  readonly loading = injectMimiLoading();
}

/** Una página con sus textos (no en la raíz): el servicio de la raíz debe usarlos igual. */
@Component({ template: '', providers: [provideMimiLoadingText(MIMI_LOADING_TEXT_ES)] })
class SpanishCaller {
  readonly loading = injectMimiLoading();
}

describe('Carga (R.23)', () => {
  let announced: string[];

  beforeEach(() => {
    announced = [];
    TestBed.configureTestingModule({
      providers: [
        provideMimiLoadingText(MIMI_LOADING_TEXT_ES),
        {
          provide: LiveAnnouncer,
          useValue: { announce: (m: string) => (announced.push(m), Promise.resolve()) },
        },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.inject(MimiLoadingService).hideAll();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => c.replaceChildren());
    document.body.querySelectorAll('[data-test="page"]').forEach((el) => el.remove());
  });

  describe('MimiLoadingService (toda la vista)', () => {
    function page() {
      const main = document.createElement('main');
      main.dataset['test'] = 'page';
      main.innerHTML = '<button data-test="launcher">Guardar</button>';
      document.body.prepend(main);
      return main;
    }

    it('delay: si termina antes, la capa no aparece (no parpadea)', () => {
      vi.useFakeTimers();
      const service = TestBed.inject(MimiLoadingService);
      const ref = service.show();
      vi.advanceTimersByTime(150);
      expect(overlay()).toBeNull();
      ref.hide();
      vi.advanceTimersByTime(500);
      expect(overlay()).toBeNull();
      expect(announced).toEqual([]);
    });

    it('tras el delay: capa con el mensaje, el resto inerte y con aria-busy, y se anuncia', () => {
      vi.useFakeTimers();
      const main = page();
      const service = TestBed.inject(MimiLoadingService);
      service.show('Guardando el informe…');
      vi.advanceTimersByTime(200);
      expect(overlay()!.textContent).toContain('Guardando el informe…');
      expect(overlay()!.getAttribute('aria-hidden')).toBe('true');
      expect(main.hasAttribute('inert')).toBe(true);
      expect(main.getAttribute('aria-busy')).toBe('true');
      expect(overlay()!.closest('[inert]')).toBeNull();
      expect(announced).toEqual(['Guardando el informe…']);
      expect(service.visible).toBe(true);
    });

    it('contador: dos show y un hide mantienen la capa; minDuration antes de quitarla; hideAll', () => {
      vi.useFakeTimers();
      const main = page();
      const service = TestBed.inject(MimiLoadingService);
      const a = service.show('Uno');
      const b = service.show('Dos');
      vi.advanceTimersByTime(200);
      expect(overlay()!.textContent).toContain('Dos');
      b.hide();
      vi.advanceTimersByTime(1000);
      expect(overlay()!.textContent).toContain('Uno');
      a.update('Uno, casi');
      expect(overlay()!.textContent).toContain('Uno, casi');
      a.hide();
      // Visible desde hace más de 400 ms: se va ya.
      expect(overlay()).toBeNull();
      expect(main.hasAttribute('inert')).toBe(false);
      expect(main.hasAttribute('aria-busy')).toBe(false);
      expect(announced.at(-1)).toBe('Listo.');

      service.show();
      service.show();
      vi.advanceTimersByTime(200);
      expect(overlay()!.textContent).toContain('Cargando…');
      service.hideAll();
      vi.advanceTimersByTime(399);
      expect(overlay()).not.toBeNull();
      vi.advanceTimersByTime(1);
      expect(overlay()).toBeNull();
    });

    it('el foco vuelve al control que lo tenía; los atributos de antes se conservan', () => {
      vi.useFakeTimers();
      const main = page();
      main.setAttribute('aria-busy', 'false');
      const launcher = main.querySelector<HTMLButtonElement>('[data-test="launcher"]')!;
      launcher.focus();
      const service = TestBed.inject(MimiLoadingService);
      const ref = service.show();
      vi.advanceTimersByTime(200);
      // inert saca el foco (el navegador lo lleva a <body>).
      launcher.blur();
      ref.hide();
      vi.advanceTimersByTime(400);
      expect(document.activeElement).toBe(launcher);
      expect(main.getAttribute('aria-busy')).toBe('false');
    });

    it('provideMimiLoading cambia las esperas; con reducir movimiento el anillo no gira y el texto se ve', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideMimiLoading({ delay: 0, minDuration: 0 })],
      });
      const service = TestBed.inject(MimiLoadingService);
      const ref = service.show(undefined, { size: 'lg' });
      expect(overlay()).not.toBeNull();
      expect(overlay()!.dataset['size']).toBe('lg');
      expect(overlay()!.querySelector('[data-slot="spinner"]')!.getAttribute('class')).toContain(
        'motion-reduce:animate-none',
      );
      expect(overlay()!.querySelector('[data-slot="message"]')!.textContent).toBe('Loading…');
      ref.hide();
      expect(overlay()).toBeNull();
    });

    it('injectMimiLoading usa los textos del componente que la pide, no solo los de la raíz', () => {
      const said: string[] = [];
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideMimiLoading({ delay: 0, minDuration: 0 }),
          {
            provide: LiveAnnouncer,
            useValue: { announce: (m: string) => (said.push(m), Promise.resolve()) },
          },
        ],
      });
      const ref = TestBed.createComponent(SpanishCaller).componentInstance.loading.show();
      expect(overlay()!.textContent).toContain('Cargando…');
      ref.hide();
      expect(said).toEqual(['Cargando…', 'Listo.']);
    });

    it('injectMimiLoading: si el componente se destruye, sus cargas terminan', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideMimiLoading({ delay: 0, minDuration: 0 })],
      });
      const fixture = TestBed.createComponent(Caller);
      fixture.componentInstance.loading.show();
      expect(overlay()).not.toBeNull();
      fixture.destroy();
      expect(overlay()).toBeNull();
    });
  });

  describe('mimiBlock (un contenedor)', () => {
    async function setup() {
      const fixture = TestBed.createComponent(BlockHost);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const q = (id: string) => el.querySelector<HTMLElement>(`[data-test="${id}"]`)!;
      return { fixture, el, q };
    }

    it('cubre solo su elemento: lo de dentro inerte, el contenedor con aria-busy, y se anuncia', async () => {
      const { fixture, q } = await setup();
      fixture.componentInstance.busy.set(true);
      await fixture.whenStable();
      const card = q('card');
      const layer = card.querySelector<HTMLElement>('mimi-loading-overlay')!;
      expect(layer).not.toBeNull();
      expect(layer.classList).toContain('absolute');
      expect(layer.textContent).toContain('Guardando…');
      expect(card.getAttribute('aria-busy')).toBe('true');
      expect(q('name').hasAttribute('inert')).toBe(true);
      expect(q('save').hasAttribute('inert')).toBe(true);
      expect(card.hasAttribute('inert')).toBe(false);
      expect(q('outside').hasAttribute('inert')).toBe(false);
      expect(card.style.position).toBe('relative');
      expect(announced).toEqual(['Guardando…']);
    });

    it('al terminar quita inert, aria-busy y la capa, y el foco vuelve al control de dentro', async () => {
      const { fixture, q } = await setup();
      q('save').focus();
      fixture.componentInstance.busy.set(true);
      await fixture.whenStable();
      q('save').blur();
      fixture.componentInstance.busy.set(false);
      await fixture.whenStable();
      const card = q('card');
      expect(card.querySelector('mimi-loading-overlay')).toBeNull();
      expect(card.hasAttribute('aria-busy')).toBe(false);
      expect(q('save').hasAttribute('inert')).toBe(false);
      expect(card.style.position).toBe('');
      expect(document.activeElement).toBe(q('save'));
      expect(announced).toEqual(['Guardando…', 'Listo.']);
    });
  });
});
