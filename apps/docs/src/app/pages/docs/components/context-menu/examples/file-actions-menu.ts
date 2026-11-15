import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideEllipsis } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

/** Las acciones de cada archivo: las mismas en el menú contextual y en el botón de la fila. */
export const FILE_ACTIONS = ['Renombrar', 'Duplicar', 'Descargar', 'Eliminar'];

/** En táctil no hay clic derecho: las mismas acciones de la fila, en un botón visible. */
@Component({
  selector: 'app-file-actions-menu',
  imports: [MimiDropdownMenuImports, MimiButton, LucideEllipsis],
  template: `
    <mimi-dropdown-menu align="end" [aria-label]="'Acciones de ' + name()">
      <button
        mimiBtn
        variant="ghost"
        size="icon"
        class="size-8"
        [attr.aria-label]="'Acciones de ' + name()"
        mimiDropdownMenuTrigger
      >
        <svg lucideEllipsis></svg>
      </button>
      <ng-template mimiDropdownMenuContent>
        @for (action of actions; track action) {
          @if (action === 'Eliminar') {
            <mimi-menu-separator />
          }
          <mimi-menu-item
            [tone]="action === 'Eliminar' ? 'danger' : undefined"
            (selected)="picked.emit(action)"
          >
            {{ action }}
          </mimi-menu-item>
        }
      </ng-template>
    </mimi-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileActionsMenu {
  /** Nombre del archivo, para el nombre accesible del botón y del menú. */
  readonly name = input.required<string>();
  /** La acción elegida. */
  readonly picked = output<string>();
  protected readonly actions = FILE_ACTIONS;
}
