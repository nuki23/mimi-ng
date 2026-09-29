import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, form, minLength, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-form-field-signal-forms-example',
  imports: [FormField, MimiFormField, MimiInput],
  template: `
    <div class="flex w-80 flex-col gap-4">
      <!-- El mensaje sale del esquema de validación. -->
      <mimi-form-field label="Usuario">
        <input mimiInput [formField]="signup.user" />
      </mimi-form-field>
      <!-- Sin mensaje en el esquema: se usa el de provideMimiErrorMessages. -->
      <mimi-form-field label="Contraseña">
        <input mimiInput type="password" [formField]="signup.password" />
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldSignalFormsExample {
  protected readonly model = signal({ user: '', password: '' });
  protected readonly signup = form(this.model, (path) => {
    required(path.user, { message: 'Elige un nombre de usuario.' });
    required(path.password);
    minLength(path.password, 8);
  });
}
