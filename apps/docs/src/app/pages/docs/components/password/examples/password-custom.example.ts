import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInput } from '@/components/ui/input';
import { type MimiPasswordRule, MimiPassword } from '@/components/ui/password';

@Component({
  selector: 'app-password-custom-example',
  imports: [MimiPassword, MimiInput],
  template: `
    <!-- class va a la caja; reglas propias para el medidor. -->
    <mimi-password class="w-full max-w-sm rounded-full" meter [rules]="rules">
      <input mimiInput type="password" autocomplete="new-password" aria-label="Clave del equipo" />
    </mimi-password>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordCustomExample {
  protected readonly rules: MimiPasswordRule[] = [
    { label: '12 caracteres o más', test: (v) => v.length >= 12 },
    { label: 'Sin espacios', test: (v) => v.length > 0 && !/\s/.test(v) },
  ];
}
