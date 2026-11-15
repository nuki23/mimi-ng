import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiDataTableImports } from '@/components/ui/data-table';
import { COLUMNS, CUSTOMERS, STATUS_CLASSES } from './customers';

@Component({
  selector: 'app-data-table-cells-example',
  imports: [MimiDataTableImports],
  template: `
    <mimi-data-table
      aria-label="Clientes"
      searchPlaceholder="Buscar cliente, correo o plan…"
      [data]="customers"
      [columns]="columns"
      [pageSizeOptions]="[5, 10, 25]"
      [pageSize]="5"
      class="w-full"
    >
      <ng-template mimiTableCell="company" let-row>
        <span class="flex min-w-0 flex-col leading-[1.3]">
          <span class="truncate font-semibold">{{ row.company }}</span>
          <span class="truncate text-[12.5px] text-muted-foreground">{{ row.email }}</span>
        </span>
      </ng-template>
      <ng-template mimiTableCell="status" let-row>
        <span
          class="inline-flex h-[22px] items-center rounded-full px-[9px] text-xs font-semibold"
          [class]="statusClasses[row.status]"
          >{{ row.status }}</span
        >
      </ng-template>
      <ng-template mimiTableCell="mrr" let-row>
        <span class="font-semibold">\${{ row.mrr.toLocaleString('en-US') }}</span>
      </ng-template>
    </mimi-data-table>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableCellsExample {
  protected readonly customers = CUSTOMERS;
  protected readonly columns = COLUMNS;
  protected readonly statusClasses = STATUS_CLASSES;
}
