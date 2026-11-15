import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import {
  LucideHand,
  LucideMessageCircle,
  LucideMousePointer2,
  LucideSquare,
} from '@lucide/angular';
import { MimiToolbarImports } from '@/components/ui/toolbar';
import { MimiTooltip } from '@/components/ui/tooltip';

/** La barra vertical de herramientas del lienzo (ejemplo «Flotante»). */
@Component({
  selector: 'app-canvas-tools',
  imports: [
    MimiToolbarImports,
    MimiTooltip,
    LucideMousePointer2,
    LucideHand,
    LucideSquare,
    LucideMessageCircle,
  ],
  template: `
    <!-- En la vertical, los tooltips van a la derecha. -->
    <mimi-toolbar orientation="vertical" aria-label="Herramientas" [(value)]="tool">
      <button
        mimiToolbarItem="select"
        kind="tool"
        aria-label="Seleccionar"
        mimiTooltip="Seleccionar"
        mimiTooltipShortcut="V"
        mimiTooltipSide="right"
      >
        <svg lucideMousePointer2></svg>
      </button>
      <button
        mimiToolbarItem="hand"
        kind="tool"
        aria-label="Mover lienzo"
        mimiTooltip="Mover lienzo"
        mimiTooltipShortcut="H"
        mimiTooltipSide="right"
      >
        <svg lucideHand></svg>
      </button>
      <button
        mimiToolbarItem="rect"
        kind="tool"
        aria-label="Rectángulo"
        mimiTooltip="Rectángulo"
        mimiTooltipShortcut="R"
        mimiTooltipSide="right"
      >
        <svg lucideSquare></svg>
      </button>
      <mimi-toolbar-separator />
      <button
        mimiToolbarItem="comments"
        aria-label="Comentarios, 3 sin leer"
        mimiTooltip="Comentarios"
        mimiTooltipShortcut="C"
        mimiTooltipSide="right"
      >
        <svg lucideMessageCircle></svg>
        <span mimiToolbarCount>3</span>
      </button>
    </mimi-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CanvasTools {
  /** La herramienta activa. */
  readonly tool = model<string | undefined>('select');
}
