import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  type MimiDate,
  MIMI_CALENDAR_TEXT_EN,
  provideMimiCalendarText,
} from '@/components/ui/calendar';
import { MimiDatePicker } from '@/components/ui/date-picker';

@Component({
  selector: 'app-date-picker-locale-example',
  imports: [MimiDatePicker],
  // Los textos de los botones, en inglés; los meses y los días salen del idioma.
  providers: [provideMimiCalendarText(MIMI_CALENDAR_TEXT_EN)],
  template: `
    <div class="flex w-full max-w-[300px] flex-col gap-1.5">
      <label for="due" class="text-sm font-medium">Due date (en-US)</label>
      <!-- En inglés de EE. UU. la semana empieza el domingo; format cambia el texto del botón. -->
      <mimi-date-picker
        id="due"
        locale="en-US"
        minDate="2026-01-01"
        maxDate="2027-12-31"
        [format]="{ weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }"
        [(value)]="date"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerLocaleExample {
  protected readonly date = signal<MimiDate | null>('2026-09-30');
}
