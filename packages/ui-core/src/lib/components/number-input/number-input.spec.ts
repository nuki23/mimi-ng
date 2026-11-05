import { Component, LOCALE_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { disabled, form, FormField, max, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiNumberInput } from './number-input';
import { MIMI_NUMBER_INPUT_TEXT_ES, provideMimiNumberInputText } from './number-input-texts';

@Component({
  imports: [MimiNumberInput],
  template: `
    <button data-test="before">Antes</button>
    <mimi-number-input
      aria-label="Cantidad"
      [(value)]="value"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [format]="format()"
      [locale]="locale()"
      [disabled]="off()"
      [readonly]="ro()"
      [class]="extra()"
    />
    <button data-test="after">Después</button>
  `,
})
class Host {
  readonly value = signal<number | null>(3);
  readonly min = signal<number | undefined>(0);
  readonly max = signal<number | undefined>(10);
  readonly step = signal(1);
  readonly format = signal<Intl.NumberFormatOptions | undefined>(undefined);
  readonly locale = signal<string | undefined>('en-US');
  readonly off = signal(false);
  readonly ro = signal(false);
  readonly extra = signal('');
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 2; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

const key = (el: Element, k: string, init: KeyboardEventInit = {}) =>
  el.dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }),
  );

describe('MimiNumberInput', () => {
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const box = root.querySelector<HTMLElement>('mimi-number-input')!;
    const input = box.querySelector<HTMLInputElement>('input')!;
    const dec = box.querySelector<HTMLButtonElement>('[data-slot="decrement"]')!;
    const inc = box.querySelector<HTMLButtonElement>('[data-slot="increment"]')!;
    const type = async (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      await settle(fixture);
    };
    const blur = async () => {
      root.querySelector<HTMLElement>('[data-test="after"]')!.focus();
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, root, box, input, dec, inc, type, blur };
  }

  it('spinbutton con inputmode, valuenow, valuemin, valuemax y valuetext', async () => {
    const { input, host, fixture } = await setup();
    expect(input.getAttribute('role')).toBe('spinbutton');
    expect(input.getAttribute('inputmode')).toBe('decimal');
    expect(input.type).toBe('text');
    expect(input.getAttribute('aria-label')).toBe('Cantidad');
    expect(input.getAttribute('aria-valuenow')).toBe('3');
    expect(input.getAttribute('aria-valuemin')).toBe('0');
    expect(input.getAttribute('aria-valuemax')).toBe('10');
    host.format.set({ style: 'currency', currency: 'MXN' });
    host.locale.set('es-MX');
    host.max.set(100000);
    host.value.set(1250);
    await settle(fixture);
    expect(input.getAttribute('aria-valuetext')).toBe(
      new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(1250),
    );
    expect(input.value).toBe(input.getAttribute('aria-valuetext'));
  });

  it('con el foco muestra el número sin formato; al salir, formateado', async () => {
    const { input, host, fixture, blur } = await setup();
    host.locale.set('es-ES');
    host.max.set(100000);
    host.step.set(0.5);
    host.value.set(1250.5);
    await settle(fixture);
    expect(input.value).toBe(new Intl.NumberFormat('es-ES').format(1250.5));
    input.focus();
    await settle(fixture);
    expect(input.value).toBe('1250,5');
    await blur();
    expect(input.value).toBe(new Intl.NumberFormat('es-ES').format(1250.5));
  });

  it('lee con los separadores del idioma: es-ES, en-US y es-MX', async () => {
    const { input, host, fixture, type, blur } = await setup();
    host.max.set(100000);
    host.step.set(0.1);
    for (const [locale, text] of [
      ['es-ES', '1.250,5'],
      ['en-US', '1,250.5'],
      ['es-MX', '1,250.5'],
    ] as const) {
      host.locale.set(locale);
      host.value.set(0);
      await settle(fixture);
      input.focus();
      await type(text);
      await blur();
      expect(host.value(), locale).toBe(1250.5);
    }
  });

  it('no reformatea mientras se escribe; al salir redondea al paso y acota', async () => {
    const { input, host, fixture, type, blur } = await setup();
    host.step.set(0.25);
    host.max.set(50);
    await settle(fixture);
    input.focus();
    await type('12.3');
    expect(input.value).toBe('12.3');
    expect(host.value()).toBe(3);
    await blur();
    expect(host.value()).toBe(12.25);
    input.focus();
    await type('999');
    await blur();
    expect(host.value()).toBe(50);
  });

  it('vacío es null; un texto que no es número se descarta', async () => {
    const { input, host, type, blur } = await setup();
    input.focus();
    await type('abc');
    await blur();
    expect(host.value()).toBe(3);
    input.focus();
    await type('');
    await blur();
    expect(host.value()).toBeNull();
    expect(input.getAttribute('aria-valuenow')).toBeNull();
  });

  it('teclado: ↑ ↓ un paso, Re Pág / Av Pág diez, Inicio y Fin los límites, Enter confirma', async () => {
    const { input, host, fixture, type } = await setup();
    input.focus();
    await settle(fixture);
    key(input, 'ArrowUp');
    await settle(fixture);
    expect(host.value()).toBe(4);
    expect(input.value).toBe('4');
    key(input, 'ArrowDown');
    key(input, 'ArrowDown');
    await settle(fixture);
    expect(host.value()).toBe(2);
    key(input, 'PageUp');
    await settle(fixture);
    expect(host.value()).toBe(10);
    key(input, 'Home');
    await settle(fixture);
    expect(host.value()).toBe(0);
    key(input, 'End');
    await settle(fixture);
    expect(host.value()).toBe(10);
    await type('7');
    key(input, 'Enter');
    await settle(fixture);
    expect(host.value()).toBe(7);
    expect(document.activeElement).toBe(input);
  });

  it('los botones no son paradas de Tab; en los límites, aria-disabled sin disabled nativo', async () => {
    const { dec, inc, input, host, fixture } = await setup();
    expect(dec.getAttribute('tabindex')).toBe('-1');
    expect(inc.getAttribute('aria-label')).toBe('Increase Cantidad');
    host.value.set(10);
    await settle(fixture);
    expect(inc.getAttribute('aria-disabled')).toBe('true');
    expect(inc.disabled).toBe(false);
    expect(dec.getAttribute('aria-disabled')).toBeNull();
    inc.click();
    await settle(fixture);
    expect(host.value()).toBe(10);
    // Llegar al límite con el teclado no saca el foco del campo.
    host.value.set(9);
    await settle(fixture);
    input.focus();
    key(input, 'ArrowUp');
    await settle(fixture);
    expect(host.value()).toBe(10);
    expect(document.activeElement).toBe(input);
  });

  it('puntero en + : un paso al apretar, sin mover el foco; mantener pulsado repite', async () => {
    const { inc, host, fixture, root } = await setup();
    const before = root.querySelector<HTMLElement>('[data-test="before"]')!;
    before.focus();
    const down = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 });
    inc.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    await settle(fixture);
    expect(host.value()).toBe(4);
    expect(document.activeElement).toBe(before);
    await new Promise((r) => setTimeout(r, 560));
    inc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await settle(fixture);
    expect(host.value()!).toBeGreaterThan(4);
    // El click que sigue al pointerdown no suma otro paso.
    const value = host.value();
    inc.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle(fixture);
    expect(host.value()).toBe(value);
    // Un click sin pointerdown (lector de pantalla) suma uno.
    inc.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle(fixture);
    expect(host.value()).toBe(value! + 1);
  });

  it('un valor fuera de rango se pinta acotado sin reescribir el modelo', async () => {
    const { input, host, fixture } = await setup();
    host.value.set(25);
    await settle(fixture);
    expect(input.value).toBe('10');
    expect(input.getAttribute('aria-valuenow')).toBe('10');
    expect(host.value()).toBe(25);
  });

  it('deshabilitado y solo lectura', async () => {
    const { box, input, inc, host, fixture } = await setup();
    host.off.set(true);
    await settle(fixture);
    expect(input.disabled).toBe(true);
    expect(box.hasAttribute('data-disabled')).toBe(true);
    expect(inc.getAttribute('aria-disabled')).toBe('true');
    host.off.set(false);
    host.ro.set(true);
    await settle(fixture);
    expect(input.readOnly).toBe(true);
    expect(box.hasAttribute('data-readonly')).toBe(true);
    input.focus();
    key(input, 'ArrowUp');
    await settle(fixture);
    expect(host.value()).toBe(3);
  });

  it('class del usuario gana en la caja; el anillo de foco va en la caja', async () => {
    const { box, input, host, fixture } = await setup();
    host.extra.set('h-12 rounded-none border-primary');
    await settle(fixture);
    expect(box.className).toContain('h-12');
    expect(box.className).not.toContain('h-[var(--mimi-number-height');
    expect(box.className).not.toContain('rounded-[var(--mimi-number-radius');
    expect(box.className).toContain('focus-within:ring-3');
    expect(input.className).toContain('outline-none');
  });

  it('idioma: el LOCALE_ID de Angular por defecto', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }] });
    @Component({
      imports: [MimiNumberInput],
      template: '<mimi-number-input aria-label="Peso" [value]="1234.5" [step]="0.1" />',
    })
    class LocaleHost {}
    const fixture = TestBed.createComponent(LocaleHost);
    await settle(fixture);
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    expect(input.value).toBe(new Intl.NumberFormat('de-DE').format(1234.5));
  });

  it('textos en español con provideMimiNumberInputText', async () => {
    TestBed.configureTestingModule({
      providers: [provideMimiNumberInputText(MIMI_NUMBER_INPUT_TEXT_ES)],
    });
    const { dec, inc } = await setup();
    expect(dec.getAttribute('aria-label')).toBe('Disminuir Cantidad');
    expect(inc.getAttribute('aria-label')).toBe('Aumentar Cantidad');
  });
});

@Component({
  imports: [MimiNumberInput, MimiFormField, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <form [formGroup]="group">
      <mimi-form-field label="Reactivo">
        <mimi-number-input data-test="reactive" formControlName="qty" [min]="0" [max]="10" />
      </mimi-form-field>
    </form>
    <mimi-number-input data-test="signal" aria-label="Señal" [formField]="signalForm.qty" />
    <mimi-number-input data-test="ng-model" aria-label="Modelo" name="n" [(ngModel)]="model" />
    <button data-test="out">Fuera</button>
  `,
})
class FormsHost {
  readonly group = new FormGroup({
    qty: new FormControl<number | null>(null, [Validators.required, Validators.max(10)]),
  });
  readonly locked = signal(false);
  readonly data = signal<{ qty: number | null }>({ qty: null });
  readonly signalForm = form(this.data, (p) => {
    required(p.qty);
    max(p.qty, 10);
    disabled(p.qty, () => this.locked());
  });
  model: number | null = 5;
}

describe('MimiNumberInput con formularios', () => {
  async function setup() {
    const fixture = TestBed.createComponent(FormsHost);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const input = (name: string) =>
      root.querySelector<HTMLInputElement>(`[data-test="${name}"] input`)!;
    const box = (name: string) => root.querySelector<HTMLElement>(`[data-test="${name}"]`)!;
    const out = async () => {
      root.querySelector<HTMLElement>('[data-test="out"]')!.focus();
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, root, input, box, out };
  }

  it('Reactive Forms: valor en los dos sentidos, touched, error y nombre por mimi-form-field', async () => {
    const { fixture, host, input, box, out, root } = await setup();
    const label = root.querySelector('label')!;
    expect(label.getAttribute('for')).toBe(input('reactive').id);
    input('reactive').focus();
    await out();
    expect(host.group.controls.qty.touched).toBe(true);
    expect(box('reactive').hasAttribute('data-invalid')).toBe(true);
    expect(input('reactive').getAttribute('aria-invalid')).toBe('true');
    // El mensaje de mimi-form-field queda en el aria-describedby del input.
    expect(input('reactive').getAttribute('aria-describedby')).toBeTruthy();
    input('reactive').focus();
    key(input('reactive'), 'ArrowUp');
    await out();
    expect(host.group.value.qty).toBe(0);
    host.group.setValue({ qty: 7 });
    await settle(fixture);
    expect(input('reactive').value).toBe('7');
    host.group.controls.qty.disable();
    await settle(fixture);
    expect(input('reactive').disabled).toBe(true);
  });

  it('Signal Forms: valor, requerido, tocado, disabled y max del esquema', async () => {
    const { fixture, host, input, box, out } = await setup();
    input('signal').focus();
    await out();
    expect(host.signalForm.qty().touched()).toBe(true);
    expect(box('signal').hasAttribute('data-invalid')).toBe(true);
    input('signal').focus();
    input('signal').value = '4';
    input('signal').dispatchEvent(new Event('input'));
    await out();
    expect(host.data().qty).toBe(4);
    // El max del esquema llega al componente: Fin va a 10.
    input('signal').focus();
    key(input('signal'), 'End');
    await out();
    expect(host.data().qty).toBe(10);
    host.locked.set(true);
    await settle(fixture);
    expect(input('signal').disabled).toBe(true);
    void fixture;
  });

  it('ngModel', async () => {
    const { fixture, host, input, out } = await setup();
    expect(input('ng-model').value).toBe('5');
    input('ng-model').focus();
    key(input('ng-model'), 'ArrowDown');
    await out();
    expect(host.model).toBe(4);
    void fixture;
  });
});
