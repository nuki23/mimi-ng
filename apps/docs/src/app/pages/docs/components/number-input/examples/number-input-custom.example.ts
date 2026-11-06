import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiNumberInput } from '@/components/ui/number-input';

@Component({
  selector: 'app-number-input-custom-example',
  imports: [MimiNumberInput],
  template: `
    <!-- class gana: una caja más angosta y alta, con esquinas redondas. -->
    <mimi-number-input
      aria-label="Porcentaje de descuento"
      class="h-12 w-40 rounded-full"
      [(value)]="discount"
      [min]="0"
      [max]="1"
      [step]="0.05"
      [format]="{ style: 'percent' }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputCustomExample {
  protected readonly discount = signal<number | null>(0.15);
}
