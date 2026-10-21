import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideArchive, LucideEllipsis, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

@Component({
  selector: 'app-dropdown-menu-destructive-example',
  imports: [
    MimiDropdownMenuImports,
    MimiButton,
    LucideArchive,
    LucideEllipsis,
    LucidePencil,
    LucideTrash2,
  ],
  template: `
    <mimi-dropdown-menu align="end" aria-label="Acciones del proyecto">
      <button mimiBtn variant="ghost" size="icon" aria-label="Acciones" mimiDropdownMenuTrigger>
        <svg lucideEllipsis></svg>
      </button>
      <ng-template mimiDropdownMenuContent>
        <mimi-menu-item>
          <svg lucidePencil></svg>
          Renombrar
        </mimi-menu-item>
        <mimi-menu-item>
          <svg lucideArchive></svg>
          Archivar
        </mimi-menu-item>
        <mimi-menu-separator />
        <mimi-menu-item tone="danger" shortcut="⌘⌫">
          <svg lucideTrash2></svg>
          Eliminar proyecto
        </mimi-menu-item>
      </ng-template>
    </mimi-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuDestructiveExample {}
