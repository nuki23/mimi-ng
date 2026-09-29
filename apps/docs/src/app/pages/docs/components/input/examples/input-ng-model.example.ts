import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-ng-model-example',
  imports: [FormsModule, MimiFormField, MimiInput],
  template: `
    <div class="flex w-80 flex-col gap-1.5">
      <mimi-form-field label="Nombre">
        <input mimiInput name="name" required minlength="3" [(ngModel)]="name" />
      </mimi-form-field>
      <p class="text-[13px] text-muted-foreground">Hola, {{ name() || '…' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNgModelExample {
  protected readonly name = signal('');
}
