import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSlider } from '@/components/ui/slider';

@Component({
  selector: 'app-slider-readonly-example',
  imports: [MimiSlider],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-3">
      <span id="plan" class="text-sm font-medium">Uso del plan: 65%</span>
      <mimi-slider aria-labelledby="plan" readonly [value]="65" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderReadonlyExample {}
