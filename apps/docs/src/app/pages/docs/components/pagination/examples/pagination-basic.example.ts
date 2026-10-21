import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiPagination } from '@/components/ui/pagination';

@Component({
  selector: 'app-pagination-basic-example',
  imports: [MimiPagination],
  template: `
    <div class="flex flex-col items-center gap-3">
      <!-- total es el número de registros: 120 de 10 en 10 son 12 páginas. -->
      <mimi-pagination [(page)]="page" [total]="120" />
      <p class="text-sm text-muted-foreground">Página {{ page() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationBasicExample {
  protected readonly page = signal(1);
}
