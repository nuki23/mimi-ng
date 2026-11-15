import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiTagsInput } from '@/components/ui/tags-input';

@Component({
  selector: 'app-tags-input-separators-example',
  imports: [MimiTagsInput],
  template: `
    <!-- Separadores propios: coma, punto y coma y espacio. -->
    <mimi-tags-input
      aria-label="Destinatarios"
      class="max-w-md"
      hint="Coma, punto y coma o espacio para agregar"
      [separators]="[',', ';', ' ']"
      [(value)]="people"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputSeparatorsExample {
  protected readonly people = signal(['ana', 'luis']);
}
