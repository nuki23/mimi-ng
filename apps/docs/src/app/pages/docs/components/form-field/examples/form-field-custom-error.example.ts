import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MimiFormFieldImports } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-form-field-custom-error-example',
  imports: [MimiFormFieldImports, MimiInput],
  template: `
    <mimi-form-field label="Usuario" class="w-80">
      <input
        mimiInput
        #input
        [value]="user()"
        (input)="user.set(input.value)"
        [showError]="taken()"
      />
      <mimi-form-error>Ese nombre de usuario ya existe.</mimi-form-error>
    </mimi-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldCustomErrorExample {
  protected readonly user = signal('ana');
  protected readonly taken = computed(() => ['ana', 'admin'].includes(this.user().trim()));
}
