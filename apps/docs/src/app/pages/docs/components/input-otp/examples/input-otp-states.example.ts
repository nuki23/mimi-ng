import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiInputOtp } from '@/components/ui/input-otp';

@Component({
  selector: 'app-input-otp-states-example',
  imports: [MimiInputOtp, ReactiveFormsModule],
  template: `
    <div class="grid gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-2">
        <span class="text-xs text-muted-foreground">Completo y verificado</span>
        <mimi-input-otp aria-label="Verificado" value="246810" [separatorAfter]="3" success />
      </div>
      <div class="flex flex-col gap-2">
        <!-- El error lo da el formulario (aquí, ya tocado y con un validador que falla). -->
        <span class="text-xs text-muted-foreground">Con error</span>
        <mimi-input-otp aria-label="Con error" [separatorAfter]="3" [formControl]="wrong" />
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-xs text-muted-foreground">Deshabilitado</span>
        <mimi-input-otp aria-label="Deshabilitado" [separatorAfter]="3" disabled />
        <span class="text-xs text-muted-foreground">Espera 0:42 para pedir otro.</span>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-xs text-muted-foreground">4 casillas, sin guion</span>
        <mimi-input-otp aria-label="PIN" [length]="4" />
      </div>
      <div class="flex min-w-0 flex-col gap-2 sm:col-span-2">
        <!-- length no tiene tope: con 10 casillas se encogen para caber en una pantalla de teléfono. -->
        <span class="text-xs text-muted-foreground">10 casillas, con dos guiones</span>
        <mimi-input-otp aria-label="Código de 10 dígitos" [length]="10" [separatorAfter]="[3, 6]" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtpStatesExample {
  protected readonly wrong = new FormControl('135790', [Validators.pattern(/^246810$/)]);

  constructor() {
    this.wrong.markAsTouched();
  }
}
