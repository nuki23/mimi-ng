import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiTagsInput } from '@/components/ui/tags-input';

@Component({
  selector: 'app-tags-input-custom-example',
  imports: [MimiTagsInput],
  template: `
    <!-- class va a la caja: el radio de las tarjetas y su fondo. -->
    <mimi-tags-input aria-label="Temas" class="max-w-md rounded-card bg-card" [(value)]="topics" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputCustomExample {
  protected readonly topics = signal(['angular', 'tailwind']);
}
