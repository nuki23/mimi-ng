import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-ng-model-example',
  imports: [FormsModule, MimiInput],
  template: `
    <div class="flex w-80 flex-col gap-1.5">
      <label for="model-name" class="text-sm font-medium">Nombre</label>
      <input
        mimiInput
        #nameInput="mimiInput"
        id="model-name"
        name="name"
        required
        minlength="3"
        [(ngModel)]="name"
      />
      @if (nameInput.fieldState.showError()) {
        <p class="text-[13px] text-destructive">Escribe al menos 3 letras.</p>
      } @else {
        <p class="text-[13px] text-muted-foreground">Hola, {{ name() || '…' }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNgModelExample {
  protected readonly name = signal('');
}
