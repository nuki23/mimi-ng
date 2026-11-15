import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiDatePicker } from '@/components/ui/date-picker';

@Component({
  selector: 'app-date-picker-sizes-example',
  imports: [MimiDatePicker],
  template: `
    <div class="flex w-64 max-w-full flex-col gap-3">
      <mimi-date-picker size="sm" aria-label="Entrega (sm)" locale="es" value="2026-09-30" />
      <mimi-date-picker aria-label="Entrega (md)" locale="es" value="2026-09-30" />
      <mimi-date-picker size="lg" aria-label="Entrega (lg)" locale="es" value="2026-09-30" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerSizesExample {}
