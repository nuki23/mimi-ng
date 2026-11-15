import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCard } from '@/components/ui/card';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiInput } from '@/components/ui/input';
import {
  MIMI_PAGINATION_TEXT_ES,
  MimiPagination,
  provideMimiPaginationText,
} from '@/components/ui/pagination';
import { MimiTableImports, mimiTableState } from '@/components/ui/table';

const CITIES = ['Bogotá', 'Lima', 'Quito', 'Santiago', 'Montevideo', 'Asunción'];
const PEOPLE = CITIES.flatMap((city, i) => [
  { id: i * 2 + 1, name: `Ana ${i + 1}`, city },
  { id: i * 2 + 2, name: `Luis ${i + 1}`, city },
]);

@Component({
  selector: 'app-table-state-example',
  imports: [MimiTableImports, MimiCard, MimiCheckbox, MimiInput, MimiPagination],
  providers: [provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES)],
  template: `
    <div class="flex w-full flex-col gap-3">
      <input
        mimiInput
        type="search"
        aria-label="Buscar por nombre o ciudad"
        placeholder="Buscar…"
        class="max-w-xs"
        [value]="table.query()"
        (input)="table.search($any($event.target).value)"
      />
      <div mimiCard class="overflow-x-auto">
        <table mimiTable aria-label="Personas">
          <thead mimiThead>
            <tr>
              <th mimiTh class="w-11">
                <mimi-checkbox
                  aria-label="Elegir las de esta página"
                  [checked]="table.pageSelection() === 'all'"
                  [indeterminate]="table.pageSelection() === 'some'"
                  (checkedChange)="table.togglePage($event)"
                />
              </th>
              <th mimiTh [sort]="table.sort('name')">Nombre</th>
              <th mimiTh [sort]="table.sort('city')">Ciudad</th>
            </tr>
          </thead>
          <tbody mimiTbody>
            @for (row of table.rows(); track row.id) {
              <tr mimiTr [selected]="row.selected()">
                <td mimiTd>
                  <mimi-checkbox
                    [aria-label]="'Elegir a ' + row.data.name"
                    [checked]="row.selected()"
                    (checkedChange)="row.toggleSelected($event)"
                  />
                </td>
                <td mimiTd>{{ row.data.name }}</td>
                <td mimiTd>{{ row.data.city }}</td>
              </tr>
            } @empty {
              <tr mimiTr>
                <td mimiTd colspan="3" class="text-muted-foreground">Sin resultados.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p role="status" class="text-sm text-muted-foreground">
        {{ table.count() }} resultados · {{ table.selection().length }} elegidas
      </p>
      <mimi-pagination [(page)]="table.page" [pageSize]="5" [total]="table.count()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableStateExample {
  protected readonly table = mimiTableState(PEOPLE, { columns: ['name', 'city'], pageSize: 5 });
}
