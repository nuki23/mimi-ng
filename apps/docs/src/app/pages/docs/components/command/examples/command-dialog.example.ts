import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type LucideIcon, LucideDynamicIcon, LucideSearch } from '@lucide/angular';
import { MimiCommandImports, type MimiCommandItem } from '@/components/ui/command';
import { APP_COMMANDS } from './app-commands';

@Component({
  selector: 'app-command-dialog-example',
  imports: [MimiCommandImports, LucideDynamicIcon, LucideSearch],
  template: `
    <div class="flex flex-col items-center gap-3">
      <!-- El disparador del diseño: la caja de Input con ⌘K. -->
      <button
        type="button"
        class="flex h-[34px] w-[220px] cursor-pointer items-center gap-2 rounded-[var(--mimi-radius)] border border-border bg-input-background pr-1.5 pl-2.5 text-[13px] text-muted-foreground mimi-transition hover:border-input-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[var(--mimi-press-scale)]"
        (click)="open.set(true)"
      >
        <svg lucideSearch class="size-3.5" aria-hidden="true"></svg>
        <span class="flex-1 text-left">Buscar…</span>
        <kbd
          class="inline-flex h-5 items-center rounded-[5px] border border-border bg-background px-1.5 font-mono text-[11px]"
          >{{ keys }}</kbd
        >
      </button>
      <p class="text-sm text-muted-foreground" aria-live="polite">
        @if (last(); as last) {
          Ejecutado: <span class="font-medium text-foreground">{{ last }}</span>
        } @else {
          Pulsa {{ keys }} en cualquier parte de la página.
        }
      </p>
    </div>

    <mimi-command-dialog [(open)]="open" [items]="commands" (run)="run($event)">
      <!-- El ícono de cada comando sale de su data. -->
      <ng-template mimiCommandIcon let-item>
        <svg [lucideIcon]="item.data" aria-hidden="true"></svg>
      </ng-template>
    </mimi-command-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandDialogExample {
  protected readonly commands = APP_COMMANDS;
  protected readonly open = signal(false);
  protected readonly last = signal<string | null>(null);
  /** ⌘K en Mac, Ctrl K en los demás. */
  protected readonly keys = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl K';

  protected run(item: MimiCommandItem<LucideIcon>): void {
    this.last.set(item.label);
  }
}
