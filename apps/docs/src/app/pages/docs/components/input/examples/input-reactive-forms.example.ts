import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-reactive-forms-example',
  imports: [ReactiveFormsModule, MimiInput, MimiButton],
  template: `
    <form class="flex w-80 flex-col gap-3" [formGroup]="form" (ngSubmit)="form.markAllAsTouched()">
      <div class="flex flex-col gap-1.5">
        <label for="reactive-email" class="text-sm font-medium">Correo</label>
        <input
          mimiInput
          #emailInput="mimiInput"
          id="reactive-email"
          type="email"
          formControlName="email"
          placeholder="tu@correo.com"
        />
        @if (emailInput.fieldState.showError()) {
          <p class="text-[13px] text-destructive">Ingresa un correo válido.</p>
        }
      </div>
      <button mimiBtn type="submit">Suscribirme</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputReactiveFormsExample {
  protected readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
}
