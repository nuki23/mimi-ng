import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type MimiDateRange } from '@/components/ui/calendar';
import { MimiDateRangePicker } from '@/components/ui/date-range';

@Component({
  selector: 'app-date-range-sizes-example',
  imports: [MimiDateRangePicker],
  template: `
    <div class="flex w-80 max-w-full flex-col gap-3">
      <mimi-date-range-picker size="sm" aria-label="Viaje (sm)" locale="es" [value]="trip" />
      <mimi-date-range-picker aria-label="Viaje (md)" locale="es" [value]="trip" />
      <mimi-date-range-picker size="lg" aria-label="Viaje (lg)" locale="es" [value]="trip" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeSizesExample {
  protected readonly trip: MimiDateRange = { start: '2026-10-05', end: '2026-10-11' };
}
