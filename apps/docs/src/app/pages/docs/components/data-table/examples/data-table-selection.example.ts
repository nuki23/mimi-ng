import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideEllipsis } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiDataTableImports } from '@/components/ui/data-table';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';
import { COLUMNS, CUSTOMERS } from './customers';

@Component({
  selector: 'app-data-table-selection-example',
  imports: [MimiDataTableImports, MimiDropdownMenuImports, MimiButton, LucideEllipsis],
  template: `
    <mimi-data-table
      aria-label="Clientes con selección"
      selectable
      [data]="customers"
      [columns]="columns"
      [pageSize]="5"
      [pageSizeOptions]="[5, 10, 25]"
      [(selection)]="selection"
      class="w-full"
    >
      <ng-template mimiTableDetail let-row>
        <div class="flex flex-wrap gap-x-10 gap-y-1 text-[13.5px]">
          <span><span class="text-muted-foreground">Contacto:</span> {{ row.email }}</span>
          <span><span class="text-muted-foreground">Usuarios:</span> {{ row.users }}</span>
        </div>
      </ng-template>
      <ng-template mimiTableActions let-row>
        <mimi-dropdown-menu>
          <button
            type="button"
            mimiBtn
            variant="ghost"
            size="icon"
            mimiDropdownMenuTrigger
            [attr.aria-label]="'Acciones de ' + row.company"
          >
            <svg lucideEllipsis aria-hidden="true"></svg>
          </button>
          <ng-template mimiDropdownMenuContent>
            <mimi-menu-label>{{ row.company }}</mimi-menu-label>
            <mimi-menu-item (selected)="last.set('Editar ' + row.company)">Editar</mimi-menu-item>
            <mimi-menu-separator />
            <mimi-menu-item tone="danger" (selected)="last.set('Cancelar ' + row.company)"
              >Cancelar cuenta</mimi-menu-item
            >
          </ng-template>
        </mimi-dropdown-menu>
      </ng-template>
      <ng-template mimiTableBulk let-ids>
        <button type="button" mimiBtn variant="outline" size="sm" (click)="export(ids)">
          Exportar
        </button>
        <button type="button" mimiBtn tone="danger" size="sm" (click)="remove(ids)">
          Eliminar
        </button>
      </ng-template>
    </mimi-data-table>
    <p class="mt-3 text-sm text-muted-foreground" aria-live="polite">
      Última acción: <span class="font-medium text-foreground">{{ last() ?? '—' }}</span>
    </p>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableSelectionExample {
  protected readonly customers = CUSTOMERS;
  protected readonly columns = COLUMNS;
  protected readonly selection = signal<unknown[]>([]);
  protected readonly last = signal<string | null>(null);

  protected export(ids: unknown[]): void {
    this.last.set(`Exportar ${ids.length}`);
  }

  protected remove(ids: unknown[]): void {
    this.last.set(`Eliminar ${ids.length}`);
    this.selection.set([]);
  }
}
