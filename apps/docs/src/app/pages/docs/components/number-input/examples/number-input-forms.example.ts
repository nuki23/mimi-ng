import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, max, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiNumberInput } from '@/components/ui/number-input';

@Component({
  selector: 'app-number-input-forms-example',
  imports: [MimiNumberInput, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-3">
      <!-- Signal Forms: requerido y máximo 10 en el esquema. -->
      <mimi-form-field label="Asientos (Signal Forms)">
        <mimi-number-input [formField]="booking.seats" />
      </mimi-form-field>

      <!-- Reactive Forms: el error aparece al salir del campo. -->
      <mimi-form-field label="Invitados (Reactive)">
        <mimi-number-input [formControl]="guests" />
      </mimi-form-field>

      <mimi-form-field label="Noches (ngModel)">
        <mimi-number-input name="nights" [min]="1" [(ngModel)]="nights" />
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputFormsExample {
  protected readonly data = signal<{ seats: number | null }>({ seats: 12 });
  protected readonly booking = form(this.data, (p) => {
    required(p.seats);
    max(p.seats, 10);
  });
  protected readonly guests = new FormControl<number | null>(null, [
    Validators.required,
    Validators.max(10),
  ]);
  protected nights: number | null = 2;
}
