import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiTagsInput } from '@/components/ui/tags-input';

@Component({
  selector: 'app-tags-input-sizes-example',
  imports: [MimiTagsInput],
  template: `
    <div class="flex w-full max-w-md flex-col gap-3">
      <mimi-tags-input size="sm" aria-label="Etiquetas, pequeño" [value]="['angular']" />
      <mimi-tags-input size="md" aria-label="Etiquetas, mediano" [value]="['angular']" />
      <mimi-tags-input size="lg" aria-label="Etiquetas, grande" [value]="['angular']" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputSizesExample {}
