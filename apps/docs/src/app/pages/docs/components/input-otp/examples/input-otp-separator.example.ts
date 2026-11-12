import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideDot } from '@lucide/angular';
import { MimiInputOtpImports } from '@/components/ui/input-otp';

@Component({
  selector: 'app-input-otp-separator-example',
  imports: [MimiInputOtpImports, LucideDot],
  template: `
    <div class="flex flex-col gap-5">
      <!-- Un carácter: separator="·" -->
      <mimi-input-otp
        aria-label="Código de 9 dígitos"
        [length]="9"
        [separatorAfter]="[3, 6]"
        separator="·"
      />
      <!-- Contenido propio (un ícono): se repite en cada separación. -->
      <mimi-input-otp aria-label="Código de 8 dígitos" [length]="8" [separatorAfter]="4">
        <ng-template mimiInputOtpSeparator><svg lucideDot></svg></ng-template>
      </mimi-input-otp>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtpSeparatorExample {}
