import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, minLength, required } from '@angular/forms/signals';
import { MimiInput } from '@/components/ui/input';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages, withMessage } from './error-messages';
import { MimiFormFieldImports } from './form-field';

/** PD-3 (opciones A + B): el mensaje con el validador y `[errors]` en el campo. */
@Component({
  imports: [MimiFormFieldImports, MimiInput, ReactiveFormsModule, FormsModule, FormField],
  template: `
    <mimi-form-field data-test="b-reactive" label="Usuario">
      <input mimiInput [formControl]="withText" />
    </mimi-form-field>
    <mimi-form-field data-test="b-fn" label="Largo">
      <input mimiInput [formControl]="withFn" />
    </mimi-form-field>
    <mimi-form-field data-test="b-custom" label="Libre">
      <input mimiInput [formControl]="custom" />
    </mimi-form-field>
    <mimi-form-field
      data-test="a-map"
      label="Mapa"
      [errors]="{ required: 'Texto del campo.', minlength: fnText }"
    >
      <input mimiInput [formControl]="plain" />
    </mimi-form-field>
    <mimi-form-field
      data-test="a-ngmodel"
      label="Plantilla"
      [errors]="{ REQUIRED: 'Del campo, en la plantilla.' }"
    >
      <input mimiInput required [(ngModel)]="model" name="m" />
    </mimi-form-field>
    <mimi-form-field data-test="priority" label="Prioridad" [errors]="{ required: 'Del campo.' }">
      <input mimiInput [formControl]="priority" />
    </mimi-form-field>
    <mimi-form-field data-test="explicit" label="Explícito" [errors]="{ required: 'Del campo.' }">
      <input mimiInput [formControl]="explicit" />
      <mimi-form-error>Texto fijo explícito.</mimi-form-error>
    </mimi-form-field>
    <mimi-form-field data-test="signal" label="Señal">
      <input mimiInput [formField]="f.user" />
    </mimi-form-field>
    <mimi-form-field data-test="default" label="Sin nada">
      <input mimiInput [formControl]="bare" />
    </mimi-form-field>
  `,
})
class Host {
  readonly withText = new FormControl('', [
    withMessage(Validators.required, 'Elige un nombre de usuario.'),
  ]);
  readonly withFn = new FormControl('ab', [
    withMessage(Validators.minLength(3), (e) => `Mínimo ${e['requiredLength']} letras.`),
  ]);
  readonly custom = new FormControl('x', [
    () => ({ taken: { message: 'Ese usuario ya existe.' } }),
  ]);
  readonly plain = new FormControl('', [Validators.required]);
  readonly fnText = (e: Record<string, unknown>) => `Faltan letras (${e['requiredLength']}).`;
  model = '';
  readonly priority = new FormControl('', [withMessage(Validators.required, 'Del validador.')]);
  readonly explicit = new FormControl('', [Validators.required]);
  readonly bare = new FormControl('', [Validators.required]);
  readonly data = signal({ user: '' });
  readonly f = form(this.data, (p) => {
    required(p.user, { message: 'Elige un nombre (Signal Forms).' });
    minLength(p.user, 3);
  });
}

describe('mensajes de error: del validador y del campo (PD-3, A + B)', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)],
    });
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const h = fixture.componentInstance;
    const touch = async (...controls: FormControl[]) => {
      controls.forEach((c) => {
        c.markAsTouched();
        c.updateValueAndValidity();
      });
      await fixture.whenStable();
    };
    const text = (test: string) =>
      el
        .querySelector(`[data-test="${test}"] mimi-form-error`)!
        .textContent!.replace(/\s+/g, ' ')
        .trim();
    return { fixture, el, h, touch, text };
  }

  it('B, Reactive: withMessage con texto y con función; un validador propio con { message }', async () => {
    const { h, touch, text } = await setup();
    await touch(h.withText, h.withFn, h.custom);
    expect(text('b-reactive')).toBe('Elige un nombre de usuario.');
    expect(text('b-fn')).toBe('Mínimo 3 letras.');
    expect(text('b-custom')).toBe('Ese usuario ya existe.');
  });

  it('A: [errors] en el campo, con texto o función; las claves no distinguen mayúsculas; sirve con ngModel', async () => {
    const { h, touch, text, fixture } = await setup();
    await touch(h.plain);
    expect(text('a-map')).toBe('Texto del campo.');
    h.plain.setValue('ab');
    h.plain.setValidators([Validators.minLength(3)]);
    h.plain.updateValueAndValidity();
    await fixture.whenStable();
    expect(text('a-map')).toBe('Faltan letras (3).');
    // ngModel con `required` como atributo: no hay dónde poner un texto, salvo [errors].
    const input = fixture.nativeElement.querySelector(
      '[data-test="a-ngmodel"] input',
    ) as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(text('a-ngmodel')).toBe('Del campo, en la plantilla.');
  });

  it('prioridad: <mimi-form-error> > message del validador > [errors] > provideMimiErrorMessages', async () => {
    const { h, touch, text } = await setup();
    await touch(h.priority, h.explicit, h.bare);
    // El validador gana al mapa del campo.
    expect(text('priority')).toBe('Del validador.');
    // El <mimi-form-error> con texto gana a todo.
    expect(text('explicit')).toBe('Texto fijo explícito.');
    // Sin nada: el de provideMimiErrorMessages.
    expect(text('default')).toBe(MIMI_ERROR_MESSAGES_ES['required']);
  });

  it('Signal Forms: el message del esquema ya se mostraba sin mimi-form-error', async () => {
    const { h, fixture, el, text } = await setup();
    h.f.user().markAsTouched();
    await fixture.whenStable();
    expect(el.querySelector('[data-test="signal"] mimi-form-error')).not.toBeNull();
    expect(text('signal')).toBe('Elige un nombre (Signal Forms).');
  });
});
