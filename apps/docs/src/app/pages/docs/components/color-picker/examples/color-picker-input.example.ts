import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiColorInput } from '@/components/ui/color-picker';

@Component({
  selector: 'app-color-picker-input-example',
  imports: [MimiColorInput],
  template: `
    <div class="grid w-full max-w-xl gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <label for="brand" class="text-sm font-medium">Color de marca (con paleta)</label>
        <mimi-color-input id="brand" [swatches]="palette" [(value)]="brand" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="accent" class="text-sm font-medium">Acento (OKLCH, sin paleta)</label>
        <mimi-color-input id="accent" format="oklch" [(value)]="accent" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerInputExample {
  protected readonly palette = ['#111827', '#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];
  protected readonly brand = signal('#4f46e5');
  protected readonly accent = signal('#0ea5e9');
}
