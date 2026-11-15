import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideRedo2, LucideUndo2 } from '@lucide/angular';
import { MimiToolbarImports } from '@/components/ui/toolbar';

@Component({
  selector: 'app-toolbar-sizes-example',
  imports: [MimiToolbarImports, LucideUndo2, LucideRedo2],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-4">
      <mimi-toolbar size="sm" aria-label="Edición, pequeño">
        <button mimiToolbarItem="undo" aria-label="Deshacer"><svg lucideUndo2></svg></button>
        <button mimiToolbarItem="redo" aria-label="Rehacer"><svg lucideRedo2></svg></button>
      </mimi-toolbar>
      <mimi-toolbar size="md" aria-label="Edición, mediano">
        <button mimiToolbarItem="undo" aria-label="Deshacer"><svg lucideUndo2></svg></button>
        <button mimiToolbarItem="redo" aria-label="Rehacer"><svg lucideRedo2></svg></button>
      </mimi-toolbar>
      <mimi-toolbar size="lg" aria-label="Edición, grande">
        <button mimiToolbarItem="undo" aria-label="Deshacer"><svg lucideUndo2></svg></button>
        <button mimiToolbarItem="redo" aria-label="Rehacer"><svg lucideRedo2></svg></button>
      </mimi-toolbar>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarSizesExample {}
