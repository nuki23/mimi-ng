import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCard } from '@/components/ui/card';
import { MimiTableImports } from '@/components/ui/table';

const ORDERS = [
  { id: 'P-201', client: 'Hotel Brisa', date: '12 nov', total: '1.250 €' },
  { id: 'P-202', client: 'Café Altura', date: '14 nov', total: '380 €' },
  { id: 'P-203', client: 'Taller Motor', date: '15 nov', total: '2.140 €' },
];

@Component({
  selector: 'app-table-phone-example',
  imports: [MimiTableImports, MimiCard],
  template: `
    <div class="grid w-full gap-4 md:grid-cols-2">
      <!-- scroll (por defecto): scroll lateral con la primera columna fija. El contenedor que se
           desliza, con foco y nombre para recorrerlo con el teclado. -->
      <div mimiCard class="overflow-x-auto" tabindex="0" role="region" aria-label="Pedidos">
        <table mimiTable aria-label="Pedidos (scroll)">
          <thead mimiThead>
            <tr>
              <th mimiTh>Pedido</th>
              <th mimiTh>Cliente</th>
              <th mimiTh>Fecha</th>
              <th mimiTh align="end">Total</th>
            </tr>
          </thead>
          <tbody mimiTbody>
            @for (order of orders; track order.id) {
              <tr mimiTr>
                <td mimiTd class="font-medium">{{ order.id }}</td>
                <td mimiTd>{{ order.client }}</td>
                <td mimiTd>{{ order.date }}</td>
                <td mimiTd align="end">{{ order.total }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <!-- stack: cada fila, una tarjeta con «etiqueta: valor» (las etiquetas, de los th). -->
      <table mimiTable mobile="stack" aria-label="Pedidos (stack)">
        <thead mimiThead>
          <tr>
            <th mimiTh>Pedido</th>
            <th mimiTh>Cliente</th>
            <th mimiTh>Fecha</th>
            <th mimiTh align="end">Total</th>
          </tr>
        </thead>
        <tbody mimiTbody>
          @for (order of orders; track order.id) {
            <tr mimiTr>
              <td mimiTd class="font-medium">{{ order.id }}</td>
              <td mimiTd>{{ order.client }}</td>
              <td mimiTd>{{ order.date }}</td>
              <td mimiTd align="end">{{ order.total }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePhoneExample {
  protected readonly orders = ORDERS;
}
