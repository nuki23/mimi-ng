import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiTextarea } from '@/components/ui/textarea';

@Component({
  selector: 'app-textarea-states-example',
  imports: [MimiTextarea],
  template: `
    <div class="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <label for="notes" class="text-sm font-medium">Deshabilitado</label>
        <textarea mimiTextarea id="notes" rows="2" disabled>Solo lectura</textarea>
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="bio" class="text-sm font-medium">Con error</label>
        <textarea mimiTextarea id="bio" rows="2" [showError]="true">Hola</textarea>
        <p class="text-[13px] text-destructive">Escribe al menos 20 caracteres.</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaStatesExample {}
