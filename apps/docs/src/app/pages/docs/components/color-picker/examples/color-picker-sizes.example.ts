import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiColorInput } from '@/components/ui/color-picker';
import { MimiSizeScope } from '@/components/ui/utils/size';

@Component({
  selector: 'app-color-picker-sizes-example',
  imports: [MimiColorInput, MimiSizeScope],
  template: `
    <!-- El disparador toma el tamaño del contenedor con mimiSize. -->
    <div class="flex w-72 max-w-full flex-col gap-3">
      <div mimiSize="sm">
        <mimi-color-input aria-label="Color pequeño (sm)" [(value)]="color" />
      </div>
      <mimi-color-input aria-label="Color normal (md)" [(value)]="color" />
      <div mimiSize="lg">
        <mimi-color-input aria-label="Color grande (lg)" [(value)]="color" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerSizesExample {
  protected readonly color = signal('#4f46e5');
}
