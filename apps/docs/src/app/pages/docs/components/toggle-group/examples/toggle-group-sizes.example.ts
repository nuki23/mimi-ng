import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

@Component({
  selector: 'app-toggle-group-sizes-example',
  imports: [MimiToggleGroupImports],
  template: `
    <div class="flex flex-col items-center gap-3">
      <mimi-toggle-group size="sm" aria-label="Vista, pequeño" [(value)]="view">
        <button mimiToggleGroupItem="list">Lista</button>
        <button mimiToggleGroupItem="board">Tablero</button>
      </mimi-toggle-group>
      <mimi-toggle-group size="md" aria-label="Vista, mediano" [(value)]="view">
        <button mimiToggleGroupItem="list">Lista</button>
        <button mimiToggleGroupItem="board">Tablero</button>
      </mimi-toggle-group>
      <mimi-toggle-group size="lg" aria-label="Vista, grande" [(value)]="view">
        <button mimiToggleGroupItem="list">Lista</button>
        <button mimiToggleGroupItem="board">Tablero</button>
      </mimi-toggle-group>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupSizesExample {
  protected readonly view = signal<string | null>('list');
}
