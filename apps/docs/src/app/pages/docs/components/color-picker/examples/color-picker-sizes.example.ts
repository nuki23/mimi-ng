import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiColorInput } from '@/components/ui/color-picker';

@Component({
  selector: 'app-color-picker-sizes-example',
  imports: [MimiColorInput],
  template: `
    <div class="flex w-72 max-w-full flex-col gap-3">
      <mimi-color-input size="sm" aria-label="Color pequeño (sm)" [(value)]="color" />
      <mimi-color-input aria-label="Color normal (md)" [(value)]="color" />
      <mimi-color-input size="lg" aria-label="Color grande (lg)" [(value)]="color" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerSizesExample {
  protected readonly color = signal('#4f46e5');
}
