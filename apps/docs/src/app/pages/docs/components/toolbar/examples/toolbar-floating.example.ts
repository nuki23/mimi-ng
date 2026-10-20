import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideBold,
  LucideHand,
  LucideItalic,
  LucideMessageCircle,
  LucideMousePointer2,
  LucideSquare,
  LucideTextAlignCenter,
  LucideTextAlignStart,
} from '@lucide/angular';
import { MimiToolbarImports } from '@/components/ui/toolbar';
import { MimiTooltip } from '@/components/ui/tooltip';

@Component({
  selector: 'app-toolbar-floating-example',
  imports: [
    MimiToolbarImports,
    MimiTooltip,
    LucideMousePointer2,
    LucideHand,
    LucideSquare,
    LucideMessageCircle,
    LucideBold,
    LucideItalic,
    LucideTextAlignStart,
    LucideTextAlignCenter,
  ],
  template: `
    <!-- Un lienzo con puntos; las barras flotan con class (el componente no se posiciona solo). -->
    <div
      class="relative h-[420px] w-full overflow-hidden rounded-card border bg-muted bg-[radial-gradient(color-mix(in_oklch,var(--mimi-foreground)_16%,transparent)_1px,transparent_1px)] bg-size-[16px_16px]"
    >
      <div
        aria-hidden="true"
        class="absolute top-16 left-28 h-28 w-36 rounded-[18px] bg-info"
      ></div>
      <div aria-hidden="true" class="absolute top-36 left-52 size-28 rounded-full bg-warning"></div>
      <div
        aria-hidden="true"
        class="absolute top-14 right-10 h-32 w-48 rounded-card border-2 border-info bg-card shadow-card"
      ></div>

      <mimi-toolbar
        orientation="vertical"
        aria-label="Herramientas"
        class="absolute top-4 left-4"
        [(value)]="tool"
      >
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

      <mimi-toolbar
        aria-label="Formato"
        class="absolute bottom-4 left-1/2 -translate-x-1/2"
        [(value)]="align"
        [(pressed)]="styles"
      >
        <button
          mimiToolbarItem="bold"
          kind="toggle"
          aria-label="Negrita"
          mimiTooltip="Negrita"
          mimiTooltipShortcut="⌘B"
        >
          <svg lucideBold></svg>
        </button>
        <button
          mimiToolbarItem="italic"
          kind="toggle"
          aria-label="Cursiva"
          mimiTooltip="Cursiva"
          mimiTooltipShortcut="⌘I"
        >
          <svg lucideItalic></svg>
        </button>
        <mimi-toolbar-separator />
        <button
          mimiToolbarItem="start"
          kind="tool"
          aria-label="Alinear al inicio"
          mimiTooltip="Alinear al inicio"
        >
          <svg lucideTextAlignStart></svg>
        </button>
        <button mimiToolbarItem="center" kind="tool" aria-label="Centrar" mimiTooltip="Centrar">
          <svg lucideTextAlignCenter></svg>
        </button>
      </mimi-toolbar>
    </div>
  `,
  // El lienzo ocupa todo el ancho de la vista previa.
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarFloatingExample {
  protected readonly tool = signal<string | undefined>('select');
  protected readonly align = signal<string | undefined>('start');
  protected readonly styles = signal<string[]>(['bold']);
}
