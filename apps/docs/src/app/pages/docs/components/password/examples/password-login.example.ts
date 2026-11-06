import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MimiInput } from '@/components/ui/input';
import { MimiPassword } from '@/components/ui/password';

@Component({
  selector: 'app-password-login-example',
  imports: [MimiPassword, MimiInput, FormsModule],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-2">
      <label for="login-password" class="text-sm font-medium">Contraseña</label>
      <!-- Inicio de sesión: sin medidor y con current-password (ngModel). -->
      <mimi-password>
        <input
          mimiInput
          id="login-password"
          type="password"
          name="password"
          autocomplete="current-password"
          [(ngModel)]="password"
        />
      </mimi-password>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordLoginExample {
  protected password = '';
}
