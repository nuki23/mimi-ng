import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDataTableImports } from '@/components/ui/data-table';
import { COLUMNS, CUSTOMERS } from './customers';

@Component({
  selector: 'app-data-table-phone-example',
  imports: [MimiDataTableImports, MimiButton],
  template: `
    <!-- Debajo de 640 px: cada fila, una tarjeta (mobile="stack", el de siempre); la búsqueda,
         los filtros y el orden, en una hoja. mobile="scroll" deja la tabla con scroll lateral. -->
    <mimi-data-table
      aria-label="Clientes en el teléfono"
      selectable
      mobile="stack"
      [data]="customers"
      [columns]="columns"
      [pageSize]="4"
      [(selection)]="selection"
      class="w-full"
    >
      <ng-template mimiTableDetail let-row>
        <span class="text-[13.5px] text-muted-foreground">{{ row.email }}</span>
      </ng-template>
      <ng-template mimiTableActions let-row>
        <button type="button" mimiBtn variant="ghost" size="sm" (click)="last.set(row.company)">
          Abrir
        </button>
      </ng-template>
    </mimi-data-table>
    <p class="mt-3 text-sm text-muted-foreground" aria-live="polite">
      Abierto: <span class="font-medium text-foreground">{{ last() ?? '—' }}</span>
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTablePhoneExample {
  protected readonly customers = CUSTOMERS;
  protected readonly columns = COLUMNS;
  protected readonly selection = signal<unknown[]>([]);
  protected readonly last = signal<string | null>(null);
}
