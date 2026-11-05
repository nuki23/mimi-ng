import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInputOtp } from '@/components/ui/input-otp';

@Component({
  selector: 'app-input-otp-forms-example',
  imports: [MimiInputOtp, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="flex flex-col gap-5">
      <mimi-form-field label="Signal Forms">
        <mimi-input-otp [separatorAfter]="3" [formField]="login.code" />
      </mimi-form-field>
      <mimi-form-field label="Reactive Forms">
        <mimi-input-otp [separatorAfter]="3" [formControl]="code" />
      </mimi-form-field>
      <!-- Alfanumérico: letras y dígitos; class va a la fila. -->
      <mimi-form-field label="Clave de invitación (ngModel)">
        <mimi-input-otp
          alphanumeric
          [length]="5"
          class="gap-1"
          name="invite"
          [(ngModel)]="invite"
        />
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtpFormsExample {
  protected readonly data = signal({ code: '' });
  protected readonly login = form(this.data, (p) => {
    required(p.code);
    minLength(p.code, 6);
  });
  protected readonly code = new FormControl('', [Validators.required, Validators.minLength(6)]);
  protected invite = '';
}
