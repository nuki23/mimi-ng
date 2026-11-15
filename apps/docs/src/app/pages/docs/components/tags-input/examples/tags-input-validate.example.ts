import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiTagsInput } from '@/components/ui/tags-input';

@Component({
  selector: 'app-tags-input-validate-example',
  imports: [MimiTagsInput],
  template: `
    <div class="flex w-full max-w-md flex-col gap-1.5">
      <label for="cc" class="text-sm font-medium">Correos en copia</label>
      <!-- Una etiqueta que no pasa no se agrega: el mensaje aparece debajo. -->
      <mimi-tags-input id="cc" placeholder="nombre@ejemplo.com" [validate]="email" [(value)]="cc" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputValidateExample {
  protected readonly cc = signal(['ana@ejemplo.com']);
  protected readonly email = (tag: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag) ? null : `«${tag}» no es un correo.`;
}
