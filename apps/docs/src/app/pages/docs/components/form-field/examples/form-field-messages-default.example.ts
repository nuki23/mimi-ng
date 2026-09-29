import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MIMI_ERROR_MESSAGES_EN,
  MimiFormField,
  provideMimiErrorMessages,
} from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-form-field-messages-default-example',
  imports: [ReactiveFormsModule, MimiFormField, MimiInput],
  // Sin provideMimiErrorMessages, los mensajes están en inglés. Este sitio usa el español,
  // así que aquí se vuelve a los predeterminados; en tu app no hace falta escribir nada.
  providers: [provideMimiErrorMessages(MIMI_ERROR_MESSAGES_EN)],
  template: `
    <mimi-form-field label="Email" class="w-80">
      <input mimiInput type="email" [formControl]="email" />
    </mimi-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldMessagesDefaultExample {
  protected readonly email = new FormControl('ana@', [Validators.required, Validators.email]);

  constructor() {
    this.email.markAsTouched();
  }
}
