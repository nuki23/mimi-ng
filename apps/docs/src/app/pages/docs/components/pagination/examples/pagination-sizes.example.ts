import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiPagination } from '@/components/ui/pagination';

@Component({
  selector: 'app-pagination-sizes-example',
  imports: [MimiPagination],
  template: `
    <div class="flex flex-col items-center gap-6">
      <!-- sm (por defecto): 40px de alto, nunca más que una fila de la tabla. -->
      <mimi-pagination aria-label="Paginación pequeña" [(page)]="page" [total]="240" />
      <!-- md: 50px de alto, con el alto de control de Button e Input. -->
      <mimi-pagination
        aria-label="Paginación del tamaño normal"
        size="md"
        [(page)]="page"
        [total]="240"
      />
      <!-- lg: 60px de alto. -->
      <mimi-pagination aria-label="Paginación grande" size="lg" [(page)]="page" [total]="240" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationSizesExample {
  protected readonly page = signal(3);
}
