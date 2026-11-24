import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiDateRange } from '@/components/ui/calendar';
import { type MimiDateRangePreset, MimiDateRangePicker } from '@/components/ui/date-range';

@Component({
  selector: 'app-date-range-phone-example',
  imports: [MimiDateRangePicker],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <!-- Debajo de 640 px es lo de siempre; presentation="sheet" lo pide también aquí. -->
      <!-- Los atajos van en una fila encima del calendario. -->
      <mimi-date-range
        aria-label="Fechas del viaje"
        locale="es"
        presentation="sheet"
        placeholder="Elige el periodo"
        [presets]="presets"
        [(value)]="trip"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePhoneExample {
  protected readonly trip = signal<MimiDateRange | null>(null);
  protected readonly presets: MimiDateRangePreset[] = [
    { label: 'Este fin de semana', range: { start: '2026-11-21', end: '2026-11-22' } },
    { label: 'Puente de diciembre', range: { start: '2026-12-05', end: '2026-12-08' } },
    { label: 'Navidad', range: { start: '2026-12-24', end: '2026-12-27' } },
  ];
}
