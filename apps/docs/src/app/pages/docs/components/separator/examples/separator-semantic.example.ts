import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiSeparator } from '@/components/ui/separator';

@Component({
  selector: 'app-separator-semantic-example',
  imports: [MimiButton, MimiSeparator],
  template: `
    <div role="group" aria-label="Acciones del documento" class="flex items-center gap-1">
      <button mimiBtn variant="ghost" size="sm">Copiar</button>
      <button mimiBtn variant="ghost" size="sm">Pegar</button>
      <mimi-separator orientation="vertical" decorative="false" class="mx-1" />
      <button mimiBtn variant="ghost" size="sm">Deshacer</button>
      <button mimiBtn variant="ghost" size="sm">Rehacer</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorSemanticExample {}
