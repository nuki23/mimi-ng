import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  MIMI_ERROR_MESSAGES_ES,
  MimiFormField,
  provideMimiErrorMessages,
} from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';

/** Validador propio: su clave (`usernameTaken`) es la que busca el mapa de mensajes. */
function usernameAvailable(control: AbstractControl): ValidationErrors | null {
  return ['ana', 'admin'].includes(control.value) ? { usernameTaken: true } : null;
}

@Component({
  selector: 'app-form-field-messages-provider-example',
  imports: [ReactiveFormsModule, MimiFormField, MimiInput],
  // En tu app va en app.config.ts; aquí, en el componente, para no cambiar el resto del sitio.
  providers: [
    provideMimiErrorMessages({
      ...MIMI_ERROR_MESSAGES_ES,
      required: 'Completa este campo.',
      usernameTaken: 'Ese nombre de usuario ya existe.',
    }),
  ],
  template: `
    <mimi-form-field label="Usuario" class="w-80">
      <input mimiInput [formControl]="user" />
    </mimi-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldMessagesProviderExample {
  protected readonly user = new FormControl('admin', [Validators.required, usernameAvailable]);

  constructor() {
    this.user.markAsTouched();
  }
}
