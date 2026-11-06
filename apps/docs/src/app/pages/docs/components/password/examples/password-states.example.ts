import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
} from '@angular/forms';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { MimiPassword } from '@/components/ui/password';

/** Validador del grupo: las dos contraseñas coinciden (el «No coinciden.» es tuyo). */
function sameAs(group: AbstractControl): ValidationErrors | null {
  const { password, repeat } = group.value as { password: string; repeat: string };
  return password === repeat ? null : { mismatch: true };
}

@Component({
  selector: 'app-password-states-example',
  imports: [MimiPassword, MimiInput, MimiFormField, ReactiveFormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <form class="flex flex-col gap-4" [formGroup]="group">
        <mimi-form-field label="Contraseña">
          <mimi-password>
            <input
              mimiInput
              type="password"
              autocomplete="new-password"
              formControlName="password"
            />
          </mimi-password>
        </mimi-form-field>
        <mimi-form-field label="Repite la contraseña">
          <mimi-password>
            <input
              mimiInput
              type="password"
              autocomplete="new-password"
              formControlName="repeat"
              [showError]="mismatch() || undefined"
            />
          </mimi-password>
          @if (mismatch()) {
            <p class="text-xs text-destructive-soft-foreground">No coinciden.</p>
          }
        </mimi-form-field>
      </form>
      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium">Deshabilitado</span>
        <mimi-password>
          <input mimiInput type="password" aria-label="Deshabilitado" value="secreto" disabled />
        </mimi-password>
        <span class="mt-2 text-sm font-medium">Solo lectura</span>
        <mimi-password>
          <input mimiInput type="password" aria-label="Solo lectura" value="secreto" readonly />
        </mimi-password>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordStatesExample {
  protected readonly group = new FormGroup(
    {
      password: new FormControl('ventana', { nonNullable: true }),
      repeat: new FormControl('ventanas', { nonNullable: true }),
    },
    { validators: sameAs },
  );

  protected mismatch(): boolean {
    return this.group.hasError('mismatch') && this.group.controls.repeat.touched;
  }
}
