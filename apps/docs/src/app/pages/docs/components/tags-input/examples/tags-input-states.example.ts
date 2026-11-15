import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiTagsInput } from '@/components/ui/tags-input';

@Component({
  selector: 'app-tags-input-states-example',
  imports: [MimiTagsInput],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-muted-foreground">Deshabilitado</span>
        <mimi-tags-input aria-label="Deshabilitado" [value]="['angular', 'diseño']" disabled />
      </div>
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-muted-foreground">Solo lectura</span>
        <mimi-tags-input aria-label="Solo lectura" [value]="['angular', 'diseño']" readonly />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputStatesExample {}
