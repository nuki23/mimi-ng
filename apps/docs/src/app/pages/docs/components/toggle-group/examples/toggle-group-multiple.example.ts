import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideBold, LucideItalic, LucideStrikethrough, LucideUnderline } from '@lucide/angular';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

@Component({
  selector: 'app-toggle-group-multiple-example',
  imports: [MimiToggleGroupImports, LucideBold, LucideItalic, LucideUnderline, LucideStrikethrough],
  template: `
    <div class="flex flex-col items-center gap-3">
      <mimi-toggle-group aria-label="Formato" multiple [(value)]="styles">
        <button mimiToggleGroupItem="bold" aria-label="Negrita"><svg lucideBold></svg></button>
        <button mimiToggleGroupItem="italic" aria-label="Cursiva"><svg lucideItalic></svg></button>
        <button mimiToggleGroupItem="underline" aria-label="Subrayado">
          <svg lucideUnderline></svg>
        </button>
        <button mimiToggleGroupItem="strike" aria-label="Tachado">
          <svg lucideStrikethrough></svg>
        </button>
      </mimi-toggle-group>
      <p class="text-sm text-muted-foreground">Estilos: {{ styles().join(', ') || 'ninguno' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupMultipleExample {
  protected readonly styles = signal<string[]>(['bold']);
}
