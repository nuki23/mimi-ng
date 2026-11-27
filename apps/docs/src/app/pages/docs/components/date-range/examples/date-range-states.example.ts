import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type MimiDateRange } from '@/components/ui/calendar';
import { MimiDateRangePicker } from '@/components/ui/date-range';

@Component({
  selector: 'app-date-range-states-example',
  imports: [MimiDateRangePicker],
  template: `
    <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <mimi-date-range-picker aria-label="Deshabilitado" locale="es" [value]="trip" disabled />
      <!-- Solo lectura: se lee y se enfoca, pero no abre el calendario. -->
      <mimi-date-range-picker aria-label="Solo lectura" locale="es" [value]="trip" readonly />
      <!-- Con un formulario, invalid y touched los pasa Angular (ver «Formularios»). -->
      <mimi-date-range-picker
        aria-label="Con error"
        locale="es"
        placeholder="Elige un periodo"
        invalid
        touched
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeStatesExample {
  protected readonly trip: MimiDateRange = { start: '2026-09-01', end: '2026-09-20' };
}
