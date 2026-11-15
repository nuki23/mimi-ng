import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiDataTableImports, type MimiTableColumn } from '@/components/ui/data-table';

interface Task {
  id: number;
  title: string;
  owner: string;
}

const TASKS: Task[] = [
  { id: 1, title: 'Revisar contraste AA', owner: 'Ana' },
  { id: 2, title: 'Diseñar Tabs', owner: 'Luis' },
];

@Component({
  selector: 'app-data-table-sizes-example',
  imports: [MimiDataTableImports],
  template: `
    <div class="flex w-full flex-col gap-6">
      @for (size of sizes; track size) {
        <div class="flex flex-col gap-2">
          <span class="text-sm font-medium">size="{{ size }}"</span>
          <mimi-data-table
            [aria-label]="'Tareas, tamaño ' + size"
            [size]="size"
            [toolbar]="false"
            [data]="tasks"
            [columns]="columns"
          />
        </div>
      }
      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium">density="comfortable"</span>
        <mimi-data-table
          aria-label="Tareas, densidad cómoda"
          density="comfortable"
          [toolbar]="false"
          [data]="tasks"
          [columns]="columns"
        />
      </div>
    </div>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableSizesExample {
  protected readonly sizes = ['sm', 'md', 'lg'] as const;
  protected readonly tasks = TASKS;
  protected readonly columns: MimiTableColumn<Task>[] = [
    { id: 'title', header: 'Tarea' },
    { id: 'owner', header: 'Responsable' },
  ];
}
