import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSlider } from '@/components/ui/slider';

@Component({
  selector: 'app-slider-sizes-example',
  imports: [MimiSlider],
  template: `
    <div class="flex w-72 max-w-full flex-col gap-8">
      <mimi-slider aria-label="Brillo (sm)" size="sm" [value]="30" />
      <mimi-slider aria-label="Brillo (md)" size="md" [value]="55" />
      <mimi-slider aria-label="Brillo (lg)" size="lg" [value]="80" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderSizesExample {}
