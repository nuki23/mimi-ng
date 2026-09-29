import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormField, email, form, minLength, required } from '@angular/forms/signals';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiInput } from '@/components/ui/input';
import { MimiTextarea } from '@/components/ui/textarea';
import {
  MIMI_ERROR_MESSAGES,
  MIMI_ERROR_MESSAGES_EN,
  MIMI_ERROR_MESSAGES_ES,
  provideMimiErrorMessages,
} from './error-messages';
import { MimiFormFieldImports } from './form-field';

@Component({
  imports: [
    MimiFormFieldImports,
    MimiInput,
    MimiTextarea,
    MimiCheckbox,
    FormsModule,
    ReactiveFormsModule,
    FormField,
  ],
  template: `
    <form [formGroup]="group">
      <mimi-form-field data-test="reactive" label="Correo" [class]="extra()">
        <input mimiInput formControlName="email" />
      </mimi-form-field>
      <mimi-form-field data-test="own-id" label="Nombre">
        <input mimiInput id="nombre" aria-describedby="nombre-ayuda" formControlName="name" />
      </mimi-form-field>
      <mimi-form-field data-test="checkbox">
        <mimi-checkbox formControlName="terms">Acepto los términos</mimi-checkbox>
      </mimi-form-field>
    </form>

    <mimi-form-field data-test="own-label">
      <label>Comentario <span>(opcional)</span></label>
      <textarea mimiTextarea [formField]="signalForm.bio"></textarea>
    </mimi-form-field>

    <mimi-form-field data-test="signal" label="Contraseña">
      <input mimiInput type="password" [formField]="signalForm.password" />
    </mimi-form-field>

    <mimi-form-field data-test="ng-model" label="Usuario">
      <input mimiInput name="user" required [(ngModel)]="user" />
    </mimi-form-field>

    <mimi-form-field data-test="custom" label="Alias">
      <input mimiInput [showError]="aliasTaken()" />
      <mimi-form-error>Ese usuario ya existe.</mimi-form-error>
    </mimi-form-field>
  `,
})
class Host {
  readonly extra = signal('');
  readonly group = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl('Ana', { nonNullable: true }),
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  readonly model = signal({ bio: '', password: '' });
  readonly signalForm = form(this.model, (p) => {
    required(p.bio, { message: 'Cuéntanos algo.' });
    minLength(p.password, 8);
    email(p.password);
  });
  readonly user = signal('');
  readonly aliasTaken = signal(false);
}

/** Las actualizaciones de ngModel y de los eventos llegan en microtareas. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
};

function type(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('MimiFormField', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const field = (id: string) =>
      root.querySelector<HTMLElement>(`mimi-form-field[data-test="${id}"]`)!;
    const error = (id: string) => field(id).querySelector<HTMLElement>('mimi-form-error')!;
    return { fixture, h: fixture.componentInstance, field, error };
  }

  it('label="…" dibuja la etiqueta enlazada al control, que recibe un id', async () => {
    const { field } = await setup();
    const label = field('reactive').querySelector('label')!;
    const input = field('reactive').querySelector('input')!;
    expect(input.id).toMatch(/^mimi-form-field-\d+-control$/);
    expect(label.getAttribute('for')).toBe(input.id);
    expect(label.textContent?.trim()).toBe('Correo');
    expect(label.classList).toContain('text-sm');
    expect(label.classList).toContain('font-medium');
    for (const cls of ['flex', 'flex-col', 'gap-1.5']) {
      expect(field('reactive').classList).toContain(cls);
    }
  });

  it('respeta el id y el aria-describedby que ya tenía el control', async () => {
    const { field, error } = await setup();
    const input = field('own-id').querySelector('input')!;
    expect(input.id).toBe('nombre');
    expect(field('own-id').querySelector('label')!.getAttribute('for')).toBe('nombre');
    expect(input.getAttribute('aria-describedby')).toBe(`nombre-ayuda ${error('own-id').id}`);
  });

  it('a un <label> propio sin for le asigna el id del control', async () => {
    const { field } = await setup();
    const label = field('own-label').querySelector(':scope > label')!;
    const textarea = field('own-label').querySelector('textarea')!;
    expect(textarea.id).not.toBe('');
    expect(label.getAttribute('for')).toBe(textarea.id);
  });

  it('el mensaje (aria-live) está siempre en el DOM: vacío sin error, solo cambia su contenido', async () => {
    const { fixture, h, field, error } = await setup();
    const container = error('reactive');
    const input = field('reactive').querySelector('input')!;
    expect(container.getAttribute('aria-live')).toBe('polite');
    expect(input.getAttribute('aria-describedby')).toBe(container.id);
    expect(container.textContent?.trim()).toBe('');
    expect(container.classList).toContain('sr-only');
    expect(container.querySelector('svg')).toBeNull();
    expect(field('reactive').hasAttribute('data-invalid')).toBe(false);

    h.group.controls.email.markAsTouched();
    await settle(fixture);
    expect(error('reactive')).toBe(container);
    expect(container.textContent?.trim()).toBe('This field is required.');
    expect(container.classList).not.toContain('sr-only');
    for (const cls of ['flex', 'items-center', 'gap-1.5', 'text-[13px]', 'text-destructive']) {
      expect(container.classList).toContain(cls);
    }
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    // Con error, el host lo marca y la etiqueta se pone roja.
    expect(field('reactive').hasAttribute('data-invalid')).toBe(true);
    expect(field('reactive').classList).toContain('[&[data-invalid]>label]:text-destructive');

    type(input, 'ana@');
    await settle(fixture);
    expect(container.textContent?.trim()).toBe('Enter a valid email address.');

    type(input, 'ana@correo.com');
    await settle(fixture);
    expect(error('reactive')).toBe(container);
    expect(container.textContent?.trim()).toBe('');
    expect(container.classList).toContain('sr-only');
  });

  it('Signal Forms: usa el message del esquema o el mapa, con minLength normalizado', async () => {
    const { fixture, field, error } = await setup();
    const textarea = field('own-label').querySelector('textarea')!;
    textarea.dispatchEvent(new Event('blur'));
    await settle(fixture);
    expect(error('own-label').textContent?.trim()).toBe('Cuéntanos algo.');

    const password = field('signal').querySelector('input')!;
    type(password, 'abc12');
    await settle(fixture);
    expect(error('signal').textContent?.trim()).toBe('Use at least 8 characters.');
  });

  it('ngModel: mensaje de required', async () => {
    const { fixture, field, error } = await setup();
    const input = field('ng-model').querySelector('input')!;
    type(input, 'a');
    type(input, '');
    await settle(fixture);
    expect(error('ng-model').textContent?.trim()).toBe('This field is required.');
  });

  it('mimi-form-error propio reemplaza al automático y usa su texto', async () => {
    const { fixture, h, field, error } = await setup();
    expect(field('custom').querySelectorAll('mimi-form-error').length).toBe(1);
    expect(error('custom').textContent?.trim()).toBe('');
    h.aliasTaken.set(true);
    await settle(fixture);
    expect(error('custom').textContent?.trim()).toBe('Ese usuario ya existe.');
    expect(field('custom').querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('con Checkbox: el mensaje queda en el aria-describedby del botón', async () => {
    const { fixture, h, field, error } = await setup();
    const button = field('checkbox').querySelector('button')!;
    expect(button.getAttribute('aria-describedby')).toBe(error('checkbox').id);
    h.group.controls.terms.markAsTouched();
    await settle(fixture);
    expect(error('checkbox').textContent?.trim()).toBe('This field is required.');
  });

  it('marca data-disabled con el control deshabilitado', async () => {
    const { fixture, h, field } = await setup();
    expect(field('reactive').hasAttribute('data-disabled')).toBe(false);
    h.group.controls.email.disable();
    await settle(fixture);
    expect(field('reactive').hasAttribute('data-disabled')).toBe(true);
  });

  it('la clase del usuario gana', async () => {
    const { fixture, h, field } = await setup();
    h.extra.set('gap-3 flex-row');
    await settle(fixture);
    expect(field('reactive').classList).toContain('gap-3');
    expect(field('reactive').classList).toContain('flex-row');
    expect(field('reactive').classList).not.toContain('gap-1.5');
    expect(field('reactive').classList).not.toContain('flex-col');
  });
});

describe('Mensajes de error', () => {
  it('sin provider se usan los mensajes en inglés', () => {
    expect(TestBed.inject(MIMI_ERROR_MESSAGES)).toBe(MIMI_ERROR_MESSAGES_EN);
  });

  it('provideMimiErrorMessages mezcla con el inglés y normaliza las claves', () => {
    TestBed.configureTestingModule({
      providers: [provideMimiErrorMessages({ required: 'Obligatorio.', minLength: 'Corto.' })],
    });
    const messages = TestBed.inject(MIMI_ERROR_MESSAGES);
    expect(messages['required']).toBe('Obligatorio.');
    expect(messages['minlength']).toBe('Corto.');
    expect(messages['email']).toBe(MIMI_ERROR_MESSAGES_EN['email']);
  });

  it('MIMI_ERROR_MESSAGES_ES trae los textos en español', async () => {
    TestBed.configureTestingModule({
      providers: [provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)],
    });
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const field = root.querySelector('mimi-form-field[data-test="signal"]')!;
    type(field.querySelector('input')!, 'abc12');
    await settle(fixture);
    expect(field.querySelector('mimi-form-error')!.textContent?.trim()).toBe(
      'Usa al menos 8 caracteres.',
    );
    fixture.componentInstance.group.controls.email.markAsTouched();
    await settle(fixture);
    expect(
      root
        .querySelector('mimi-form-field[data-test="reactive"] mimi-form-error')!
        .textContent?.trim(),
    ).toBe('Este campo es obligatorio.');
  });
});
