import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-form-field-basic-example',
  imports: [ReactiveFormsModule, MimiFormField, MimiInput, MimiButton],
  template: `
    <form class="flex w-80 flex-col gap-4" [formGroup]="form" (ngSubmit)="form.markAllAsTouched()">
      <mimi-form-field label="Correo">
        <input mimiInput type="email" formControlName="email" placeholder="tu@correo.com" />
      </mimi-form-field>
      <button mimiBtn type="submit">Suscribirme</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldBasicExample {
  protected readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
}
