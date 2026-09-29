import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { MimiTextarea } from '@/components/ui/textarea';

@Component({
  selector: 'app-form-field-register-example',
  imports: [
    ReactiveFormsModule,
    MimiCardImports,
    MimiButton,
    MimiCheckbox,
    MimiFormField,
    MimiInput,
    MimiTextarea,
  ],
  template: `
    <mimi-card class="w-full max-w-lg">
      <mimi-card-header>
        <mimi-card-title>Crea tu cuenta</mimi-card-title>
        <mimi-card-description>Tarda menos de un minuto.</mimi-card-description>
      </mimi-card-header>
      <form [formGroup]="form" (ngSubmit)="form.markAllAsTouched()">
        <mimi-card-content class="flex flex-col gap-4.5">
          <mimi-form-field label="Nombre">
            <input mimiInput autocomplete="name" formControlName="name" />
          </mimi-form-field>
          <div class="grid gap-4 sm:grid-cols-2">
            <mimi-form-field label="Correo">
              <input mimiInput type="email" autocomplete="email" formControlName="email" />
            </mimi-form-field>
            <mimi-form-field label="Contraseña">
              <input
                mimiInput
                type="password"
                autocomplete="new-password"
                formControlName="password"
              />
            </mimi-form-field>
          </div>
          <mimi-form-field>
            <label class="text-sm font-medium">
              Comentario <span class="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              mimiTextarea
              rows="3"
              placeholder="¿Cómo nos conociste?"
              formControlName="comment"
            ></textarea>
          </mimi-form-field>
          <mimi-form-field>
            <mimi-checkbox formControlName="terms">
              Acepto los términos y la política de privacidad
            </mimi-checkbox>
          </mimi-form-field>
        </mimi-card-content>
        <mimi-card-footer>
          <button mimiBtn type="submit" class="w-full">Crear cuenta</button>
        </mimi-card-footer>
      </form>
    </mimi-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldRegisterExample {
  protected readonly form = new FormGroup({
    name: new FormControl('Ana Torres', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    comment: new FormControl('', { nonNullable: true }),
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
}
