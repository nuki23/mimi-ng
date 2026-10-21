import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideChevronsUpDown,
  LucideCreditCard,
  LucideKeyboard,
  LucideSettings,
} from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

@Component({
  selector: 'app-dropdown-menu-shortcuts-example',
  imports: [
    MimiDropdownMenuImports,
    MimiButton,
    LucideChevronsUpDown,
    LucideCreditCard,
    LucideKeyboard,
    LucideSettings,
  ],
  template: `
    <mimi-dropdown-menu aria-label="Proyecto">
      <button mimiBtn variant="outline" mimiDropdownMenuTrigger>
        panel-ventas
        <svg lucideChevronsUpDown></svg>
      </button>
      <ng-template mimiDropdownMenuContent>
        <mimi-menu-label>Proyecto</mimi-menu-label>
        <mimi-menu-item shortcut="⌘,">
          <svg lucideSettings></svg>
          Ajustes
        </mimi-menu-item>
        <mimi-menu-item shortcut="⌘B">
          <svg lucideCreditCard></svg>
          Facturación
        </mimi-menu-item>
        <mimi-menu-item shortcut="⌘K">
          <svg lucideKeyboard></svg>
          Atajos de teclado
        </mimi-menu-item>
      </ng-template>
    </mimi-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuShortcutsExample {}
