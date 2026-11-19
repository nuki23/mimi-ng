import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiDate } from '@/components/ui/calendar';
import { MimiDatePicker } from '@/components/ui/date-picker';

@Component({
  selector: 'app-date-picker-phone-example',
  imports: [MimiDatePicker],
  template: `
    <div class="flex w-full max-w-[300px] flex-col gap-1.5">
      <!-- Debajo de 640 px es lo de siempre; presentation="sheet" la pide también aquí. -->
      <!-- El aria-label es también el título de la hoja. -->
      <mimi-date-picker
        aria-label="Fecha de la cita"
        locale="es"
        presentation="sheet"
        placeholder="Elige un día"
        [(value)]="date"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerPhoneExample {
  protected readonly date = signal<MimiDate | null>(null);
}
