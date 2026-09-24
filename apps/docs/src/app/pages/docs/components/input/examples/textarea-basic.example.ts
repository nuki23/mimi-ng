import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiTextarea } from '@/components/ui/textarea';

@Component({
  selector: 'app-textarea-basic-example',
  imports: [MimiTextarea],
  template: `
    <div class="flex w-80 flex-col gap-1.5">
      <label for="message" class="text-sm font-medium">Mensaje</label>
      <textarea mimiTextarea id="message" rows="3" placeholder="Cuéntanos más…"></textarea>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaBasicExample {}
