import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideBookOpen,
  LucideFolderPlus,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMoon,
  LucideReceipt,
  LucideSearch,
  LucideSettings,
  LucideUserPlus,
  LucideUsers,
} from '@lucide/angular';
import {
  MimiCommandImports,
  type MimiCommandGroup,
  type MimiCommandItem,
} from '@/components/ui/command';

type Icon =
  | 'folder-plus'
  | 'user-plus'
  | 'book'
  | 'dashboard'
  | 'users'
  | 'receipt'
  | 'settings'
  | 'moon'
  | 'log-out';

const COMMANDS: MimiCommandGroup<Icon>[] = [
  {
    label: 'Sugerencias',
    items: [
      {
        id: 'new',
        label: 'Nuevo proyecto',
        data: 'folder-plus',
        shortcut: ['⌘', 'N'],
        tone: 'info',
      },
      {
        id: 'invite',
        label: 'Invitar al equipo',
        data: 'user-plus',
        shortcut: ['⌘', 'I'],
        tone: 'success',
      },
      { id: 'docs', label: 'Buscar en la documentación', data: 'book', keywords: ['ayuda'] },
    ],
  },
  {
    label: 'Navegación',
    items: [
      { id: 'home', label: 'Ir al panel', data: 'dashboard', shortcut: ['G', 'P'] },
      { id: 'clients', label: 'Ir a clientes', data: 'users', shortcut: ['G', 'C'] },
      { id: 'billing', label: 'Ir a facturación', data: 'receipt', shortcut: ['G', 'F'] },
      { id: 'settings', label: 'Ir a ajustes', data: 'settings', shortcut: ['G', 'A'] },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { id: 'dark', label: 'Cambiar a modo oscuro', data: 'moon', keywords: ['tema'] },
      {
        id: 'logout',
        label: 'Cerrar sesión',
        data: 'log-out',
        shortcut: ['⇧', '⌘', 'Q'],
        tone: 'danger',
      },
    ],
  },
];

@Component({
  selector: 'app-command-dialog-example',
  imports: [
    MimiCommandImports,
    LucideBookOpen,
    LucideFolderPlus,
    LucideLayoutDashboard,
    LucideLogOut,
    LucideMoon,
    LucideReceipt,
    LucideSearch,
    LucideSettings,
    LucideUserPlus,
    LucideUsers,
  ],
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
      <ng-template mimiCommandIcon let-item>
        @switch (item.data) {
          @case ('folder-plus') {
            <svg lucideFolderPlus aria-hidden="true"></svg>
          }
          @case ('user-plus') {
            <svg lucideUserPlus aria-hidden="true"></svg>
          }
          @case ('book') {
            <svg lucideBookOpen aria-hidden="true"></svg>
          }
          @case ('dashboard') {
            <svg lucideLayoutDashboard aria-hidden="true"></svg>
          }
          @case ('users') {
            <svg lucideUsers aria-hidden="true"></svg>
          }
          @case ('receipt') {
            <svg lucideReceipt aria-hidden="true"></svg>
          }
          @case ('settings') {
            <svg lucideSettings aria-hidden="true"></svg>
          }
          @case ('moon') {
            <svg lucideMoon aria-hidden="true"></svg>
          }
          @default {
            <svg lucideLogOut aria-hidden="true"></svg>
          }
        }
      </ng-template>
    </mimi-command-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandDialogExample {
  protected readonly commands = COMMANDS;
  protected readonly open = signal(false);
  protected readonly last = signal<string | null>(null);
  /** ⌘K en Mac, Ctrl K en los demás. */
  protected readonly keys = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl K';

  protected run(item: MimiCommandItem<Icon>): void {
    this.last.set(item.label);
  }
}
