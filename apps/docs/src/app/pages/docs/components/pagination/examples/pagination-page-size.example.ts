import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MimiPagination } from '@/components/ui/pagination';

@Component({
  selector: 'app-pagination-page-size-example',
  imports: [MimiPagination],
  template: `
    <div class="flex flex-col items-center gap-3">
      <!-- Al cambiar el tamaño, se sigue viendo el primer registro que estaba visible. -->
      <mimi-pagination
        [(page)]="page"
        [(pageSize)]="pageSize"
        [total]="total"
        [pageSizeOptions]="[10, 25, 50, 100]"
      />
      <p class="text-sm text-muted-foreground tabular-nums">
        Mostrando {{ from() }}–{{ to() }} de {{ total }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationPageSizeExample {
  protected readonly total = 240;
  protected readonly page = signal(3);
  protected readonly pageSize = signal(10);
  protected readonly from = computed(() => (this.page() - 1) * this.pageSize() + 1);
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total));
}
