import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  type MimiDateRange,
  mimiAddDays,
  mimiAddMonths,
  mimiStartOfMonth,
  toMimiDate,
} from '@/components/ui/calendar';
import { type MimiDateRangePreset, MimiDateRangePicker } from '@/components/ui/date-range';

/** Los atajos del diseño. Dependen de qué es «hoy»: los arma la app. */
function presets(today: string): MimiDateRangePreset[] {
  const lastMonth = mimiAddMonths(mimiStartOfMonth(today), -1);
  return [
    { label: 'Hoy', range: { start: today, end: today } },
    { label: 'Ayer', range: { start: mimiAddDays(today, -1), end: mimiAddDays(today, -1) } },
    { label: 'Últimos 7 días', range: { start: mimiAddDays(today, -6), end: today } },
    { label: 'Últimos 30 días', range: { start: mimiAddDays(today, -29), end: today } },
    { label: 'Este mes', range: { start: mimiStartOfMonth(today), end: today } },
    {
      label: 'Mes pasado',
      range: { start: lastMonth, end: mimiAddDays(mimiStartOfMonth(today), -1) },
    },
  ];
}

@Component({
  selector: 'app-date-range-report-example',
  imports: [MimiDateRangePicker],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <label for="report" class="text-sm font-medium">
        Periodo del informe
        <span class="font-normal text-muted-foreground">· sin fechas futuras</span>
      </label>
      <mimi-date-range
        id="report"
        locale="es"
        placeholder="Elige un periodo"
        [maxDate]="today"
        [presets]="presets"
        [(value)]="range"
      />
      <p class="text-[13px] text-muted-foreground">
        Valor: {{ range() ? range()!.start + ' → ' + range()!.end : 'null' }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeReportExample {
  protected readonly today = toMimiDate(new Date());
  protected readonly presets = presets(this.today);
  protected readonly range = signal<MimiDateRange | null>(this.presets[2].range);
}
