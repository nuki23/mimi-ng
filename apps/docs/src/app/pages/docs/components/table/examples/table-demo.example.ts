import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCard } from '@/components/ui/card';
import { MimiTableImports, mimiTableState } from '@/components/ui/table';

const INVOICES = [
  { id: 'F-1041', client: 'Hotel Brisa', amount: 1250, paid: true },
  { id: 'F-1042', client: 'Café Altura', amount: 380, paid: false },
  { id: 'F-1043', client: 'Taller Motor', amount: 2140, paid: true },
  { id: 'F-1044', client: 'Editorial Faro', amount: 96, paid: false },
];

@Component({
  selector: 'app-table-demo-example',
  imports: [MimiTableImports, MimiCard],
  template: `
    <div mimiCard class="w-full overflow-x-auto">
      <table mimiTable>
        <caption mimiCaption>
          Facturas de noviembre
        </caption>
        <thead mimiThead>
          <tr>
            <th mimiTh [sort]="table.sort('id')">Factura</th>
            <th mimiTh [sort]="table.sort('client')">Cliente</th>
            <th mimiTh>Estado</th>
            <th mimiTh align="end" [sort]="table.sort('amount')">Importe</th>
          </tr>
        </thead>
        <tbody mimiTbody>
          @for (row of table.rows(); track row.id) {
            <tr mimiTr>
              <td mimiTd class="font-medium">{{ row.data.id }}</td>
              <td mimiTd>{{ row.data.client }}</td>
              <td mimiTd>
                @if (row.data.paid) {
                  <span class="text-success-soft-foreground">Pagada</span>
                } @else {
                  <span class="text-warning-soft-foreground">Pendiente</span>
                }
              </td>
              <td mimiTd align="end">{{ row.data.amount }} €</td>
            </tr>
          }
          <tr mimiTr>
            <th mimiTh scope="row" colspan="3">Total</th>
            <td mimiTd align="end" class="font-semibold">{{ total }} €</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDemoExample {
  protected readonly table = mimiTableState(INVOICES, { columns: ['id', 'client', 'amount'] });
  protected readonly total = INVOICES.reduce((sum, invoice) => sum + invoice.amount, 0);
}
