import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCard } from '@/components/ui/card';
import { MimiTableImports } from '@/components/ui/table';

@Component({
  selector: 'app-table-sizes-example',
  imports: [MimiTableImports, MimiCard],
  template: `
    <div class="grid w-full gap-4 lg:grid-cols-3">
      @for (size of sizes; track size) {
        <div mimiCard class="overflow-x-auto">
          <table mimiTable [size]="size">
            <thead mimiThead>
              <tr>
                <th mimiTh>Tamaño {{ size }}</th>
                <th mimiTh align="end">Usuarios</th>
              </tr>
            </thead>
            <tbody mimiTbody>
              @for (row of rows; track row.name) {
                <tr mimiTr>
                  <td mimiTd>{{ row.name }}</td>
                  <td mimiTd align="end">{{ row.users }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSizesExample {
  protected readonly sizes = ['sm', 'md', 'lg'] as const;
  protected readonly rows = [
    { name: 'Diseño', users: 4 },
    { name: 'Ventas', users: 12 },
  ];
}
