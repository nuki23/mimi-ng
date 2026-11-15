import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSortableListImports } from '@/components/ui/sortable-list';

@Component({
  selector: 'app-sortable-list-sizes-example',
  imports: [MimiSortableListImports],
  template: `
    <div class="grid w-full max-w-3xl gap-6 sm:grid-cols-3">
      @for (size of sizes; track size) {
        <div class="flex flex-col gap-2">
          <span class="text-sm font-medium">size="{{ size }}"</span>
          <mimi-sortable-list [aria-label]="'Lista ' + size" [size]="size" [(items)]="items" />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableListSizesExample {
  protected readonly sizes = ['sm', 'md', 'lg'] as const;
  protected readonly items = signal(['Uno', 'Dos', 'Tres']);
}
