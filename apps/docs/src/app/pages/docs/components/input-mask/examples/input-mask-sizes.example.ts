import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInputMask } from '@/components/ui/input-mask';

@Component({
  selector: 'app-input-mask-sizes-example',
  imports: [MimiInputMask],
  template: `
    <div class="flex w-64 max-w-full flex-col gap-3">
      <mimi-input-mask
        size="sm"
        aria-label="Teléfono (sm)"
        mask="(00) 0000 0000"
        value="5512345678"
      />
      <mimi-input-mask aria-label="Teléfono (md)" mask="(00) 0000 0000" value="5512345678" />
      <mimi-input-mask
        size="lg"
        aria-label="Teléfono (lg)"
        mask="(00) 0000 0000"
        value="5512345678"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskSizesExample {}
