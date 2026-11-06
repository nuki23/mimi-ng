import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInputMask } from '@/components/ui/input-mask';

/** Del ejemplo, no de Mimi: la fecha DDMMAAAA existe (31/02 no). */
function realDate(digits: string): boolean {
  if (digits.length !== 8) return true;
  const [d, m, y] = [+digits.slice(0, 2), +digits.slice(2, 4), +digits.slice(4)];
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function realDateValidator(control: AbstractControl<string>): ValidationErrors | null {
  return realDate(control.value ?? '') ? null : { date: true };
}

@Component({
  selector: 'app-input-mask-forms-example',
  imports: [MimiInputMask, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-3">
      <!-- Signal Forms: una máscara incompleta deja el campo inválido sola. -->
      <mimi-form-field label="Teléfono (Signal Forms)">
        <mimi-input-mask
          mask="(00) 0000 0000"
          autocomplete="tel-national"
          [formField]="contact.phone"
        />
      </mimi-form-field>

      <!-- Reactive Forms: la longitud y la fecha, con validadores tuyos. -->
      <mimi-form-field label="Entrega (Reactive)">
        <mimi-input-mask mask="00/00/0000" [formControl]="delivery" />
        @if (delivery.hasError('date') && delivery.touched) {
          <p class="text-xs text-destructive-soft-foreground">31/02 no existe.</p>
        }
      </mimi-form-field>

      <mimi-form-field label="Código postal (ngModel)">
        <mimi-input-mask mask="00000" name="zip" autocomplete="postal-code" [(ngModel)]="zip" />
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskFormsExample {
  protected readonly data = signal({ phone: '55123' });
  protected readonly contact = form(this.data, (p) => required(p.phone));
  protected readonly delivery = new FormControl('31022026', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(8), realDateValidator],
  });
  protected zip = '06700';
}
