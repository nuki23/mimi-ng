import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSortableListImports } from '@/components/ui/sortable-list';

@Component({
  selector: 'app-sortable-list-states-example',
  imports: [MimiSortableListImports],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-2">
      <span id="locked-label" class="text-sm font-medium">Deshabilitada</span>
      <mimi-sortable-list aria-labelledby="locked-label" disabled [items]="locked" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableListStatesExample {
  protected readonly locked = ['Primero', 'Segundo', 'Tercero'];
}
