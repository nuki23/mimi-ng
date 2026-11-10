import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiFormFieldImports } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { MimiSelect } from '@/components/ui/select';
import { MimiTextarea } from '@/components/ui/textarea';

/**
 * R.24, principio «uso corto por defecto, composición cuando la necesites» (spec 1): una pantalla
 * de «formulario de contacto» completa (Input, Select, Textarea, Checkbox y Button dentro de
 * Form Field, con ayuda, obligatorios y error) cabe en 12 líneas de plantilla. Si una API cambia
 * y esto deja de caber, se rediseña o se agrega un atajo.
 */
const CONTACT_FORM = `<form [formGroup]="form" (ngSubmit)="send()">
  <mimi-form-field label="Nombre" required><input mimiInput formControlName="name" /></mimi-form-field>
  <mimi-form-field label="Correo" required hint="Sin spam."><input mimiInput type="email" formControlName="email" /></mimi-form-field>
  <mimi-form-field label="Tema"><mimi-select formControlName="topic" [options]="topics" /></mimi-form-field>
  <mimi-form-field label="Mensaje"><textarea mimiTextarea formControlName="message"></textarea></mimi-form-field>
  <mimi-form-field><mimi-checkbox formControlName="terms">Acepto los términos</mimi-checkbox></mimi-form-field>
  <button mimiBtn type="submit">Enviar</button>
</form>`;

@Component({
  imports: [
    ReactiveFormsModule,
    MimiFormFieldImports,
    MimiInput,
    MimiSelect,
    MimiTextarea,
    MimiCheckbox,
    MimiButton,
  ],
  template: CONTACT_FORM,
})
class Host {
  readonly topics = [
    { label: 'Ventas', value: 'sales' },
    { label: 'Soporte', value: 'support' },
  ];
  readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    topic: new FormControl<string | null>(null),
    message: new FormControl(''),
    terms: new FormControl(false, Validators.requiredTrue),
  });
  send(): void {
    this.form.markAllAsTouched();
  }
}

describe('uso corto (R.24)', () => {
  it('el formulario de contacto completo cabe en 12 líneas de plantilla', () => {
    expect(CONTACT_FORM.split('\n').length).toBeLessThanOrEqual(12);
  });

  it('y funciona: cinco campos, dos obligatorios con asterisco, y los errores al enviar', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('mimi-form-field').length).toBe(5);
    expect(el.querySelectorAll('[data-slot="required"]').length).toBe(2);
    expect(el.querySelector('[data-slot="hint"]')!.textContent).toContain('Sin spam');
    el.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
    // Nombre, correo y términos están en error; tema y mensaje no.
    expect(el.querySelectorAll('mimi-form-field[data-invalid]').length).toBe(3);
  });
});
