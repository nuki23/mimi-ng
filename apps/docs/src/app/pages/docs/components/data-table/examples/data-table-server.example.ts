import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import {
  MimiDataTableImports,
  type MimiTableFilters,
  type MimiTableSort,
} from '@/components/ui/data-table';
import { COLUMNS, type Customer } from './customers';
import { type CustomersQuery, fetchCustomers } from './customers-server';

@Component({
  selector: 'app-data-table-server-example',
  imports: [MimiDataTableImports],
  template: `
    <mimi-data-table
      aria-label="Clientes del servidor"
      searchPlaceholder="Buscar cliente…"
      [data]="rows()"
      [total]="total()"
      [loading]="loading()"
      [columns]="columns"
      [pageSizeOptions]="[5, 10]"
      [(query)]="query"
      [(sort)]="sort"
      [(filters)]="filters"
      [(page)]="page"
      [(pageSize)]="pageSize"
      class="w-full"
    />
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableServerExample {
  protected readonly columns = COLUMNS;
  protected readonly query = signal('');
  protected readonly sort = signal<MimiTableSort | null>(null);
  protected readonly filters = signal<MimiTableFilters>({});
  protected readonly page = signal(1);
  protected readonly pageSize = signal(5);
  protected readonly rows = signal<Customer[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);

  private readonly request = computed<CustomersQuery>(() => ({
    query: this.query(),
    sort: this.sort(),
    filters: this.filters(),
    page: this.page(),
    pageSize: this.pageSize(),
  }));

  /** Cada cambio pide la página otra vez; mientras llega, la tabla muestra el esqueleto. */
  private readonly load = effect((onCleanup) => {
    let stale = false;
    onCleanup(() => (stale = true));
    this.loading.set(true);
    fetchCustomers(this.request()).then(({ rows, total }) => {
      if (stale) return;
      this.rows.set(rows);
      this.total.set(total);
      this.loading.set(false);
    });
  });
}
