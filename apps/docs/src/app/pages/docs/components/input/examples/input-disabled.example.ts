import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-disabled-example',
  imports: [MimiInput],
  template: `
    <div class="grid w-full max-w-lg gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <label for="plan" class="text-sm font-medium">Plan</label>
        <input mimiInput id="plan" value="Equipo" disabled />
      </div>
      <!-- Solo lectura: se enfoca y se copia, pero no se edita. -->
      <div class="flex flex-col gap-1.5">
        <label for="account" class="text-sm font-medium">Cuenta</label>
        <input mimiInput id="account" value="ACME-2041" readonly />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDisabledExample {}
