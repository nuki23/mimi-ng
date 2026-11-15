import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiContextMenuImports } from '@/components/ui/context-menu';
import type { MimiSize } from '@/components/ui/utils/size';

@Component({
  selector: 'app-context-menu-sizes-example',
  imports: [MimiContextMenuImports],
  template: `
    <div class="grid w-full gap-3 sm:grid-cols-3">
      @for (size of sizes; track size) {
        <mimi-context-menu [size]="size" aria-label="Acciones del comentario">
          <div
            mimiContextMenuTrigger
            tabindex="0"
            class="flex h-28 cursor-context-menu items-center justify-center rounded-card border border-dashed border-input bg-muted px-4 text-center text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Clic derecho: size="{{ size }}"
          </div>
          <ng-template mimiContextMenuContent>
            <mimi-menu-item shortcut="⌘C">Copiar</mimi-menu-item>
            <mimi-menu-item>Comentar</mimi-menu-item>
            <mimi-menu-separator />
            <mimi-menu-item tone="danger">Eliminar</mimi-menu-item>
          </ng-template>
        </mimi-context-menu>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuSizesExample {
  protected readonly sizes: MimiSize[] = ['sm', 'md', 'lg'];
}
