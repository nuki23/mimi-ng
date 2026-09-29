import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiCheckbox } from '@/components/ui/checkbox';

@Component({
  selector: 'app-switch-reactive-forms-example',
  imports: [ReactiveFormsModule, MimiButton, MimiCheckbox],
  template: `
    <form [formGroup]="form" (ngSubmit)="form.markAllAsTouched()" class="flex flex-col gap-4">
      <mimi-checkbox formControlName="terms">
        Acepto los términos y la política de privacidad
      </mimi-checkbox>
      <button mimiBtn type="submit" class="self-start">Crear cuenta</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchReactiveFormsExample {
  protected readonly form = new FormGroup({
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
}
