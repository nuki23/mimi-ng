import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiColorInput } from '@/components/ui/color-picker';

@Component({
  selector: 'app-color-picker-phone-example',
  imports: [MimiColorInput],
  template: `
    <div class="flex w-full max-w-[300px] flex-col gap-1.5">
      <!-- Debajo de 640 px es lo de siempre; presentation="sheet" la pide también aquí. -->
      <!-- El aria-label es también el título de la hoja. -->
      <mimi-color-input
        aria-label="Color de la etiqueta"
        presentation="sheet"
        [swatches]="palette"
        [(value)]="color"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerPhoneExample {
  protected readonly palette = ['#111827', '#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];
  protected readonly color = signal('#22c55e');
}
