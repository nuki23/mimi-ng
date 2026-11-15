import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiTextarea } from '@/components/ui/textarea';

@Component({
  selector: 'app-textarea-sizes-example',
  imports: [MimiTextarea],
  template: `
    <div class="flex w-full max-w-md flex-col gap-3">
      <textarea mimiTextarea size="sm" rows="1" aria-label="Nota, pequeño">Pequeño</textarea>
      <textarea mimiTextarea size="md" rows="1" aria-label="Nota, mediano">Mediano</textarea>
      <textarea mimiTextarea size="lg" rows="1" aria-label="Nota, grande">Grande</textarea>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaSizesExample {}
