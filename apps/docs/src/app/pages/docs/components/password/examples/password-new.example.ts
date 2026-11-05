import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { MimiInput } from '@/components/ui/input';
import { MimiPassword } from '@/components/ui/password';

@Component({
  selector: 'app-password-new-example',
  imports: [MimiPassword, MimiInput, FormField],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-2">
      <label for="new-password" class="text-sm font-medium">Contraseña nueva</label>
      <!-- meter: el medidor y las reglas. El input y su formulario son tuyos (Signal Forms). -->
      <mimi-password meter>
        <input
          mimiInput
          id="new-password"
          type="password"
          autocomplete="new-password"
          placeholder="Al menos 8 caracteres"
          [formField]="account.password"
        />
      </mimi-password>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordNewExample {
  protected readonly data = signal({ password: '' });
  protected readonly account = form(this.data, (p) => required(p.password));
}
