import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiDatePicker } from '@/components/ui/date-picker';

@Component({
  selector: 'app-date-picker-states-example',
  imports: [MimiDatePicker],
  template: `
    <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
      <mimi-date-picker aria-label="Deshabilitado" locale="es" value="2026-09-30" disabled />
      <!-- Solo lectura: se lee y se enfoca, pero no abre el calendario. -->
      <mimi-date-picker aria-label="Solo lectura" locale="es" value="2026-09-30" readonly />
      <!-- Con un formulario, invalid y touched los pasa Angular (ver «Formularios»). -->
      <mimi-date-picker
        aria-label="Con error"
        locale="es"
        placeholder="Elige un día"
        invalid
        touched
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerStatesExample {}
