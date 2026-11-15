import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCard } from '@/components/ui/card';
import { MimiTableImports, mimiTableState } from '@/components/ui/table';

const ORDERS = [
  {
    id: 1,
    client: 'Hotel Brisa',
    items: ['12 sábanas', '30 toallas'],
    note: 'Entrega en recepción.',
  },
  { id: 2, client: 'Café Altura', items: ['5 kg de café'], note: 'Por la puerta de atrás.' },
  { id: 3, client: 'Clínica Sol', items: ['40 batas', '2 cajas de guantes'], note: 'Urgente.' },
];

@Component({
  selector: 'app-table-expand-example',
  imports: [MimiTableImports, MimiCard, MimiButton],
  template: `
    <div mimiCard class="w-full overflow-x-auto">
      <table mimiTable aria-label="Pedidos">
        <thead mimiThead>
          <tr>
            <th mimiTh>Cliente</th>
            <th mimiTh>Artículos</th>
            <th mimiTh align="end"><span class="sr-only">Detalle</span></th>
          </tr>
        </thead>
        <tbody mimiTbody>
          @for (row of table.rows(); track row.id) {
            <tr mimiTr>
              <td mimiTd class="font-medium">{{ row.data.client }}</td>
              <td mimiTd>{{ row.data.items.length }}</td>
              <td mimiTd align="end">
                <button
                  mimiBtn
                  variant="ghost"
                  size="sm"
                  mimiRowToggle
                  [row]="row"
                  [controls]="'pedido-' + row.id"
                >
                  {{ row.expanded() ? 'Ocultar' : 'Ver' }}
                  <span class="sr-only">el pedido de {{ row.data.client }}</span>
                </button>
              </td>
            </tr>
            @if (row.expanded()) {
              <tr mimiTr>
                <td mimiTd colspan="3" class="h-auto bg-muted py-3" [id]="'pedido-' + row.id">
                  <ul class="list-disc ps-5">
                    @for (item of row.data.items; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                  <p class="mt-1 text-muted-foreground">{{ row.data.note }}</p>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableExpandExample {
  // Una sola fila abierta a la vez.
  protected readonly table = mimiTableState(ORDERS, { expandMode: 'single' });
}
