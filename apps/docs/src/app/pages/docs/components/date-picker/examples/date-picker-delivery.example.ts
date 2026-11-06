import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiDate, mimiWeekday, toMimiDate } from '@/components/ui/calendar';
import { MimiDatePicker } from '@/components/ui/date-picker';

@Component({
  selector: 'app-date-picker-delivery-example',
  imports: [MimiDatePicker],
  template: `
    <div class="flex w-full max-w-[300px] flex-col gap-1.5">
      <label for="delivery" class="text-sm font-medium">
        Fecha de entrega <span class="font-normal text-muted-foreground">· solo días hábiles</span>
      </label>
      <!-- Desde hoy y sin fines de semana. El valor es una fecha ISO: «2026-09-30». -->
      <mimi-date-picker
        id="delivery"
        locale="es"
        placeholder="Elige un día"
        [min]="today"
        [isDateDisabled]="weekend"
        [(value)]="date"
      />
      <p class="text-[13px] text-muted-foreground">Valor: {{ date() ?? 'null' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerDeliveryExample {
  protected readonly today = toMimiDate(new Date());
  protected readonly date = signal<MimiDate | null>(null);
  /** Sábado (6) y domingo (7) no se pueden elegir. */
  protected readonly weekend = (date: MimiDate) => mimiWeekday(date) > 5;
}
