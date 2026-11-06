import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSlider, type MimiSliderValue } from '@/components/ui/slider';

@Component({
  selector: 'app-slider-basic-example',
  imports: [MimiSlider],
  template: `
    <div class="grid w-full max-w-2xl gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-3">
        <div class="flex justify-between text-sm">
          <span id="volume" class="font-medium">Volumen</span>
          <span class="text-muted-foreground tabular-nums">{{ volume() }}%</span>
        </div>
        <mimi-slider aria-labelledby="volume" [format]="percent" [(value)]="volume" />
      </div>
      <div class="flex flex-col gap-3">
        <div class="flex justify-between text-sm">
          <span id="opacity" class="font-medium">Opacidad · burbuja fija</span>
        </div>
        <mimi-slider
          aria-labelledby="opacity"
          showValue="always"
          [format]="percent"
          [(value)]="opacity"
        />
      </div>
      <div class="flex flex-col gap-3">
        <span id="locked" class="text-sm font-medium">Deshabilitado</span>
        <mimi-slider aria-labelledby="locked" [value]="40" disabled />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderBasicExample {
  protected readonly volume = signal<MimiSliderValue>(60);
  protected readonly opacity = signal<MimiSliderValue>(80);
  protected readonly percent = (v: number) => `${v}%`;
}
