import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { type MimiDate, mimiWeekday } from '@/components/ui/calendar';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiFormField } from '@/components/ui/form-field';

@Component({
  selector: 'app-date-picker-forms-example',
  imports: [MimiDatePicker, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <!-- La regla «día hábil» es del formulario: un sábado que llega se muestra y es un error. -->
      <mimi-form-field label="Entrega (Signal Forms)">
        <mimi-date-picker locale="es" placeholder="Elige un día" [formField]="order.delivery" />
      </mimi-form-field>
      <mimi-form-field label="Inicio (Reactive)">
        <mimi-date-picker locale="es" placeholder="Elige un día" [formControl]="start" />
      </mimi-form-field>
      <mimi-form-field label="Cumpleaños (ngModel)">
        <mimi-date-picker locale="es" name="birthday" [(ngModel)]="birthday" />
      </mimi-form-field>
      <mimi-form-field label="Deshabilitado">
        <mimi-date-picker locale="es" value="2026-09-30" disabled />
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerFormsExample {
  protected readonly data = signal({ delivery: '2026-09-26' as MimiDate | null });
  protected readonly order = form(this.data, (p) => {
    required(p.delivery);
    validate(p.delivery, ({ value }) => {
      const date = value();
      return date && mimiWeekday(date) > 5
        ? { kind: 'weekday', message: 'Debe ser un día hábil.' }
        : null;
    });
  });
  protected readonly start = new FormControl<MimiDate | null>(null, Validators.required);
  protected birthday: MimiDate | null = '1990-05-17';
}
