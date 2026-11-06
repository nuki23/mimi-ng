import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { type MimiDateRange, mimiDaysBetween } from '@/components/ui/calendar';
import { MimiDateRangePicker } from '@/components/ui/date-range';
import { MimiFormField } from '@/components/ui/form-field';

@Component({
  selector: 'app-date-range-forms-example',
  imports: [MimiDateRangePicker, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <!-- La regla de la duración es del formulario. -->
      <mimi-form-field label="Vacaciones (Signal Forms, hasta 14 días)">
        <mimi-date-range locale="es" placeholder="Elige un periodo" [formField]="trip.dates" />
      </mimi-form-field>
      <mimi-form-field label="Campaña (Reactive)">
        <mimi-date-range locale="es" placeholder="Elige un periodo" [formControl]="campaign" />
      </mimi-form-field>
      <mimi-form-field label="Reserva (ngModel)">
        <mimi-date-range locale="es" name="booking" [(ngModel)]="booking" />
      </mimi-form-field>
      <mimi-form-field label="Deshabilitado">
        <mimi-date-range locale="es" [value]="booking" disabled />
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeFormsExample {
  protected readonly data = signal({
    dates: { start: '2026-09-01', end: '2026-09-20' } as MimiDateRange | null,
  });
  protected readonly trip = form(this.data, (p) => {
    required(p.dates);
    validate(p.dates, ({ value }) => {
      const range = value();
      return range && mimiDaysBetween(range.start, range.end) > 14
        ? { kind: 'tooLong', message: 'Hasta 14 días.' }
        : null;
    });
  });
  protected readonly campaign = new FormControl<MimiDateRange | null>(null, Validators.required);
  protected booking: MimiDateRange | null = { start: '2026-10-02', end: '2026-10-05' };
}
