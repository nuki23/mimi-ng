import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiDate, MimiCalendar } from '@/components/ui/calendar';

@Component({
  selector: 'app-date-picker-calendar-example',
  imports: [MimiCalendar],
  template: `
    <!-- El calendario suelto, sin panel: el mismo que usan el Date Picker y el Date Range. -->
    <div class="flex flex-col items-start gap-3">
      <mimi-calendar
        locale="es"
        class="rounded-[var(--mimi-radius)] border border-border p-3"
        [(value)]="date"
      />
      <p class="text-[13px] text-muted-foreground">Elegida: {{ date() ?? 'ninguna' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerCalendarExample {
  protected readonly date = signal<MimiDate | null>(null);
}
