import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSlider } from '@/components/ui/slider';

@Component({
  selector: 'app-slider-states-example',
  imports: [MimiSlider],
  template: `
    <div class="grid w-full max-w-2xl gap-9 sm:grid-cols-3">
      <div class="flex flex-col gap-3">
        <span id="locked" class="text-sm font-medium">Deshabilitado</span>
        <mimi-slider aria-labelledby="locked" [value]="40" disabled />
      </div>
      <!-- Solo lectura: el pulgar se enfoca, pero no se mueve. -->
      <div class="flex flex-col gap-3">
        <span id="plan" class="text-sm font-medium">Uso del plan: 65%</span>
        <mimi-slider aria-labelledby="plan" readonly [value]="65" />
      </div>
      <!-- Con un formulario, invalid y touched los pasa Angular (ver «Formularios»). -->
      <div class="flex flex-col gap-3">
        <span id="error" class="text-sm font-medium">Con error</span>
        <mimi-slider aria-labelledby="error" [value]="20" invalid touched />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderStatesExample {}
