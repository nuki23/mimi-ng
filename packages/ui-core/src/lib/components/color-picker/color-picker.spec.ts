import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import {
  mimiFormatOklch,
  mimiHexToRgb,
  mimiNormalizeHex,
  mimiParseColor,
  mimiRgbToHsv,
} from './color';
import { MimiColorPickerImports } from './color-picker';
import { MIMI_COLOR_PICKER_TEXT_ES, provideMimiColorPickerText } from './color-picker-texts';

const PALETTE = [
  '#ef4444',
  '#f97316',
  '#22c55e',
  '#3b82f6',
  '#4f46e5',
  '#a855f7',
  '#ec4899',
  '#111827',
  '#ffffff',
];

@Component({
  imports: [MimiColorPickerImports, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <mimi-color-picker
      data-test="panel"
      [(value)]="color"
      [(recent)]="recent"
      [swatches]="palette"
      [disabled]="off()"
      [class]="extra()"
      (touch)="touches = touches + 1"
    />
    <mimi-color-picker data-test="reactive" [formControl]="control" [showRecent]="false" />
    <mimi-color-input
      data-test="input"
      aria-label="Color de marca"
      [(value)]="brand"
      [swatches]="palette"
    />
    <mimi-color-input data-test="signal" aria-label="S" [formField]="signalForm.color" />
    <mimi-color-input data-test="ng-model" aria-label="M" name="c" [(ngModel)]="model" />
  `,
})
class Host {
  readonly palette = PALETTE;
  readonly color = signal('#4f46e5');
  readonly recent = signal<string[]>([]);
  readonly off = signal(false);
  readonly extra = signal('');
  touches = 0;
  readonly brand = signal('#22c55e');
  readonly control = new FormControl('', { nonNullable: true, validators: Validators.required });
  readonly data = signal({ color: '' });
  readonly signalForm = form(this.data, (p) => required(p.color));
  readonly model = signal('#ffffff');
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('conversiones de color', () => {
  it('hex corto y largo, en minúsculas; inválidos', () => {
    expect(mimiNormalizeHex('#FFF')).toBe('#ffffff');
    expect(mimiNormalizeHex('4F46E5')).toBe('#4f46e5');
    expect(mimiNormalizeHex('#12345')).toBeNull();
    expect(mimiHexToRgb('#4f46e5')).toEqual({ r: 79, g: 70, b: 229 });
    const hsv = mimiRgbToHsv({ r: 79, g: 70, b: 229 });
    expect(Math.round(hsv.h)).toBe(243);
  });

  it('OKLCH: ida y vuelta, en %, y recorte a sRGB', () => {
    const oklch = mimiFormatOklch('#4f46e5');
    expect(oklch).toMatch(/^oklch\(0\.5\d\d 0\.2\d\d 27\d\.\d\)$/);
    expect(mimiParseColor(oklch)).toEqual({ hex: '#4f46e5', clipped: false });
    expect(mimiParseColor('oklch(100% 0 0)')).toEqual({ hex: '#ffffff', clipped: false });
    const out = mimiParseColor('oklch(0.7 0.4 150)')!;
    expect(out.clipped).toBe(true);
    expect(mimiNormalizeHex(out.hex)).toBe(out.hex);
    expect(mimiParseColor('azul')).toBeNull();
    expect(mimiParseColor('oklch(2 0 0)')).toBeNull();
  });
});

// M.12: 20 s por prueba en esta suite (no los 5 s de Vitest). Abrir el panel la primera vez en
// cada archivo paga la primera creación de sus componentes: aislada tarda menos de 1 s, pero con
// `pnpm test` y todos los workers ocupados llegó a 6,8 s (05/11/2026; docs/plan/mantenimiento.md).
describe('MimiColorPicker', { timeout: 20_000 }, () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [provideMimiColorPickerText(MIMI_COLOR_PICKER_TEXT_ES)],
    });
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const host = (id: string) => root.querySelector<HTMLElement>(`[data-test="${id}"]`)!;
    const slot = (id: string, name: string) =>
      host(id).querySelector<HTMLElement>(`[data-slot="${name}"]`)!;
    const press = async (el: Element, key: string) => {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await settle(fixture);
    };
    const type = async (id: string, text: string, commit: 'enter' | 'blur' = 'enter') => {
      const input = slot(id, 'value') as HTMLInputElement;
      input.value = text;
      input.dispatchEvent(new Event('input'));
      if (commit === 'enter') input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      else input.dispatchEvent(new Event('blur'));
      await settle(fixture);
    };
    return { fixture, h: fixture.componentInstance, root, host, slot, press, type };
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
  });

  it('el área es un grupo con dos sliders, saturación y brillo (M.14), y el tono otro slider', async () => {
    const { slot } = await setup();
    const area = slot('panel', 'area');
    expect(area.getAttribute('role')).toBe('group');
    expect(area.getAttribute('aria-label')).toBe('Saturación y brillo');
    expect(area.hasAttribute('tabindex')).toBe(false);
    expect(area.className).toContain('touch-none');
    // Cada eje, su slider: nombre, mínimo, máximo, valor y orientación (APG, «Slider»).
    const saturation = slot('panel', 'saturation');
    const brightness = slot('panel', 'brightness');
    for (const [axis, name, now, orientation] of [
      [saturation, 'Saturación', '69', 'horizontal'],
      [brightness, 'Brillo', '90', 'vertical'],
    ] as const) {
      expect(axis.getAttribute('role')).toBe('slider');
      expect(axis.getAttribute('aria-label')).toBe(name);
      expect(axis.getAttribute('aria-valuemin')).toBe('0');
      expect(axis.getAttribute('aria-valuemax')).toBe('100');
      expect(axis.getAttribute('aria-valuenow')).toBe(now);
      expect(axis.getAttribute('aria-valuetext')).toBe(`${now} %`);
      expect(axis.getAttribute('aria-orientation')).toBe(orientation);
      expect(axis.getAttribute('tabindex')).toBe('0');
    }
    const hue = slot('panel', 'hue');
    expect(hue.getAttribute('aria-label')).toBe('Tono');
    expect(hue.getAttribute('aria-valuemax')).toBe('360');
    expect(hue.getAttribute('aria-valuenow')).toBe('243');
    expect(slot('panel', 'area-thumb').className).toContain(
      'border-[color:var(--mimi-color-picker-thumb-border,oklch(1_0_0))]',
    );
    expect((slot('panel', 'value') as HTMLInputElement).value).toBe('#4f46e5');
  });

  it('teclado: cada eje con las cuatro flechas de a 2 %, Re/Av Pág de a 10 e Inicio/Fin; el tono de a 3°', async () => {
    const { h, slot, press } = await setup();
    const saturation = slot('panel', 'saturation');
    const brightness = slot('panel', 'brightness');
    await press(saturation, 'ArrowRight');
    expect(saturation.getAttribute('aria-valuenow')).toBe('71');
    await press(saturation, 'ArrowDown');
    expect(saturation.getAttribute('aria-valuenow')).toBe('69');
    // La flecha del otro eje no lo toca: cada slider tiene su valor.
    expect(brightness.getAttribute('aria-valuenow')).toBe('90');
    await press(brightness, 'ArrowDown');
    expect(brightness.getAttribute('aria-valuenow')).toBe('88');
    await press(brightness, 'PageUp');
    expect(brightness.getAttribute('aria-valuenow')).toBe('98');
    await press(brightness, 'End');
    expect(brightness.getAttribute('aria-valuenow')).toBe('100');
    await press(saturation, 'Home');
    expect(saturation.getAttribute('aria-valuenow')).toBe('0');
    await press(saturation, 'End');
    expect(saturation.getAttribute('aria-valuenow')).toBe('100');
    expect(brightness.getAttribute('aria-valuenow')).toBe('100');
    const before = h.color();
    const hue = slot('panel', 'hue');
    await press(hue, 'ArrowRight');
    expect(hue.getAttribute('aria-valuenow')).toBe('246');
    await press(hue, 'PageUp');
    expect(hue.getAttribute('aria-valuenow')).toBe('276');
    await press(hue, 'Home');
    expect(hue.getAttribute('aria-valuenow')).toBe('0');
    expect(h.color()).not.toBe(before);
    expect(mimiNormalizeHex(h.color())).toBe(h.color());
  });

  it('arrastrar el área y el tono: pointer capture, foco y el valor; al soltar, a recientes', async () => {
    const { h, fixture, slot } = await setup();
    const area = slot('panel', 'area');
    area.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect;
    area.setPointerCapture = vi.fn();
    area.releasePointerCapture = vi.fn();
    const pointer = (type: string, x: number, y: number) =>
      area.dispatchEvent(
        new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, bubbles: true }),
      );
    pointer('pointerdown', 200, 0);
    await settle(fixture);
    // El puntero mueve los dos ejes a la vez; el foco va al slider de saturación (M.14).
    expect(document.activeElement).toBe(slot('panel', 'saturation'));
    expect(area.setPointerCapture).toHaveBeenCalled();
    expect(slot('panel', 'saturation').getAttribute('aria-valuenow')).toBe('100');
    expect(slot('panel', 'brightness').getAttribute('aria-valuenow')).toBe('100');
    pointer('pointermove', 0, 100);
    pointer('pointerup', 0, 100);
    await settle(fixture);
    expect(h.color()).toBe('#000000');
    expect(h.recent()).toEqual(['#000000']);
    expect(h.touches).toBe(1);
    // Negro: el tono no salta.
    expect(slot('panel', 'hue').getAttribute('aria-valuenow')).toBe('243');
  });

  it('escribir hex u OKLCH y confirmar; inválido marca aria-invalid sin cambiar el valor', async () => {
    const { h, slot, type, fixture, host } = await setup();
    await type('panel', '#FFF');
    expect(h.color()).toBe('#ffffff');
    await type('panel', 'rojo', 'blur');
    expect(h.color()).toBe('#ffffff');
    expect(slot('panel', 'value').getAttribute('aria-invalid')).toBe('true');
    // Formato OKLCH: el campo muestra el valor en OKLCH; el valor sigue siendo hex.
    host('panel').querySelector<HTMLButtonElement>('[data-format="oklch"]')!.click();
    await settle(fixture);
    expect((slot('panel', 'value') as HTMLInputElement).value).toBe('oklch(1.000 0.000 0.0)');
    await type('panel', 'oklch(0.7 0.4 150)');
    expect(mimiNormalizeHex(h.color())).toBe(h.color());
    expect(slot('panel', 'clipped').textContent?.trim()).toBe(
      'Ajustado al color sRGB más cercano.',
    );
  });

  it('volver a escribir el mismo valor no mueve los pulgares', async () => {
    const { slot, press, type } = await setup();
    const hue = slot('panel', 'hue');
    await press(hue, 'ArrowRight');
    const now = hue.getAttribute('aria-valuenow');
    const value = (slot('panel', 'value') as HTMLInputElement).value;
    await type('panel', value);
    expect(hue.getAttribute('aria-valuenow')).toBe(now);
  });

  it('paleta: aria-pressed, una parada de Tab y flechas; elegir guarda en recientes', async () => {
    const { h, fixture, slot } = await setup();
    const buttons = () =>
      Array.from(slot('panel', 'palette').querySelectorAll<HTMLButtonElement>('button'));
    expect(buttons()[4].getAttribute('aria-pressed')).toBe('true');
    expect(buttons()[4].getAttribute('aria-label')).toBe('#4f46e5');
    expect(buttons().filter((b) => b.tabIndex === 0).length).toBe(1);
    buttons()[4].focus();
    buttons()[4].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(buttons()[5]);
    buttons()[4].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(buttons()[8]);
    buttons()[0].click();
    await settle(fixture);
    expect(h.color()).toBe('#ef4444');
    expect(h.recent()[0]).toBe('#ef4444');
    const recent = slot('panel', 'recent');
    expect(recent.querySelector('button')!.getAttribute('aria-label')).toBe('#ef4444');
  });

  it('recientes vacíos: el texto del diseño; showRecent=false los oculta', async () => {
    const { host } = await setup();
    expect(host('panel').textContent).toContain('Los colores que elijas aparecerán aquí.');
    expect(host('reactive').textContent).not.toContain('Recientes');
  });

  it('el formato es un radiogroup con flechas', async () => {
    const { fixture, host } = await setup();
    const group = host('panel').querySelector<HTMLElement>('[role="radiogroup"]')!;
    expect(group.getAttribute('aria-label')).toBe('Formato');
    const hex = group.querySelector<HTMLButtonElement>('[data-format="hex"]')!;
    expect(hex.getAttribute('aria-checked')).toBe('true');
    hex.focus();
    hex.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await settle(fixture);
    expect(group.querySelector('[data-format="oklch"]')!.getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement?.getAttribute('data-format')).toBe('oklch');
  });

  it('deshabilitado y class', async () => {
    const { h, fixture, host, slot, press } = await setup();
    h.extra.set('w-64');
    h.off.set(true);
    await settle(fixture);
    expect(host('panel').classList).toContain('w-64');
    expect(host('panel').hasAttribute('data-disabled')).toBe(true);
    expect(slot('panel', 'saturation').getAttribute('tabindex')).toBe('-1');
    expect(slot('panel', 'brightness').getAttribute('tabindex')).toBe('-1');
    await press(slot('panel', 'saturation'), 'ArrowRight');
    await press(slot('panel', 'brightness'), 'ArrowUp');
    expect(h.color()).toBe('#4f46e5');
  });

  it('un valor inválido que llega del formulario se muestra sin reescribirlo', async () => {
    const { h, fixture, slot } = await setup();
    h.color.set('rojo');
    await settle(fixture);
    expect((slot('panel', 'value') as HTMLInputElement).value).toBe('rojo');
    expect(h.color()).toBe('rojo');
  });

  it('Reactive Forms en el panel', async () => {
    const { h, fixture, type } = await setup();
    await type('reactive', '#123456');
    expect(h.control.value).toBe('#123456');
    expect(h.control.touched).toBe(true);
    h.control.disable();
    await settle(fixture);
    expect(fixtureHasDisabled(fixture.nativeElement)).toBe(true);
  });

  it('disparador: muestra y valor, abre el panel en un Popover y sincroniza', async () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => 10,
    });
    const { h, fixture, host } = await setup();
    const trigger = host('input').querySelector<HTMLButtonElement>('button')!;
    // WCAG 2.5.3 (axe, label-content-name-mismatch): la etiqueta y el valor visible en el nombre.
    expect(trigger.hasAttribute('aria-label')).toBe(false);
    expect(
      trigger
        .getAttribute('aria-labelledby')!
        .split(' ')
        .map((id) => document.getElementById(id)!.textContent!.trim())
        .join(' '),
    ).toBe('Color de marca #22c55e');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.textContent?.trim()).toBe('#22c55e');
    expect(
      (host('input').querySelector('[data-slot="swatch"]') as HTMLElement).style.backgroundColor,
    ).toBe('rgb(34, 197, 94)');
    trigger.click();
    await settle(fixture);
    const panel = document.querySelector<HTMLElement>('[data-mimi-overlay-panel]')!;
    expect(panel.getAttribute('aria-label')).toBe('Elegir color');
    panel.querySelector<HTMLButtonElement>('[data-slot="palette"] button')!.click();
    await settle(fixture);
    expect(h.brand()).toBe('#ef4444');
    expect(trigger.textContent?.trim()).toBe('#ef4444');
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)['offsetWidth'];
  });

  it('disparador con Signal Forms y ngModel', async () => {
    const { h, fixture, host } = await setup();
    // M.15 (axe, aria-allowed-attr): un <button> no admite aria-required; va en la descripción.
    const t = host('signal').querySelector('button')!;
    expect(t.hasAttribute('aria-required')).toBe(false);
    const described = (t.getAttribute('aria-describedby') ?? '').split(/\s+/);
    expect(described.map((id) => document.getElementById(id)?.textContent?.trim())).toContain(
      'obligatorio',
    );
    expect(host('ng-model').querySelector('button')!.textContent?.trim()).toBe('#ffffff');
    h.model.set('#000000');
    await settle(fixture);
    expect(host('ng-model').querySelector('button')!.textContent?.trim()).toBe('#000000');
  });
});

function fixtureHasDisabled(root: HTMLElement): boolean {
  return root.querySelector('[data-test="reactive"]')!.hasAttribute('data-disabled');
}
