import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MimiPagination } from '@/components/ui/pagination';
import { CLIENTS, STATUS_CLASSES } from './clients';

@Component({
  selector: 'app-pagination-floating-example',
  imports: [MimiPagination],
  template: `
    <!-- variant="floating" solo pone la sombra; la posición va en class. -->
    <div class="relative h-[330px] w-full overflow-hidden rounded-card border bg-card">
      <!-- La tabla deja libre el espacio final para que la paginación no tape la última fila. -->
      <div class="absolute inset-0 overflow-auto pb-[72px]">
        <table class="w-full text-left text-[13.5px]">
          <thead class="sticky top-0 bg-muted text-[12.5px] text-muted-foreground">
            <tr>
              <th scope="col" class="h-10 px-4 font-semibold">Cliente</th>
              <th scope="col" class="h-10 px-4 font-semibold">Estado</th>
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
              </tr>
            }
          </tbody>
        </table>
      </div>
      <mimi-pagination
        variant="floating"
        class="absolute bottom-4 left-1/2 -translate-x-1/2"
        aria-label="Paginación de clientes"
        [(page)]="page"
        [total]="clients.length"
        [pageSize]="pageSize"
      />
    </div>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationFloatingExample {
  protected readonly clients = CLIENTS;
  protected readonly statusClasses = STATUS_CLASSES;
  protected readonly pageSize = 8;
  protected readonly page = signal(1);
  protected readonly rows = computed(() =>
    this.clients.slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );
}
