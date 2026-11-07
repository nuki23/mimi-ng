import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiBadge, type BadgeTone } from '@/components/ui/badge';
import { MimiSortableListImports, type MimiSortableReorder } from '@/components/ui/sortable-list';

interface Task {
  id: string;
  title: string;
  meta: string;
  tag: string;
  tone?: BadgeTone;
}

@Component({
  selector: 'app-sortable-list-priorities-example',
  imports: [MimiSortableListImports, MimiBadge],
  template: `
    <div class="flex w-full max-w-md flex-col gap-3">
      <mimi-sortable-list
        aria-label="Prioridades del sprint"
        [(items)]="tasks"
        [itemLabel]="title"
        [trackBy]="byId"
        (reordered)="last.set($event)"
      >
        <ng-template mimiSortableItem let-task let-index="index">
          <span
            class="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-muted text-[11.5px] font-bold tabular-nums"
            >{{ index + 1 }}</span
          >
          <span class="flex min-w-0 flex-1 flex-col leading-[1.3]">
            <span class="truncate text-sm font-semibold">{{ task.title }}</span>
            <span class="text-xs text-muted-foreground">{{ task.meta }}</span>
          </span>
          <span mimiBadge variant="soft" [tone]="task.tone ?? 'secondary'">{{ task.tag }}</span>
        </ng-template>
      </mimi-sortable-list>
      @if (last(); as moved) {
        <p class="text-sm text-muted-foreground">
          «{{ moved.item.title }}» pasó del lugar {{ moved.previousIndex + 1 }} al
          {{ moved.currentIndex + 1 }}.
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableListPrioritiesExample {
  protected readonly tasks = signal<Task[]>([
    {
      id: 'a',
      title: 'Revisar contraste AA',
      meta: 'Accesibilidad · 2 h',
      tag: 'A11y',
      tone: 'success',
    },
    { id: 'b', title: 'Diseñar Tabs', meta: 'Componentes · 5 h', tag: 'Diseño', tone: 'info' },
    {
      id: 'c',
      title: 'Migrar Select a signals',
      meta: 'Código · 1 día',
      tag: 'Código',
      tone: 'warning',
    },
    { id: 'd', title: 'Escribir documentación', meta: 'Docs · 3 h', tag: 'Docs' },
    { id: 'e', title: 'Probar en Safari', meta: 'QA · 1 h', tag: 'QA', tone: 'danger' },
  ]);
  protected readonly last = signal<MimiSortableReorder<Task> | null>(null);
  protected readonly title = (task: Task) => task.title;
  protected readonly byId = (task: Task) => task.id;
}
