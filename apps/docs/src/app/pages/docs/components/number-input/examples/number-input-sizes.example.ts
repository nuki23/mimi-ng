import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiNumberInput } from '@/components/ui/number-input';

@Component({
  selector: 'app-number-input-sizes-example',
  imports: [MimiNumberInput],
  template: `
    <div class="flex w-48 max-w-full flex-col gap-3">
      <mimi-number-input size="sm" aria-label="Cantidad (sm)" [value]="2" [min]="0" />
      <mimi-number-input aria-label="Cantidad (md)" [value]="2" [min]="0" />
      <mimi-number-input size="lg" aria-label="Cantidad (lg)" [value]="2" [min]="0" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputSizesExample {}
