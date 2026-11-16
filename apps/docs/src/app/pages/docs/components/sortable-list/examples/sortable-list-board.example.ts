import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiSortableMove, MimiSortableListImports } from '@/components/ui/sortable-list';

interface Task {
  id: number;
  title: string;
}

@Component({
  selector: 'app-sortable-list-board-example',
  imports: [MimiSortableListImports],
  template: `
    <mimi-sortable-group class="grid w-full gap-4 md:grid-cols-3" (moved)="onMoved($event)">
      @for (column of columns; track column.id) {
        <section class="flex min-w-0 flex-col gap-2">
          <h3 class="text-sm font-semibold">{{ column.title }} · {{ column.tasks().length }}</h3>
          <mimi-sortable-list
            [listId]="column.id"
            [aria-label]="column.title"
            [(items)]="column.tasks"
            [itemLabel]="title"
            [trackBy]="byId"
            [accepts]="column.id === 'doing' ? atMostThree : anything"
          />
        </section>
      }
    </mimi-sortable-group>
    @if (last(); as move) {
      <p class="mt-3 text-sm text-muted-foreground">
        {{ move.item.title }}: de {{ move.from.list }} a {{ move.to.list }}.
      </p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableListBoardExample {
  protected readonly columns = [
    {
      id: 'todo',
      title: 'Pendiente',
      tasks: signal([
        { id: 1, title: 'Revisar contraste' },
        { id: 2, title: 'Migrar Select' },
      ]),
    },
    { id: 'doing', title: 'En curso', tasks: signal([{ id: 3, title: 'Diseñar Tabs' }]) },
    { id: 'done', title: 'Completado', tasks: signal<Task[]>([]) },
  ];
  protected readonly last = signal<MimiSortableMove<Task> | null>(null);
  /** El grupo emite para todas sus listas: aquí todas son de tareas. */
  protected onMoved(move: MimiSortableMove<unknown>): void {
    this.last.set(move as MimiSortableMove<Task>);
  }
  protected readonly title = (task: Task) => task.title;
  protected readonly byId = (task: Task) => task.id;
  protected readonly anything = () => true;
  /** «No más de 3 en curso». */
  protected readonly atMostThree = () => this.columns[1].tasks().length < 3;
}
