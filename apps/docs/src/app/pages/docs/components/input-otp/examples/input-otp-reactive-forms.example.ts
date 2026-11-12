import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInputOtp } from '@/components/ui/input-otp';

@Component({
  selector: 'app-input-otp-reactive-forms-example',
  imports: [MimiInputOtp, MimiFormField, MimiButton, ReactiveFormsModule],
  template: `
    <form
      class="flex flex-col items-start gap-4"
      [formGroup]="form"
      (ngSubmit)="form.markAllAsTouched()"
    >
      <mimi-form-field label="PIN de la tarjeta">
        <mimi-input-otp [length]="4" formControlName="pin" />
      </mimi-form-field>
      <button mimiBtn type="submit">Confirmar</button>
      <p class="font-mono text-[13px] text-muted-foreground">
        pin: «{{ form.value.pin }}» · válido: {{ form.valid }}
      </p>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtpReactiveFormsExample {
  protected readonly form = new FormGroup({
    pin: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
  });
}
