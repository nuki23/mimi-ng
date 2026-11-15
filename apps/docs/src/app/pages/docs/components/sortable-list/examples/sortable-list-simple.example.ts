import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSortableListImports } from '@/components/ui/sortable-list';

@Component({
  selector: 'app-sortable-list-simple-example',
  imports: [MimiSortableListImports],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-2">
      <span id="steps-label" class="text-sm font-medium">Pasos del lanzamiento</span>
      <mimi-sortable-list aria-labelledby="steps-label" [(items)]="steps" />
      <span class="text-xs text-muted-foreground">{{ steps().join(' → ') }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableListSimpleExample {
  protected readonly steps = signal(['Diseñar', 'Construir', 'Probar', 'Publicar']);
}
