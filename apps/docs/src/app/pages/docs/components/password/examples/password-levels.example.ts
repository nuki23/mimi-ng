import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInput } from '@/components/ui/input';
import { MimiPassword } from '@/components/ui/password';

@Component({
  selector: 'app-password-levels-example',
  imports: [MimiPassword, MimiInput],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-4">
      @for (sample of samples; track sample.label) {
        <mimi-password meter>
          <input
            mimiInput
            type="password"
            autocomplete="off"
            [attr.aria-label]="sample.label"
            [value]="sample.value"
          />
        </mimi-password>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordLevelsExample {
  protected readonly samples = [
    { label: 'Contraseña débil', value: 'hola' },
    { label: 'Contraseña media', value: 'Primavera24' },
    { label: 'Contraseña fuerte', value: 'C4fé-con-leche!' },
  ];
}
