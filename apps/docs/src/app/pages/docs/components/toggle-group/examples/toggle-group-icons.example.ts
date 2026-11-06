import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideTextAlignCenter,
  LucideTextAlignEnd,
  LucideTextAlignJustify,
  LucideTextAlignStart,
} from '@lucide/angular';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

@Component({
  selector: 'app-toggle-group-icons-example',
  imports: [
    MimiToggleGroupImports,
    LucideTextAlignStart,
    LucideTextAlignCenter,
    LucideTextAlignEnd,
    LucideTextAlignJustify,
  ],
  template: `
    <!-- Sin texto visible, el aria-label es el nombre de cada botón. -->
    <mimi-toggle-group aria-label="Alineación" [(value)]="align">
      <button mimiToggleGroupItem="start" aria-label="Alinear al inicio">
        <svg lucideTextAlignStart></svg>
      </button>
      <button mimiToggleGroupItem="center" aria-label="Centrar">
        <svg lucideTextAlignCenter></svg>
      </button>
      <button mimiToggleGroupItem="end" aria-label="Alinear al final">
        <svg lucideTextAlignEnd></svg>
      </button>
      <button mimiToggleGroupItem="justify" aria-label="Justificar">
        <svg lucideTextAlignJustify></svg>
      </button>
    </mimi-toggle-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupIconsExample {
  protected readonly align = signal<string | null>('start');
}
