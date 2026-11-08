import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDataTableImports, type MimiTableColumn } from '@/components/ui/data-table';

interface Task {
  id: number;
  title: string;
  owner: string;
}

const TASKS: Task[] = [
  { id: 1, title: 'Revisar contraste AA', owner: 'Ana' },
  { id: 2, title: 'Diseñar Tabs', owner: 'Luis' },
  { id: 3, title: 'Migrar Select a signals', owner: 'Marta' },
];

@Component({
  selector: 'app-data-table-states-example',
  imports: [MimiDataTableImports, MimiButton],
  template: `
    <div class="flex w-full flex-col gap-6">
      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium">Mínima: columnas y orden, sin barra</span>
        <mimi-data-table aria-label="Tareas" [toolbar]="false" [data]="tasks" [columns]="columns" />
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium">Cargando</span>
        <mimi-data-table aria-label="Cargando tareas" loading [data]="tasks" [columns]="columns" />
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-sm font-medium">Sin datos, con una acción</span>
        <mimi-data-table aria-label="Sin tareas" [data]="none" [columns]="columns">
          <button type="button" mimiBtn size="sm" mimiTableEmpty (click)="created.set(true)">
            Crear tarea
          </button>
        </mimi-data-table>
        @if (created()) {
          <p class="text-sm text-muted-foreground">Aquí abrirías tu formulario.</p>
        }
      </div>
    </div>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableStatesExample {
  protected readonly tasks = TASKS;
  protected readonly none: Task[] = [];
  protected readonly created = signal(false);
  protected readonly columns: MimiTableColumn<Task>[] = [
    { id: 'title', header: 'Tarea', sortable: true },
    { id: 'owner', header: 'Responsable', sortable: true },
  ];
}
