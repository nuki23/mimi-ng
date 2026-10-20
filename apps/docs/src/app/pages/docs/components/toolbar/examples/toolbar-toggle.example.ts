import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideBold,
  LucideItalic,
  LucideTextAlignCenter,
  LucideTextAlignEnd,
  LucideTextAlignStart,
  LucideUnderline,
} from '@lucide/angular';
import { MimiToolbarImports } from '@/components/ui/toolbar';

@Component({
  selector: 'app-toolbar-toggle-example',
  imports: [
    MimiToolbarImports,
    LucideBold,
    LucideItalic,
    LucideUnderline,
    LucideTextAlignStart,
    LucideTextAlignCenter,
    LucideTextAlignEnd,
  ],
  template: `
    <div class="flex max-w-full flex-col items-center gap-3">
      <!-- En pantallas angostas, la fila se desplaza en vez de partirse. -->
      <div class="max-w-full overflow-x-auto p-2">
        <mimi-toolbar aria-label="Formato" [(value)]="align" [(pressed)]="styles">
          <button mimiToolbarItem="bold" kind="toggle" aria-label="Negrita">
            <svg lucideBold></svg>
          </button>
          <button mimiToolbarItem="italic" kind="toggle" aria-label="Cursiva">
            <svg lucideItalic></svg>
          </button>
          <button mimiToolbarItem="underline" kind="toggle" aria-label="Subrayado">
            <svg lucideUnderline></svg>
          </button>
          <mimi-toolbar-separator />
          <button mimiToolbarItem="start" kind="tool" aria-label="Alinear al inicio">
            <svg lucideTextAlignStart></svg>
          </button>
          <button mimiToolbarItem="center" kind="tool" aria-label="Centrar">
            <svg lucideTextAlignCenter></svg>
          </button>
          <button mimiToolbarItem="end" kind="tool" aria-label="Alinear al final">
            <svg lucideTextAlignEnd></svg>
          </button>
        </mimi-toolbar>
      </div>
      <p class="text-sm text-muted-foreground">
        Estilos: {{ styles().join(', ') || 'ninguno' }} · Alineación: {{ align() }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarToggleExample {
  protected readonly align = signal<string | undefined>('start');
  protected readonly styles = signal<string[]>(['bold']);
}
