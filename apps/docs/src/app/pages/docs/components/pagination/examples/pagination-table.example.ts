import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MimiPagination } from '@/components/ui/pagination';
import { CLIENTS, STATUS_CLASSES } from './clients';

@Component({
  selector: 'app-pagination-table-example',
  imports: [MimiPagination],
  template: `
    <div class="flex w-full flex-col gap-3">
      <div class="overflow-x-auto rounded-card border bg-card">
        <table class="w-full text-left text-[13.5px]">
          <thead class="bg-muted text-[12.5px] text-muted-foreground">
            <tr>
              <th scope="col" class="h-10 px-4 font-semibold">Cliente</th>
              <th scope="col" class="h-10 px-4 font-semibold">Estado</th>
              <th scope="col" class="h-10 px-4 text-right font-semibold">MRR</th>
            </tr>
          </thead>
          <tbody>
            @for (client of rows(); track client.name) {
              <tr class="h-11 border-t">
                <td class="px-4 font-semibold">{{ client.name }}</td>
                <td class="px-4">
                  <span
                    class="inline-flex h-[22px] items-center rounded-full px-[9px] text-xs font-semibold"
                    [class]="statusClasses[client.status]"
                    >{{ client.status }}</span
                  >
                </td>
                <td class="px-4 text-right tabular-nums">
                  \${{ client.mrr.toLocaleString('en-US') }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="text-[13px] text-muted-foreground tabular-nums">
          Mostrando {{ from() }}–{{ to() }} de {{ clients.length }}
        </span>
        <mimi-pagination
          aria-label="Paginación de clientes"
          [(page)]="page"
          [(pageSize)]="pageSize"
          [total]="clients.length"
          [pageSizeOptions]="[5, 10, 25]"
        />
      </div>
    </div>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationTableExample {
  protected readonly clients = CLIENTS;
  protected readonly statusClasses = STATUS_CLASSES;
  protected readonly page = signal(1);
  protected readonly pageSize = signal(5);
  protected readonly rows = computed(() =>
    this.clients.slice((this.page() - 1) * this.pageSize(), this.page() * this.pageSize()),
  );
  protected readonly from = computed(() => (this.page() - 1) * this.pageSize() + 1);
  protected readonly to = computed(() =>
    Math.min(this.page() * this.pageSize(), this.clients.length),
  );
}
