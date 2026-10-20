import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideCircle,
  LucideGrid3x3,
  LucideHand,
  LucideLock,
  LucideMousePointer2,
  LucidePenTool,
  LucideSquare,
  LucideType,
} from '@lucide/angular';
import { MimiToolbarImports } from '@/components/ui/toolbar';

@Component({
  selector: 'app-toolbar-vertical-example',
  imports: [
    MimiToolbarImports,
    LucideMousePointer2,
    LucideHand,
    LucideSquare,
    LucideCircle,
    LucidePenTool,
    LucideType,
    LucideGrid3x3,
    LucideLock,
  ],
  template: `
    <div class="flex items-center gap-6">
      <mimi-toolbar
        orientation="vertical"
        aria-label="Herramientas"
        [(value)]="tool"
        [(pressed)]="pressed"
      >
        <button mimiToolbarItem="select" kind="tool" aria-label="Seleccionar">
          <svg lucideMousePointer2></svg>
        </button>
        <button mimiToolbarItem="hand" kind="tool" aria-label="Mover lienzo">
          <svg lucideHand></svg>
        </button>
        <mimi-toolbar-separator />
        <button mimiToolbarItem="rect" kind="tool" aria-label="Rectángulo">
          <svg lucideSquare></svg>
        </button>
        <button mimiToolbarItem="ellipse" kind="tool" aria-label="Elipse">
          <svg lucideCircle></svg>
        </button>
        <button mimiToolbarItem="pen" kind="tool" aria-label="Pluma">
          <svg lucidePenTool></svg>
        </button>
        <button mimiToolbarItem="text" kind="tool" aria-label="Texto">
          <svg lucideType></svg>
        </button>
        <mimi-toolbar-separator />
        <button mimiToolbarItem="grid" kind="toggle" aria-label="Cuadrícula">
          <svg lucideGrid3x3></svg>
        </button>
        <button mimiToolbarItem="lock" kind="toggle" aria-label="Bloquear" disabled>
          <svg lucideLock></svg>
        </button>
      </mimi-toolbar>
      <p class="text-sm text-muted-foreground">
        Herramienta: {{ tool() }}<br />
        Cuadrícula: {{ pressed().includes('grid') ? 'sí' : 'no' }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarVerticalExample {
  protected readonly tool = signal<string | undefined>('select');
  protected readonly pressed = signal<string[]>(['grid']);
}
