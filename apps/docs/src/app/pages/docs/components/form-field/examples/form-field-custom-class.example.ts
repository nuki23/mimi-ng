import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiFormFieldImports } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-form-field-custom-class-example',
  imports: [ReactiveFormsModule, MimiFormFieldImports, MimiInput],
  template: `
    <!-- Etiqueta a la izquierda: el mensaje va en la segunda columna. -->
    <mimi-form-field
      label="Correo"
      class="grid w-full max-w-md grid-cols-[96px_1fr] items-center gap-x-4 gap-y-1.5"
    >
      <input mimiInput type="email" [formControl]="email" />
      <mimi-form-error class="col-start-2" />
    </mimi-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldCustomClassExample {
  protected readonly email = new FormControl('ana@', [Validators.required, Validators.email]);
}
