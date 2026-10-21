import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { type MimiPaginationEvent, MimiPagination } from '@/components/ui/pagination';

@Component({
  selector: 'app-pagination-controlled-example',
  imports: [MimiPagination, MimiButton],
  template: `
    <div class="flex flex-col items-center gap-4">
      <mimi-pagination [(page)]="page" [total]="300" (paginate)="last.set($event)" />
      <div class="flex flex-wrap justify-center gap-2">
        <button mimiBtn variant="outline" size="sm" (click)="page.set(1)">Primera</button>
        <button mimiBtn variant="outline" size="sm" (click)="page.set(15)">Ir a la 15</button>
        <button mimiBtn variant="outline" size="sm" (click)="page.set(30)">Última</button>
      </div>
      <p class="text-sm text-muted-foreground">
        Página {{ page() }} ·
        @if (last(); as event) {
          (paginate): página {{ event.page }}, {{ event.pageSize }} por página
        } @else {
          los cambios desde fuera no emiten (paginate)
        }
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationControlledExample {
  protected readonly page = signal(1);
  protected readonly last = signal<MimiPaginationEvent | null>(null);
}
