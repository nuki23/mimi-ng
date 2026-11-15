import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCommandImports, type MimiCommandItem } from '@/components/ui/command';

@Component({
  selector: 'app-command-sizes-example',
  imports: [MimiCommandImports],
  template: `
    <div class="flex w-full max-w-md flex-col gap-4">
      <mimi-command
        size="sm"
        aria-label="Acciones (sm)"
        placeholder="Busca una acción…"
        [items]="actions"
      />
      <mimi-command aria-label="Acciones (md)" placeholder="Busca una acción…" [items]="actions" />
      <mimi-command
        size="lg"
        aria-label="Acciones (lg)"
        placeholder="Busca una acción…"
        [items]="actions"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandSizesExample {
  protected readonly actions: MimiCommandItem[] = [
    { id: 'rename', label: 'Renombrar proyecto', shortcut: ['F2'] },
    { id: 'archive', label: 'Archivar proyecto' },
  ];
}
