import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInputMask, mimiApplyMask, mimiMaskLength, mimiUnmask } from './input-mask';

const PHONE = '(00) 0000 0000';

describe('funciones de la máscara', () => {
  it('aplica, quita y cuenta', () => {
    expect(mimiMaskLength(PHONE)).toBe(10);
    expect(mimiApplyMask(PHONE, '')).toBe('');
    expect(mimiApplyMask(PHONE, '5')).toBe('(5');
    expect(mimiApplyMask(PHONE, '55')).toBe('(55');
    expect(mimiApplyMask(PHONE, '551')).toBe('(55) 1');
    expect(mimiApplyMask(PHONE, '5512345678')).toBe('(55) 1234 5678');
    expect(mimiUnmask(PHONE, '(55) 1234-5678 99')).toBe('5512345678');
    expect(mimiApplyMask('00/00/0000', '31122026')).toBe('31/12/2026');
  });
});

@Component({
  imports: [MimiInputMask, MimiFormField, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <mimi-input-mask
      data-test="plain"
      aria-label="Teléfono"
      autocomplete="tel-national"
      [mask]="mask()"
      [(value)]="phone"
      [readonly]="ro()"
      [class]="extra()"
    />
    <mimi-form-field label="Reactivo">
      <mimi-input-mask data-test="reactive" mask="00/00/0000" [formControl]="date" />
    </mimi-form-field>
    <mimi-input-mask
      data-test="signal"
      aria-label="Señal"
      [mask]="mask()"
      [formField]="signalForm.phone"
    />
    <mimi-input-mask
      data-test="ng-model"
      aria-label="Modelo"
      name="m"
      [mask]="mask()"
      [(ngModel)]="model"
    />
    <button data-test="out">Fuera</button>
  `,
})
class Host {
  readonly mask = signal(PHONE);
  readonly phone = signal('');
  readonly ro = signal(false);
  readonly extra = signal('');
  readonly date = new FormControl('', [Validators.required, Validators.minLength(8)]);
  readonly locked = signal(false);
  readonly data = signal({ phone: '' });
  readonly signalForm = form(this.data, (p) => {
    required(p.phone);
    disabled(p.phone, () => this.locked());
  });
  model = '';
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 2; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('MimiInputMask', () => {
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const input = (name: string) =>
      root.querySelector<HTMLInputElement>(`[data-test="${name}"] input`)!;
    /** Escribe como el navegador: cambia el texto, pone el cursor y dispara `input`. */
    const typeAt = async (name: string, text: string, caret = text.length) => {
      const el = input(name);
      el.focus();
      el.value = text;
      el.setSelectionRange(caret, caret);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await settle(fixture);
    };
    const out = async () => {
      root.querySelector<HTMLElement>('[data-test="out"]')!.focus();
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, root, input, typeAt, out };
  }

  it('formatea al escribir; el modelo guarda solo los dígitos', async () => {
    const { host, input, typeAt } = await setup();
    await typeAt('plain', '5');
    expect(input('plain').value).toBe('(5');
    expect(host.phone()).toBe('5');
    await typeAt('plain', '(5512');
    expect(input('plain').value).toBe('(55) 12');
    expect(host.phone()).toBe('5512');
    await typeAt('plain', '(55) 1234 56789');
    expect(input('plain').value).toBe('(55) 1234 5678');
    expect(host.phone()).toBe('5512345678');
  });

  it('cursor: al escribir en medio queda después del dígito escrito', async () => {
    const { input, typeAt, host } = await setup();
    await typeAt('plain', '(55) 1234 567');
    // Se escribe un 9 después de «(55) 12»: el texto crudo es «(55) 1293 4567».
    await typeAt('plain', '(55) 129 34567', 8);
    expect(host.phone()).toBe('5512934567');
    expect(input('plain').value).toBe('(55) 1293 4567');
    expect(input('plain').selectionStart).toBe(8);
  });

  it('borrar hacia atrás sobre un literal borra el dígito de al lado', async () => {
    const { input, typeAt, host, fixture } = await setup();
    await typeAt('plain', '(55) 1234');
    const el = input('plain');
    // Cursor después de «(55) »: el carácter de atrás es un espacio (literal).
    el.setSelectionRange(5, 5);
    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }),
    );
    await settle(fixture);
    expect(host.phone()).toBe('51234');
    expect(el.value).toBe('(51) 234');
    expect(el.selectionStart).toBe(2);
  });

  it('pegado con y sin literales', async () => {
    const { input, typeAt, host } = await setup();
    await typeAt('plain', '55 1234 5678');
    expect(host.phone()).toBe('5512345678');
    await typeAt('plain', '');
    await typeAt('plain', '(55) 9876-5432');
    expect(input('plain').value).toBe('(55) 9876 5432');
  });

  it('IME: no reformatea durante la composición, sí al terminar', async () => {
    const { input, host, fixture } = await setup();
    const el = input('plain');
    el.focus();
    el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    el.value = '55';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await settle(fixture);
    expect(el.value).toBe('55');
    expect(host.phone()).toBe('');
    el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    await settle(fixture);
    expect(el.value).toBe('(55');
    expect(host.phone()).toBe('55');
  });

  it('un valor desde fuera se pinta con la máscara; inputmode, autocomplete y maxlength', async () => {
    const { host, input, fixture } = await setup();
    host.phone.set('5512345678');
    await settle(fixture);
    expect(input('plain').value).toBe('(55) 1234 5678');
    expect(input('plain').getAttribute('inputmode')).toBe('numeric');
    expect(input('plain').getAttribute('autocomplete')).toBe('tel-national');
    expect(input('plain').getAttribute('maxlength')).toBe(String(PHONE.length));
    expect(input('plain').getAttribute('aria-label')).toBe('Teléfono');
  });

  it('solo lectura y class del usuario en el input', async () => {
    const { host, input, fixture } = await setup();
    host.ro.set(true);
    host.extra.set('h-12 rounded-none');
    await settle(fixture);
    expect(input('plain').readOnly).toBe(true);
    expect(input('plain').className).toContain('h-12');
    expect(input('plain').className).not.toContain('h-[var(--mimi-input-height');
  });

  it('Reactive Forms: dígitos en el control, nombre y error por mimi-form-field', async () => {
    const { host, input, typeAt, out, root, fixture } = await setup();
    expect(root.querySelector('label')!.getAttribute('for')).toBe(input('reactive').id);
    await typeAt('reactive', '3112');
    expect(input('reactive').value).toBe('31/12');
    expect(host.date.value).toBe('3112');
    await out();
    // Incompleta: con Reactive Forms la marca el validador del usuario (minLength).
    expect(host.date.hasError('minlength')).toBe(true);
    expect(input('reactive').getAttribute('aria-invalid')).toBe('true');
    host.date.setValue('01022026');
    await settle(fixture);
    expect(input('reactive').value).toBe('01/02/2026');
    host.date.disable();
    await settle(fixture);
    expect(input('reactive').disabled).toBe(true);
  });

  it('Signal Forms: dígitos en el modelo; una máscara incompleta deja el campo inválido', async () => {
    const { host, input, typeAt, out, fixture } = await setup();
    await typeAt('signal', '551');
    expect(host.data().phone).toBe('551');
    await out();
    expect(host.signalForm.phone().invalid()).toBe(true);
    expect(
      host.signalForm
        .phone()
        .errors()
        .some((e) => e.kind === 'mask'),
    ).toBe(true);
    await typeAt('signal', '5512345678');
    expect(host.signalForm.phone().invalid()).toBe(false);
    host.data.set({ phone: '5599990000' });
    await settle(fixture);
    expect(input('signal').value).toBe('(55) 9999 0000');
    host.locked.set(true);
    await settle(fixture);
    expect(input('signal').disabled).toBe(true);
  });

  it('ngModel: dígitos en el modelo', async () => {
    const { host, typeAt } = await setup();
    await typeAt('ng-model', '(55) 4444 3333');
    expect(host.model).toBe('5544443333');
  });
});
