import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCommandImports, type MimiCommandItem } from '@/components/ui/command';

@Component({
  selector: 'app-command-inline-example',
  imports: [MimiCommandImports, MimiButton],
  template: `
    <div class="flex w-full max-w-md flex-col gap-3">
      <mimi-command
        aria-label="Acciones del proyecto"
        placeholder="Busca una acción…"
        class="[--mimi-command-list-height:220px]"
        [items]="actions"
        [(query)]="query"
        (run)="last.set($event.label)"
      >
        <button mimiBtn mimiCommandEmpty variant="outline" size="sm" (click)="query.set('')">
          Ver todas las acciones
        </button>
      </mimi-command>
      <div class="flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
        Prueba:
        @for (text of tries; track text) {
          <button
            type="button"
            class="h-[26px] cursor-pointer rounded-full border border-border bg-card px-2.5 text-foreground mimi-transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            (click)="query.set(text)"
          >
            {{ text ? '«' + text + '»' : 'Todo' }}
          </button>
        }
      </div>
      <p class="text-sm text-muted-foreground" aria-live="polite">
        Ejecutado: <span class="font-medium text-foreground">{{ last() ?? '—' }}</span>
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandInlineExample {
  protected readonly actions: MimiCommandItem[] = [
    { id: 'rename', label: 'Renombrar proyecto', shortcut: ['F2'] },
    { id: 'duplicate', label: 'Duplicar proyecto', shortcut: ['⌘', 'D'] },
    { id: 'archive', label: 'Archivar proyecto', keywords: ['guardar', 'ocultar'] },
    { id: 'transfer', label: 'Transferir a otro equipo', disabled: true },
    { id: 'delete', label: 'Eliminar proyecto', shortcut: ['⌘', '⌫'] },
  ];
  protected readonly tries = ['', 'proy', 'ocultar', 'facturaz'];
  protected readonly query = signal('');
  protected readonly last = signal<string | null>(null);
}
