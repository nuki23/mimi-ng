import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInputOtp } from './input-otp';

@Component({
  imports: [MimiInputOtp, MimiFormField, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <mimi-input-otp
      data-test="plain"
      aria-label="Código"
      [(value)]="code"
      [length]="length()"
      [separatorAfter]="after()"
      [alphanumeric]="alpha()"
      [success]="ok()"
      [class]="extra()"
    />
    <mimi-form-field label="Reactivo">
      <mimi-input-otp data-test="reactive" [formControl]="control" />
    </mimi-form-field>
    <mimi-input-otp data-test="signal" aria-label="Señal" [formField]="signalForm.code" />
    <mimi-input-otp data-test="ng-model" aria-label="Modelo" name="c" [(ngModel)]="model" />
    <button data-test="out">Fuera</button>
  `,
})
class Host {
  readonly code = signal('');
  readonly length = signal(6);
  readonly after = signal<number | undefined>(3);
  readonly alpha = signal(false);
  readonly ok = signal(false);
  readonly extra = signal('');
  readonly control = new FormControl('', [Validators.required, Validators.minLength(6)]);
  readonly locked = signal(false);
  readonly data = signal({ code: '' });
  readonly signalForm = form(this.data, (p) => {
    required(p.code);
    disabled(p.code, () => this.locked());
  });
  model = '';
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 2; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('MimiInputOtp', () => {
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const part = (name: string) => root.querySelector<HTMLElement>(`[data-test="${name}"]`)!;
    const input = (name: string) => part(name).querySelector<HTMLInputElement>('input')!;
    const boxes = (name: string) =>
      Array.from(part(name).querySelectorAll<HTMLElement>('[data-slot="box"]'));
    const type = async (name: string, text: string) => {
      const el = input(name);
      el.focus();
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await settle(fixture);
    };
    const out = async () => {
      root.querySelector<HTMLElement>('[data-test="out"]')!.focus();
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, part, input, boxes, type, out };
  }

  it('un solo input real: one-time-code, numeric, maxlength y nombre; casillas aria-hidden', async () => {
    const { input, boxes, part } = await setup();
    const el = input('plain');
    expect(part('plain').querySelectorAll('input').length).toBe(1);
    expect(el.getAttribute('autocomplete')).toBe('one-time-code');
    expect(el.getAttribute('inputmode')).toBe('numeric');
    expect(el.getAttribute('maxlength')).toBe('6');
    expect(el.getAttribute('aria-label')).toBe('Código');
    expect(el.getAttribute('aria-hidden')).toBeNull();
    expect(boxes('plain').length).toBe(6);
    expect(boxes('plain').every((b) => b.getAttribute('aria-hidden') === 'true')).toBe(true);
    // El guion va después de la tercera casilla.
    const separator = part('plain').querySelector('[data-slot="separator"]')!;
    expect(separator.previousElementSibling).toBe(boxes('plain')[2]);
  });

  it('solo dígitos y como máximo la longitud; el pegado con espacios o guiones se limpia', async () => {
    const { host, input, boxes, part, type } = await setup();
    await type('plain', '2a4');
    expect(host.code()).toBe('24');
    expect(input('plain').value).toBe('24');
    await type('plain', '246 810-99');
    expect(host.code()).toBe('246810');
    expect(boxes('plain').map((b) => b.textContent!.trim())).toEqual([
      '2',
      '4',
      '6',
      '8',
      '1',
      '0',
    ]);
    expect(part('plain').getAttribute('data-state')).toBe('complete');
  });

  it('casilla activa con el foco: anillo y cursor en la siguiente a llenar', async () => {
    const { boxes, type, input, fixture } = await setup();
    await type('plain', '24');
    const active = boxes('plain').filter((b) => b.hasAttribute('data-active'));
    expect(active.length).toBe(1);
    expect(active[0]).toBe(boxes('plain')[2]);
    expect(active[0].className).toContain('ring-ring-soft');
    const caret = active[0].querySelector('[data-slot="caret"]')!;
    expect(caret.className).toContain('animate-[mimi-caret_1s_steps(1)_infinite]');
    expect(caret.className).toContain('motion-reduce:animate-none');
    input('plain').blur();
    await settle(fixture);
    expect(boxes('plain').some((b) => b.hasAttribute('data-active'))).toBe(false);
  });

  it('borrar hacia atrás es el del input (el valor sigue al texto)', async () => {
    const { host, type } = await setup();
    await type('plain', '2468');
    await type('plain', '246');
    expect(host.code()).toBe('246');
  });

  it('success y error: borde y anillo en todas las casillas; el error sacude la fila', async () => {
    const { host, boxes, fixture, part, type, out, input } = await setup();
    await type('plain', '246810');
    host.ok.set(true);
    await settle(fixture);
    expect(boxes('plain').every((b) => b.className.includes('border-success'))).toBe(true);
    await type('reactive', '12');
    await out();
    const reactive = part('reactive');
    expect(reactive.hasAttribute('data-invalid')).toBe(true);
    expect(input('reactive').getAttribute('aria-invalid')).toBe('true');
    expect(boxes('reactive').every((b) => b.className.includes('border-destructive'))).toBe(true);
    expect(reactive.className).toContain('data-[invalid]:animate-[mimi-shake_.4s]');
    expect(reactive.className).toContain('motion-reduce:data-[invalid]:animate-none');
  });

  it('longitud, sin separador y alfanumérico', async () => {
    const { host, fixture, boxes, part, input, type } = await setup();
    host.length.set(4);
    host.after.set(undefined);
    host.alpha.set(true);
    await settle(fixture);
    expect(boxes('plain').length).toBe(4);
    expect(part('plain').querySelector('[data-slot="separator"]')).toBeNull();
    expect(input('plain').getAttribute('inputmode')).toBe('text');
    await type('plain', 'ab-12x');
    expect(host.code()).toBe('ab12');
  });

  it('class del usuario en la fila', async () => {
    const { host, fixture, part } = await setup();
    host.extra.set('gap-4');
    await settle(fixture);
    expect(part('plain').className).toContain('gap-4');
    expect(part('plain').className).not.toContain('gap-[var(--mimi-otp-gap');
  });

  it('Reactive Forms: valor, desde el formulario, disabled y etiqueta por mimi-form-field', async () => {
    const { host, input, boxes, type, fixture } = await setup();
    expect(document.querySelector(`label[for="${input('reactive').id}"]`)).not.toBeNull();
    await type('reactive', '135790');
    expect(host.control.value).toBe('135790');
    host.control.setValue('111222');
    await settle(fixture);
    expect(boxes('reactive')[5].textContent!.trim()).toBe('2');
    host.control.disable();
    await settle(fixture);
    expect(input('reactive').disabled).toBe(true);
  });

  it('Signal Forms y ngModel', async () => {
    const { host, input, type, fixture } = await setup();
    await type('signal', '424242');
    expect(host.data().code).toBe('424242');
    host.locked.set(true);
    await settle(fixture);
    expect(input('signal').disabled).toBe(true);
    await type('ng-model', '9 9 9');
    expect(host.model).toBe('999');
  });
});
