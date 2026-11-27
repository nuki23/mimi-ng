import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiBadge } from '@/components/ui/badge';
import type { MimiBadgeTone } from '@/components/ui/badge';

@Component({
  selector: 'app-badge-demo-example',
  imports: [MimiBadge],
  template: `
    <ul class="flex w-full max-w-sm flex-col divide-y rounded-card border text-sm">
      @for (order of orders; track order.id) {
        <li class="flex items-center justify-between gap-3 px-4 py-3">
          <span class="font-medium">Pedido #{{ order.id }}</span>
          <span mimiBadge variant="soft" [tone]="order.tone">{{ order.status }}</span>
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeDemoExample {
  protected readonly orders: { id: number; status: string; tone: MimiBadgeTone }[] = [
    { id: 1042, status: 'Entregado', tone: 'success' },
    { id: 1043, status: 'En camino', tone: 'info' },
    { id: 1044, status: 'Pago pendiente', tone: 'warning' },
    { id: 1045, status: 'Cancelado', tone: 'danger' },
  ];
}
