import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInput } from '@/components/ui/input';
import { MimiPassword } from '@/components/ui/password';

@Component({
  selector: 'app-password-sizes-example',
  imports: [MimiPassword, MimiInput],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-3">
      <mimi-password size="sm">
        <input mimiInput type="password" autocomplete="off" aria-label="Contraseña (sm)" />
      </mimi-password>
      <mimi-password size="md">
        <input mimiInput type="password" autocomplete="off" aria-label="Contraseña (md)" />
      </mimi-password>
      <mimi-password size="lg">
        <input mimiInput type="password" autocomplete="off" aria-label="Contraseña (lg)" />
      </mimi-password>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordSizesExample {}
