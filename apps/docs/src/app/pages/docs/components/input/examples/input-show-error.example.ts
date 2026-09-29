import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiFormFieldImports } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-show-error-example',
  imports: [MimiFormFieldImports, MimiInput],
  template: `
    <mimi-form-field label="Usuario" class="w-80">
      <input mimiInput value="ana" [showError]="true" />
      <mimi-form-error>Ese nombre de usuario ya existe.</mimi-form-error>
    </mimi-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputShowErrorExample {}
