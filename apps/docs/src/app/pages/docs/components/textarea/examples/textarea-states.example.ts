import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiFormFieldImports } from '@/components/ui/form-field';
import { MimiTextarea } from '@/components/ui/textarea';

@Component({
  selector: 'app-textarea-states-example',
  imports: [MimiFormFieldImports, MimiTextarea],
  template: `
    <div class="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <mimi-form-field label="Deshabilitado">
        <textarea mimiTextarea rows="2" disabled>Solo lectura</textarea>
      </mimi-form-field>
      <mimi-form-field label="Con error">
        <textarea mimiTextarea rows="2" [showError]="true">Hola</textarea>
        <mimi-form-error>Escribe al menos 20 caracteres.</mimi-form-error>
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaStatesExample {}
