import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
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
const sameAs = (group: AbstractControl): ValidationErrors | null =>
  group.value.password === group.value.repeat ? null : { mismatch: true };

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
        <!-- readonly: no se edita, pero el ojo sigue mostrando el valor. -->
        <mimi-password readonly>
          <input mimiInput type="password" aria-label="Solo lectura" value="secreto" />
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

  // El estado del formulario no es un signal: se lee en cada evento del grupo (y de sus campos).
  private readonly repeat = this.group.controls.repeat;
  protected readonly mismatch = toSignal(
    this.group.events.pipe(map(() => this.group.hasError('mismatch') && this.repeat.touched)),
    { initialValue: false },
  );
}
