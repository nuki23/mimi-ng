import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiColorInput } from '@/components/ui/color-picker';

@Component({
  selector: 'app-color-picker-readonly-example',
  imports: [MimiColorInput],
  template: `
    <div class="w-full max-w-xs">
      <mimi-color-input aria-label="Color de marca" readonly value="#793eea" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerReadonlyExample {}
