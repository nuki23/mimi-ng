import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiColorInput } from '@/components/ui/color-picker';

@Component({
  selector: 'app-color-picker-states-example',
  imports: [MimiColorInput],
  template: `
    <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
      <mimi-color-input aria-label="Deshabilitado" value="#4f46e5" disabled />
      <!-- Solo lectura: se lee y se enfoca, pero no abre el panel. -->
      <mimi-color-input aria-label="Solo lectura" value="#793eea" readonly />
      <!-- Con un formulario, invalid y touched los pasa Angular (ver «Formularios»). -->
      <mimi-color-input aria-label="Con error" placeholder="Sin color" invalid touched />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerStatesExample {}
