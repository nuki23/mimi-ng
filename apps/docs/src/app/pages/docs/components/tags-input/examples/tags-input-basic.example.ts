import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiTagsInput } from '@/components/ui/tags-input';

@Component({
  selector: 'app-tags-input-basic-example',
  imports: [MimiTagsInput],
  template: `
    <div class="flex w-full max-w-md flex-col gap-1.5">
      <label for="project-tags" class="text-sm font-medium">Etiquetas del proyecto</label>
      <!-- La normalización del diseño (minúsculas y sin #) es del ejemplo. -->
      <mimi-tags-input
        id="project-tags"
        placeholder="Agregar otra…"
        [limit]="5"
        [normalize]="normalize"
        [(value)]="tags"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputBasicExample {
  protected readonly tags = signal(['angular', 'diseño', 'ventas']);
  protected readonly normalize = (tag: string) => tag.trim().toLowerCase().replace(/^#/, '');
}
