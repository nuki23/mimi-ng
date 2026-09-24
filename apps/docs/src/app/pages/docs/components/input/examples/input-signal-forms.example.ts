import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-signal-forms-example',
  imports: [FormField, MimiInput],
  template: `
    <div class="flex w-80 flex-col gap-1.5">
      <label for="signal-email" class="text-sm font-medium">Correo</label>
      <input
        mimiInput
        #emailInput="mimiInput"
        id="signal-email"
        type="email"
        placeholder="tu@correo.com"
        [formField]="profileForm.email"
      />
      @if (emailInput.fieldState.showError()) {
        <p class="text-[13px] text-destructive">Ingresa un correo válido.</p>
      }
    </div>
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
