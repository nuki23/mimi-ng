import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideLink, LucideRedo2, LucideUndo2 } from '@lucide/angular';
import { MimiToolbarImports } from '@/components/ui/toolbar';

@Component({
  selector: 'app-toolbar-basic-example',
  imports: [MimiToolbarImports, LucideUndo2, LucideRedo2, LucideLink],
  template: `
    <div class="flex flex-col items-center gap-3">
      <mimi-toolbar aria-label="Edición" (activate)="last.set($event)">
        <button mimiToolbarItem="undo" aria-label="Deshacer"><svg lucideUndo2></svg></button>
        <button mimiToolbarItem="redo" aria-label="Rehacer"><svg lucideRedo2></svg></button>
        <mimi-toolbar-separator />
        <button mimiToolbarItem="link" aria-label="Insertar enlace"><svg lucideLink></svg></button>
      </mimi-toolbar>
      <p class="text-sm text-muted-foreground">Última acción: {{ last() ?? 'ninguna' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarBasicExample {
  protected readonly last = signal<string | undefined>(undefined);
}
