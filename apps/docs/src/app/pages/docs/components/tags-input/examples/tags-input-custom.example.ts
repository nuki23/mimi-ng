import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiTagsInput } from '@/components/ui/tags-input';

@Component({
  selector: 'app-tags-input-custom-example',
  imports: [MimiTagsInput],
  template: `
    <!-- Separadores propios (coma, punto y coma y espacio) y class en la caja. -->
    <mimi-tags-input
      aria-label="Destinatarios"
      class="max-w-md rounded-card bg-card"
      hint="Coma, punto y coma o espacio para agregar"
      [separators]="[',', ';', ' ']"
      [(value)]="people"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputCustomExample {
  protected readonly people = signal(['ana', 'luis']);
}
