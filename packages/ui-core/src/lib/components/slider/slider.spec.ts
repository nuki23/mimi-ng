import { Directionality } from '@angular/cdk/bidi';
import { Component, EventEmitter, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { disabled, form, FormField } from '@angular/forms/signals';
import { MimiSlider, type MimiSliderMark, type MimiSliderValue } from './slider';
import { MIMI_SLIDER_TEXT_ES, provideMimiSliderText } from './slider-texts';

@Component({
  imports: [MimiSlider, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <span id="price-label">Precio</span>
    <mimi-slider
      data-test="single"
      aria-label="Volumen"
      [(value)]="volume"
      [step]="step()"
      [marks]="marks()"
      [showValue]="show()"
      [disabled]="off()"
      [class]="extra()"
    />
    <mimi-slider
      data-test="range"
      aria-labelledby="price-label"
      range
      [min]="0"
      [max]="1000"
      [step]="10"
      [format]="money"
      [(value)]="price"
    />
    <mimi-slider data-test="reactive" aria-label="R" [formControl]="control" />
    <mimi-slider data-test="signal" aria-label="S" range [formField]="signalForm.ages" />
    <mimi-slider data-test="ng-model" aria-label="N" name="n" [(ngModel)]="model" />
  `,
})
class Host {
  readonly volume = signal<MimiSliderValue>(60);
  readonly price = signal<MimiSliderValue>([300, 700]);
  readonly step = signal(1);
  readonly marks = signal<readonly MimiSliderMark[]>([]);
  readonly show = signal<'auto' | 'always' | 'never'>('auto');
  readonly off = signal(false);
  readonly extra = signal('');
  readonly money = (v: number) => `$${v}`;
  readonly control = new FormControl<MimiSliderValue>(20);
  readonly locked = signal(false);
  readonly data = signal<{ ages: MimiSliderValue }>({ ages: [18, 40] });
  readonly signalForm = form(this.data, (p) => disabled(p.ages, () => this.locked()));
  model: MimiSliderValue = 5;
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 2; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

const press = (el: Element, key: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('MimiSlider', () => {
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const part = (name: string) => root.querySelector<HTMLElement>(`[data-test="${name}"]`)!;
    const thumbs = (name: string) =>
      Array.from(part(name).querySelectorAll<HTMLElement>('[role="slider"]'));
    return { fixture, host: fixture.componentInstance, part, thumbs };
  }

  it('un valor: role slider con valuenow, valuemin, valuemax, valuetext y nombre', async () => {
    const { thumbs } = await setup();
    const [t] = thumbs('single');
    expect(t.getAttribute('aria-valuenow')).toBe('60');
    expect(t.getAttribute('aria-valuemin')).toBe('0');
    expect(t.getAttribute('aria-valuemax')).toBe('100');
    expect(t.getAttribute('aria-valuetext')).toBe('60');
    expect(t.getAttribute('aria-label')).toBe('Volumen');
    expect(t.getAttribute('tabindex')).toBe('0');
    expect(t.style.insetInlineStart).toBe('60%');
  });

  it('teclado: flechas, Re Pág / Av Pág de diez pasos, Inicio y Fin', async () => {
    const { host, thumbs, fixture } = await setup();
    const [t] = thumbs('single');
    for (const [key, expected] of [
      ['ArrowRight', 61],
      ['ArrowUp', 62],
      ['ArrowLeft', 61],
      ['ArrowDown', 60],
      ['PageUp', 70],
      ['PageDown', 60],
      ['Home', 0],
      ['End', 100],
    ] as const) {
      press(t, key);
      await settle(fixture);
      expect(host.volume(), key).toBe(expected);
    }
  });

  it('paso y límites: el valor respeta step, min y max', async () => {
    const { host, thumbs, fixture } = await setup();
    host.step.set(25);
    host.volume.set(60);
    await settle(fixture);
    press(thumbs('single')[0], 'ArrowRight');
    await settle(fixture);
    expect(host.volume()).toBe(75);
    press(thumbs('single')[0], 'PageUp');
    await settle(fixture);
    expect(host.volume()).toBe(100);
  });

  it('rango: dos pulgares con «Precio, Mínimo/Máximo», valuetext formateado y sin cruce', async () => {
    const { host, thumbs, fixture, part } = await setup();
    const [lo, hi] = thumbs('range');
    expect(part('range').getAttribute('role')).toBe('group');
    expect(lo.getAttribute('aria-label')).toBe('Precio, Minimum');
    expect(hi.getAttribute('aria-label')).toBe('Precio, Maximum');
    expect(lo.getAttribute('aria-valuetext')).toBe('$300');
    // Cada pulgar no puede pasar al otro.
    expect(lo.getAttribute('aria-valuemax')).toBe('700');
    expect(hi.getAttribute('aria-valuemin')).toBe('300');
    press(lo, 'End');
    await settle(fixture);
    expect(host.price()).toEqual([700, 700]);
    press(hi, 'Home');
    await settle(fixture);
    expect(host.price()).toEqual([700, 700]);
    press(hi, 'End');
    await settle(fixture);
    expect(host.price()).toEqual([700, 1000]);
  });

  it('arrastre con el puntero: mueve el pulgar más cercano, le da el foco y respeta el paso', async () => {
    const { host, part, thumbs, fixture } = await setup();
    const el = part('range');
    el.getBoundingClientRect = () => ({ left: 0, width: 1000, top: 0, height: 20 }) as DOMRect;
    el.setPointerCapture = () => undefined;
    el.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, clientX: 812, button: 0, pointerId: 1 }),
    );
    await settle(fixture);
    expect(host.price()).toEqual([300, 810]);
    expect(document.activeElement).toBe(thumbs('range')[1]);
    expect(thumbs('range')[1].hasAttribute('data-dragging')).toBe(true);
    // Arrastre: el halo de 8px sobre la sombra del pulgar (su token), con tipo; reemplaza a la base.
    const dragged = thumbs('range')[1].className.split(' ');
    expect(dragged).toContain(
      'shadow-[shadow:0_0_0_8px_var(--mimi-ring-soft),var(--mimi-slider-thumb-shadow,var(--mimi-shadow-neutral))]',
    );
    expect(dragged).not.toContain(
      'shadow-[shadow:var(--mimi-slider-thumb-shadow,var(--mimi-shadow-neutral))]',
    );
    el.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, clientX: 150, pointerId: 1 }),
    );
    await settle(fixture);
    // No cruza: el de arriba no baja del de abajo.
    expect(host.price()).toEqual([300, 300]);
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    await settle(fixture);
    expect(thumbs('range')[1].hasAttribute('data-dragging')).toBe(false);
    expect(el.className).toContain('touch-none');
  });

  it('RTL: ← sube y → baja', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Directionality,
          useValue: { value: 'rtl', valueSignal: signal('rtl'), change: new EventEmitter() },
        },
      ],
    });
    const { host, thumbs, fixture } = await setup();
    press(thumbs('single')[0], 'ArrowLeft');
    await settle(fixture);
    expect(host.volume()).toBe(61);
    press(thumbs('single')[0], 'ArrowRight');
    await settle(fixture);
    expect(host.volume()).toBe(60);
  });

  it('un valor fuera de rango se pinta acotado sin reescribir el modelo', async () => {
    const { host, thumbs, fixture } = await setup();
    host.volume.set(250);
    await settle(fixture);
    expect(thumbs('single')[0].getAttribute('aria-valuenow')).toBe('100');
    expect(host.volume()).toBe(250);
  });

  it('marcas con texto y burbuja: auto con el foco, always y never', async () => {
    const { host, thumbs, part, fixture } = await setup();
    host.marks.set([0, { value: 50, label: '50' }, { value: 100, label: '100' }]);
    await settle(fixture);
    expect(part('single').querySelectorAll('[data-slot="mark"]').length).toBe(3);
    expect(part('single').querySelectorAll('[data-slot="mark-label"]').length).toBe(2);
    expect(part('single').className).toContain('mb-6');
    expect(part('single').querySelector('[data-slot="bubble"]')).toBeNull();
    thumbs('single')[0].focus();
    await settle(fixture);
    const bubble = part('single').querySelector('[data-slot="bubble"]')!;
    expect(bubble.getAttribute('aria-hidden')).toBe('true');
    expect(bubble.textContent!.trim()).toBe('60');
    expect(bubble.className).toContain('bg-tooltip');
    host.show.set('never');
    await settle(fixture);
    expect(part('single').querySelector('[data-slot="bubble"]')).toBeNull();
    thumbs('single')[0].blur();
    host.show.set('always');
    await settle(fixture);
    expect(part('single').querySelector('[data-slot="bubble"]')).not.toBeNull();
  });

  it('deshabilitado: tabindex −1, aria-disabled y sin cambios por teclado', async () => {
    const { host, thumbs, part, fixture } = await setup();
    host.off.set(true);
    await settle(fixture);
    const [t] = thumbs('single');
    expect(t.getAttribute('tabindex')).toBe('-1');
    expect(t.getAttribute('aria-disabled')).toBe('true');
    expect(part('single').hasAttribute('data-disabled')).toBe(true);
    press(t, 'ArrowRight');
    await settle(fixture);
    expect(host.volume()).toBe(60);
  });

  it('foco visible sin outline-none; globales con respaldo; class gana', async () => {
    const { host, thumbs, part, fixture } = await setup();
    const t = thumbs('single')[0];
    expect(t.className).toContain('focus-visible:outline-2');
    expect(t.className).not.toContain('outline-none');
    expect(t.className).toContain('var(--mimi-thumb,var(--mimi-background))');
    // Sombras con tipo (estilos 8) y el token del pulgar también en hover.
    const classes = t.className.split(' ');
    expect(classes).toContain(
      'not-aria-disabled:hover:shadow-[shadow:0_0_0_6px_var(--mimi-ring-soft),var(--mimi-slider-thumb-shadow,var(--mimi-shadow-neutral))]',
    );
    expect(classes.filter((c) => /shadow-\[(?!shadow:)/.test(c))).toEqual([]);
    const track = part('single').querySelector('[data-slot="track"]')!;
    expect(track.className).toContain('var(--mimi-track,var(--mimi-input))');
    // El anfitrión (todo el objetivo del puntero) mide 24px de alto (2.5.8, 5.17b).
    expect(part('single').classList).toContain('h-6');
    host.extra.set('h-8');
    await settle(fixture);
    expect(part('single').className).toContain('h-8');
    expect(part('single').className).not.toContain('h-6');
  });

  it('Reactive Forms, Signal Forms (rango) y ngModel', async () => {
    const { host, thumbs, part, fixture } = await setup();
    press(thumbs('reactive')[0], 'ArrowRight');
    await settle(fixture);
    expect(host.control.value).toBe(21);
    host.control.setValue(80);
    await settle(fixture);
    expect(thumbs('reactive')[0].getAttribute('aria-valuenow')).toBe('80');
    host.control.disable();
    await settle(fixture);
    expect(part('reactive').hasAttribute('data-disabled')).toBe(true);
    press(thumbs('signal')[1], 'ArrowRight');
    await settle(fixture);
    expect(host.data().ages).toEqual([18, 41]);
    host.locked.set(true);
    await settle(fixture);
    expect(thumbs('signal')[0].getAttribute('tabindex')).toBe('-1');
    press(thumbs('ng-model')[0], 'ArrowLeft');
    await settle(fixture);
    expect(host.model).toBe(4);
  });

  it('textos en español', async () => {
    TestBed.configureTestingModule({ providers: [provideMimiSliderText(MIMI_SLIDER_TEXT_ES)] });
    const { thumbs } = await setup();
    expect(thumbs('range')[0].getAttribute('aria-label')).toBe('Precio, Mínimo');
  });
});
