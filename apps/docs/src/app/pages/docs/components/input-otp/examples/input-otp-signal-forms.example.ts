import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { MimiButton } from '@/components/ui/button';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInputOtp } from '@/components/ui/input-otp';

@Component({
  selector: 'app-input-otp-signal-forms-example',
  imports: [MimiInputOtp, MimiFormField, MimiButton, FormField],
  template: `
    <form class="flex flex-col items-start gap-4" (submit)="verify($event)">
      <mimi-form-field label="Código de verificación">
        <mimi-input-otp [separatorAfter]="3" [formField]="login.code" />
      </mimi-form-field>
      <button mimiBtn type="submit">Verificar</button>
      <p class="font-mono text-[13px] text-muted-foreground">
        code: «{{ data().code }}» · válido: {{ login().valid() }}
      </p>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtpSignalFormsExample {
  protected readonly data = signal({ code: '' });
  protected readonly login = form(this.data, (p) => {
    required(p.code, { message: 'Escribe el código.' });
    minLength(p.code, 6, { message: 'El código tiene 6 dígitos.' });
  });

  protected verify(event: Event): void {
    event.preventDefault();
    this.login.code().markAsTouched();
  }
}
