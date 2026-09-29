import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-signal-forms-example',
  imports: [FormField, MimiFormField, MimiInput],
  template: `
    <mimi-form-field label="Correo" class="w-80">
      <input mimiInput type="email" placeholder="tu@correo.com" [formField]="profileForm.email" />
    </mimi-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSignalFormsExample {
  protected readonly profile = signal({ email: '' });
  protected readonly profileForm = form(this.profile, (path) => {
    required(path.email);
    email(path.email);
  });
}
