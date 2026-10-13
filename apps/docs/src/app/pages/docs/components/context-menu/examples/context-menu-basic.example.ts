import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideMousePointerClick,
  LucideRotateCw,
  LucideTrash2,
} from '@lucide/angular';
import { MimiContextMenuImports } from '@/components/ui/context-menu';

@Component({
  selector: 'app-context-menu-basic-example',
  imports: [
    MimiContextMenuImports,
    LucideArrowLeft,
    LucideArrowRight,
    LucideMousePointerClick,
    LucideRotateCw,
    LucideTrash2,
  ],
  template: `
    <div class="flex w-full flex-col gap-3">
      <mimi-context-menu label="Menú contextual">
        <div
          mimiContextMenuTrigger
          tabindex="0"
          class="flex h-44 cursor-context-menu items-center justify-center gap-2 rounded-card border border-dashed border-input bg-muted text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <svg lucideMousePointerClick class="size-4"></svg>
          Haz clic derecho en esta área
        </div>
        <ng-template mimiContextMenuContent>
          <mimi-menu-item shortcut="⌘[" (selected)="last.set('Atrás')">
            <svg lucideArrowLeft></svg>
            Atrás
          </mimi-menu-item>
          <mimi-menu-item shortcut="⌘]" disabled>
            <svg lucideArrowRight></svg>
            Adelante
          </mimi-menu-item>
          <mimi-menu-item shortcut="⌘R" (selected)="last.set('Recargar')">
            <svg lucideRotateCw></svg>
            Recargar
          </mimi-menu-item>
          <mimi-menu-separator />
          <mimi-menu-item tone="danger" shortcut="⌫" (selected)="last.set('Eliminar')">
            <svg lucideTrash2></svg>
            Eliminar
          </mimi-menu-item>
        </ng-template>
      </mimi-context-menu>
      <p class="text-sm text-muted-foreground">Elegiste: {{ last() ?? '—' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuBasicExample {
  protected readonly last = signal<string | null>(null);
}
