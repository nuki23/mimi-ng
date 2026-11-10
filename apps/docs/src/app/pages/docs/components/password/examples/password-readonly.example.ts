import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInput } from '@/components/ui/input';
import { MimiPassword } from '@/components/ui/password';

@Component({
  selector: 'app-password-readonly-example',
  imports: [MimiPassword, MimiInput],
  template: `
    <div class="w-full max-w-sm">
      <mimi-password readonly>
        <input mimiInput type="password" aria-label="Clave guardada" value="clave-guardada" />
      </mimi-password>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordReadonlyExample {}
