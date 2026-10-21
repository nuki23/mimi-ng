import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiContextMenuImports } from '@/components/ui/context-menu';

@Component({
  selector: 'app-context-menu-checkbox-example',
  imports: [MimiContextMenuImports],
  template: `
    <div class="flex w-full flex-col gap-3">
      <mimi-context-menu aria-label="Vista">
        <div
          mimiContextMenuTrigger
          tabindex="0"
          class="flex h-44 cursor-context-menu items-center justify-center rounded-card border border-dashed border-input bg-muted text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Haz clic derecho para cambiar la vista
        </div>
        <ng-template mimiContextMenuContent>
          <mimi-menu-label>Vista</mimi-menu-label>
          <mimi-menu-checkbox-item [(checked)]="bookmarks" shortcut="⇧⌘B">
            Mostrar marcadores
          </mimi-menu-checkbox-item>
          <mimi-menu-checkbox-item [(checked)]="fullUrls">
            Mostrar URL completas
          </mimi-menu-checkbox-item>
        </ng-template>
      </mimi-context-menu>
      <p class="text-sm text-muted-foreground">
        Marcadores: {{ bookmarks() ? 'sí' : 'no' }} · URL completas: {{ fullUrls() ? 'sí' : 'no' }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuCheckboxExample {
  protected readonly bookmarks = signal(true);
  protected readonly fullUrls = signal(false);
}
