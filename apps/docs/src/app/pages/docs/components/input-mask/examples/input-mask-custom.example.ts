import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInputMask } from '@/components/ui/input-mask';

@Component({
  selector: 'app-input-mask-custom-example',
  imports: [MimiInputMask],
  template: `
    <!-- class va a la caja: más angosta y redonda. -->
    <mimi-input-mask
      aria-label="Código"
      mask="000-000"
      class="max-w-48 rounded-full"
      value="482913"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskCustomExample {}
